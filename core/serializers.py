from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import Address, Wallet, Transaction

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number', 'first_name', 'last_name', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'role', 'is_staff', 'is_superuser']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, default='CUSTOMER')
    restaurant_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone_number', 'first_name', 'last_name', 'role', 'restaurant_name']

    def create(self, validated_data):
        role = validated_data.pop('role', 'CUSTOMER')
        restaurant_name = validated_data.pop('restaurant_name', None)
        
        user = User.objects.create_user(**validated_data)
        user.role = role
        user.save()

        if role == 'RESTAURANT' and restaurant_name:
            from restaurant_app.models import RestaurantProfile
            RestaurantProfile.objects.create(user=user, restaurant_name=restaurant_name)
            
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        user = authenticate(username=obj['username'], password=obj['password'])
        if user:
            return UserSerializer(user).data
        return None

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return {'user': user}
        raise serializers.ValidationError("Incorrect Credentials")

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user']

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['balance', 'updated_at']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

from .models import State, District, City

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = '__all__'
