from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction as db_transaction
from django.db.models import Sum

from core.models import User, Wallet, Transaction
from core.permissions import IsRestaurant
from .models import RestaurantProfile, FoodItem, Order
from .serializers import RestaurantProfileSerializer, FoodItemSerializer, OrderSerializer

class RestaurantOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsRestaurant]
    serializer_class = OrderSerializer

    def get_queryset(self):
        # Filter strictly for this restaurant
        return Order.objects.filter(restaurant__user=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')

        if new_status not in [Order.Status.COMPLETED, Order.Status.CANCELLED]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        if order.status != Order.Status.PENDING:
             return Response({'error': 'Order already processed'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with db_transaction.atomic():
                order.status = new_status
                order.save()

                if new_status == Order.Status.COMPLETED:
                    # Calculate payout
                    total = order.total_amount
                    platform_fee = total * 0.30
                    restaurant_payout = total * 0.70

                    # Credit Restaurant Wallet
                    # Only if Restaurant has a wallet (should have created one on signup? or lazily?)
                    # Let's assume restaurant user has a wallet
                    # But wait, RestaurantProfile is OneToOne with User
                    # Wallet is OneToOne with User
                    # So restaurant.user.wallet exists.
                    
                    restaurant_wallet = Wallet.objects.select_for_update().get(user=order.restaurant.user)
                    restaurant_wallet.balance += restaurant_payout
                    restaurant_wallet.save()

                    Transaction.objects.create(
                        wallet=restaurant_wallet,
                        amount=restaurant_payout,
                        transaction_type=Transaction.TransactionType.PAYOUT,
                        status=Transaction.Status.COMPLETED,
                        description=f"Payout for Order #{order.order_id}"
                    )
                    
                    # Credit Platform Commission (Admin Wallet or separate account)
                    # We can use a special Admin User Wallet for this
                    # Or just log it in Transaction with a generic system wallet if needed.
                    # For now, just logging:
                    # Find Admin User
                    admin_user = User.objects.filter(role=User.Role.ADMIN).first()
                    if admin_user:
                         admin_wallet, _ = Wallet.objects.get_or_create(user=admin_user)
                         admin_wallet.balance += platform_fee
                         admin_wallet.save()
                         
                         Transaction.objects.create(
                             wallet=admin_wallet,
                             amount=platform_fee,
                             transaction_type=Transaction.TransactionType.COMMISSION,
                             status=Transaction.Status.COMPLETED,
                             description=f"Commission for Order #{order.order_id}"
                         )

                elif new_status == Order.Status.CANCELLED:
                    # Refund User
                    customer_wallet = Wallet.objects.select_for_update().get(user=order.customer)
                    customer_wallet.balance += order.total_amount
                    customer_wallet.save()

                    Transaction.objects.create(
                        wallet=customer_wallet,
                        amount=order.total_amount,
                        transaction_type=Transaction.TransactionType.REFUND,
                        status=Transaction.Status.COMPLETED,
                        description=f"Refund for Order #{order.order_id}"
                    )
                    
                    # Also restore stock?
                    for item in order.items.all():
                        food_item = item.food_item
                        food_item.quantity += item.quantity
                        food_item.save()

            return Response(OrderSerializer(order).data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RestaurantFoodItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsRestaurant]
    serializer_class = FoodItemSerializer

    def get_queryset(self):
        return FoodItem.objects.filter(restaurant__user=self.request.user)

    def perform_create(self, serializer):
        restaurant_profile = self.request.user.restaurant_profile
        serializer.save(restaurant=restaurant_profile)

class RestaurantProfileViewSet(viewsets.GenericViewSet, viewsets.mixins.RetrieveModelMixin, viewsets.mixins.UpdateModelMixin):
    permission_classes = [IsRestaurant]
    serializer_class = RestaurantProfileSerializer
    
    def get_object(self):
         return self.request.user.restaurant_profile
