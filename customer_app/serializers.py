from rest_framework import serializers
from .models import Issue
from restaurant_app.models import FoodItem, Order

class OrderItemInputSerializer(serializers.Serializer):
    food_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class CreateOrderSerializer(serializers.Serializer):
    restaurant_id = serializers.IntegerField()
    items = OrderItemInputSerializer(many=True)

class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['customer', 'status', 'resolution_notes']
