from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Q
from django.db import models
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from core.permissions import IsAdmin, IsRestaurant
from restaurant_app.models import Order, RestaurantProfile, FoodItem

class AnalyticsViewSet(viewsets.ViewSet):
    # Base class, permissions handled in methods or subclasses
    pass

class AdminAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    @action(detail=False, methods=['get'])
    def sales_report(self, request):
        period = request.query_params.get('period', 'daily') # daily, weekly, monthly
        
        trunc_func = {
            'daily': TruncDay,
            'weekly': TruncWeek,
            'monthly': TruncMonth
        }.get(period, TruncDay)

        sales_data = Order.objects.filter(status=Order.Status.COMPLETED)\
            .annotate(period=trunc_func('created_at'))\
            .values('period')\
            .annotate(total_sales=Sum('total_amount'), total_orders=Count('id'))\
            .order_by('-period')
            
        from decimal import Decimal
        # Add commission profit (30%)
        result = []
        for item in sales_data:
            item['total_profit'] = (item['total_sales'] * Decimal('0.30')).quantize(Decimal('0.01'))
            result.append(item)

        return Response(result)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        from decimal import Decimal
        # Restaurant name, total sales, total profit (30% of sales)
        data = RestaurantProfile.objects.annotate(
            total_sales=Sum('orders__total_amount', filter=models.Q(orders__status=Order.Status.COMPLETED))
        ).order_by('-total_sales')[:10]
        
        # Need to serializer or manually construct
        result = []
        for rest in data:
            sales = rest.total_sales or Decimal('0.00')
            result.append({
                'restaurant': rest.restaurant_name,
                'total_sales': sales,
                'platform_profit': (sales * Decimal('0.30')).quantize(Decimal('0.01'))
            })
        return Response(result)

class RestaurantAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsRestaurant]

    @action(detail=False, methods=['get'])
    def sales_report(self, request):
        from decimal import Decimal
        period = request.query_params.get('period', 'daily')
        restaurant = request.user.restaurant_profile
        
        trunc_func = {
            'daily': TruncDay,
            'weekly': TruncWeek,
            'monthly': TruncMonth
        }.get(period, TruncDay)

        sales_data = Order.objects.filter(restaurant=restaurant, status=Order.Status.COMPLETED)\
            .annotate(period=trunc_func('created_at'))\
            .values('period')\
            .annotate(total_sales=Sum('total_amount'), total_orders=Count('id'))\
            .order_by('-period')
        
        # Add profit (70%)
        result = []
        for item in sales_data:
            sales = item['total_sales'] or Decimal('0.00')
            item['total_profit'] = (sales * Decimal('0.70')).quantize(Decimal('0.01'))
            result.append(item)

        return Response(result)
    @action(detail=False, methods=['get'])
    def stats(self, request):
        from decimal import Decimal
        restaurant = request.user.restaurant_profile
        
        # Total Revenue (Completed Orders sum)
        total_revenue = Order.objects.filter(restaurant=restaurant, status=Order.Status.COMPLETED)\
            .aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        # Total Orders
        total_orders = Order.objects.filter(restaurant=restaurant).count()
        
        # Active Items
        active_items = FoodItem.objects.filter(restaurant=restaurant, is_available=True).count()
        
        # Pending Orders
        pending_orders = Order.objects.filter(restaurant=restaurant, status=Order.Status.PENDING).count()
        
        # Low Stock Items
        low_stock_items = FoodItem.objects.filter(restaurant=restaurant, quantity__lt=10).values('name', 'quantity')[:5]

        data = {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "active_items": active_items,
            "pending_orders": pending_orders,
            "low_stock_items": list(low_stock_items),
            "revenue_profit": (total_revenue * Decimal('0.70')).quantize(Decimal('0.01')), # Restaurant gets 70%
            "is_open": restaurant.is_open
        }
        return Response(data)
