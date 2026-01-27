from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta

from core.models import User, Wallet, Transaction
from core.permissions import IsAdmin
from restaurant_app.models import RestaurantProfile, Order
from customer_app.models import Issue
from .views_extra import AdminCustomerViewSet, AdminIssueViewSet # Import split views

class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        
        # Sales Stats
        total_orders = Order.objects.count()
        today_orders = Order.objects.filter(created_at__date=today).count()
        
        # Calculate Revenue (Platform Profit = 30% of Completed Orders)
        # Assuming we track Platform Commission via Transaction or Order calculation
        # Simplified: Sum of Transactions of type COMMISSION
        platform_profit = Transaction.objects.filter(
            transaction_type=Transaction.TransactionType.COMMISSION
        ).aggregate(total=Sum('amount'))['total'] or 0

        data = {
            "total_orders": total_orders,
            "today_orders": today_orders,
            "platform_profit": platform_profit,
        }
        return Response(data)

class AdminRestaurantViewSet(viewsets.ModelViewSet):
    # Only Admin can manage restaurants here
    permission_classes = [IsAdmin]
    queryset = RestaurantProfile.objects.all()
    # Serializer will be needed, defining inline or importing
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        restaurant = self.get_object()
        restaurant.is_approved = True
        restaurant.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        restaurant = self.get_object()
        restaurant.is_approved = False
        restaurant.save()
        return Response({'status': 'rejected'})

class AdminWalletViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    @action(detail=False, methods=['get'])
    def pending_topups(self, request):
        # Transaction Type TOPUP and Status PENDING
        transactions = Transaction.objects.filter(
            transaction_type=Transaction.TransactionType.TOPUP,
            status=Transaction.Status.PENDING
        )
        # Serialize list
        # using core.serializers.TransactionSerializer
        from core.serializers import TransactionSerializer
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve_topup(self, request, pk=None):
        try:
            transaction = Transaction.objects.get(pk=pk, status=Transaction.Status.PENDING)
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found or not pending'}, status=404)

        if transaction.transaction_type != Transaction.TransactionType.TOPUP:
            return Response({'error': 'Not a topup transaction'}, status=400)

        # Atomic transaction to update wallet
        from django.db import transaction as db_transaction
        with db_transaction.atomic():
            transaction.status = Transaction.Status.COMPLETED
            transaction.save()
            
            wallet = transaction.wallet
            wallet.balance += transaction.amount
            wallet.save()

        return Response({'status': 'approved', 'new_balance': wallet.balance})
