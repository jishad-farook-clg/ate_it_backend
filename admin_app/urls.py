from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminDashboardView, AdminRestaurantViewSet, AdminWalletViewSet, AdminCustomerViewSet, AdminIssueViewSet
from core.views_analytics import AdminAnalyticsViewSet

router = DefaultRouter()
router.register(r'restaurants', AdminRestaurantViewSet, basename='admin-restaurants')
router.register(r'customers', AdminCustomerViewSet, basename='admin-customers')
router.register(r'issues', AdminIssueViewSet, basename='admin-issues')
router.register(r'wallet', AdminWalletViewSet, basename='admin-wallet')
router.register(r'analytics', AdminAnalyticsViewSet, basename='admin-analytics')

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('', include(router.urls)),
]
