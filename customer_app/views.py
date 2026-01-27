from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404

from core.models import User, Wallet, Transaction
from core.permissions import IsCustomer
from restaurant_app.models import RestaurantProfile, FoodItem, Order, OrderItem
from .models import Issue
from .serializers import CreateOrderSerializer, IssueSerializer
from restaurant_app.serializers import OrderSerializer, RestaurantProfileSerializer, FoodItemSerializer # Added serializers

class CustomerRestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsCustomer]
    queryset = RestaurantProfile.objects.filter(is_approved=True)
    serializer_class = RestaurantProfileSerializer

    @action(detail=True, methods=['get'])
    def menu(self, request, pk=None):
        restaurant = self.get_object()
        food_items = FoodItem.objects.filter(restaurant=restaurant, is_available=True)
        serializer = FoodItemSerializer(food_items, many=True)
        return Response(serializer.data)

class CustomerIssueViewSet(viewsets.ModelViewSet):
    permission_classes = [IsCustomer]
    serializer_class = IssueSerializer

    def get_queryset(self):
        return Issue.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class CustomerOrderViewSet(viewsets.ViewSet):
    permission_classes = [IsCustomer]

    def list(self, request):
        orders = Order.objects.filter(customer=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            restaurant_id = data['restaurant_id']
            items_data = data['items']

            restaurant = get_object_or_404(RestaurantProfile, id=restaurant_id)
            
            total_amount = 0
            order_items_to_create = []

            try:
                with db_transaction.atomic():
                    # 1. Check Wallet Balance
                    customer_wallet = Wallet.objects.select_for_update().get(user=request.user)
                    
                    for item_data in items_data:
                        food_item = FoodItem.objects.select_for_update().get(id=item_data['food_item_id'])
                        if food_item.restaurant_id != restaurant_id:
                            raise ValueError(f"Item {food_item.name} does not belong to restaurant {restaurant.restaurant_name}")
                        
                        if food_item.quantity < item_data['quantity']:
                            raise ValueError(f"Insufficient stock for {food_item.name}")
                        
                        price = food_item.price
                        total_amount += price * item_data['quantity']
                        
                        # Decrease stock
                        food_item.quantity -= item_data['quantity']
                        food_item.save()
                        
                        order_items_to_create.append({
                            'food_item': food_item,
                            'quantity': item_data['quantity'],
                            'price': price
                        })

                    if customer_wallet.balance < total_amount:
                         raise ValueError("Insufficient wallet balance")

                    # 2. Deduct from Customer Wallet
                    customer_wallet.balance -= total_amount
                    customer_wallet.save()
                    
                    # 3. Create Transaction for Customer
                    Transaction.objects.create(
                        wallet=customer_wallet,
                        amount=total_amount,
                        transaction_type=Transaction.TransactionType.ORDER_PAYMENT,
                        status=Transaction.Status.COMPLETED,
                        description=f"Payment for Order at {restaurant.restaurant_name}"
                    )

                    # 4. Create Order
                    order = Order.objects.create(
                        customer=request.user,
                        restaurant=restaurant,
                        total_amount=total_amount,
                        status=Order.Status.PENDING 
                    )
                    
                    for item_dict in order_items_to_create:
                        OrderItem.objects.create(
                            order=order,
                            food_item=item_dict['food_item'],
                            quantity=item_dict['quantity'],
                            price_at_time_of_order=item_dict['price']
                        )
                    
                    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except FoodItem.DoesNotExist:
                 return Response({'error': "Food item not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                 return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
