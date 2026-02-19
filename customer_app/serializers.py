from rest_framework import serializers
from core.models import Transaction
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

class TopupRequestSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1)
    reference_id = serializers.CharField(max_length=100, required=False, allow_blank=True, help_text="UPI/Bank reference or transaction ID")
    description = serializers.CharField(required=False, allow_blank=True, help_text="Optional notes or payment proof details")
