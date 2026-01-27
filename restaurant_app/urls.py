from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestaurantOrderViewSet, RestaurantFoodItemViewSet, RestaurantProfileViewSet

router = DefaultRouter()
router.register(r'orders', RestaurantOrderViewSet, basename='restaurant-orders')
router.register(r'food-items', RestaurantFoodItemViewSet, basename='restaurant-food-items')
# Profile is singleton-ish but using ViewSet for consistency or GenericAPIView
# Since it's /profile usually, we can map it manually or use ViewSet with list=curr_user?
# Or just use retrieving by ID?
# ViewSet 'retrieve' usually needs pk. 'list' is for collection.
# For singleton profile, we can use 'retrieve' without pk if we override get_object.
# But router expects pk.
# Better to use a specific path for profile.
from .views import RestaurantProfileViewSet
from core.views_analytics import RestaurantAnalyticsViewSet

urlpatterns = [
    path('profile/', RestaurantProfileViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}), name='restaurant-profile'),
    path('analytics/sales/', RestaurantAnalyticsViewSet.as_view({'get': 'sales_report'}), name='restaurant-sales-report'),
    path('', include(router.urls)),
]
