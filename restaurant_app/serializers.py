from rest_framework import serializers
from .models import RestaurantProfile, FoodItem, Order, OrderItem
from core.serializers import UserSerializer

class RestaurantProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = RestaurantProfile
        fields = '__all__'
        read_only_fields = ['user', 'is_approved'] # User linked on creation, approval by Admin

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'
        read_only_fields = ['restaurant']

class OrderItemSerializer(serializers.ModelSerializer):
    food_item = FoodItemSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['food_item', 'quantity', 'price_at_time_of_order']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = UserSerializer(read_only=True)
    restaurant = RestaurantProfileSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
