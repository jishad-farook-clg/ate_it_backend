from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerOrderViewSet, CustomerIssueViewSet, CustomerRestaurantViewSet

router = DefaultRouter()
router.register(r'restaurants', CustomerRestaurantViewSet, basename='customer-restaurants')
router.register(r'orders', CustomerOrderViewSet, basename='customer-orders')
router.register(r'issues', CustomerIssueViewSet, basename='customer-issues')

urlpatterns = [
    path('', include(router.urls)),
]
