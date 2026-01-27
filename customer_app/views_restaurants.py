from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import RestaurantProfile, FoodItem
from .serializers import RestaurantProfileSerializer, FoodItemSerializer
from core.permissions import IsCustomer

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
