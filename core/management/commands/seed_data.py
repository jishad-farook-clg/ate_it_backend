from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import User, Address, Wallet, State, District, City
from restaurant_app.models import RestaurantProfile, FoodItem
from customer_app.models import Issue
import random

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # 0. Locations
        state, _ = State.objects.get_or_create(name='Karnataka')
        district, _ = District.objects.get_or_create(name='Bangalore Urban', state=state)
        city, _ = City.objects.get_or_create(name='Bangalore', district=district)
        
        # 1. Admin User
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser('admin', 'admin@ateit.local', 'adminpass')
            admin.role = User.Role.ADMIN
            admin.save()
            Wallet.objects.create(user=admin)
            self.stdout.write('Admin user created')

        # 2. Restaurants
        restaurant_names = ['Spicy Treat', 'Green Bowl', 'Burger Hub']
        for i, name in enumerate(restaurant_names):
            username = f'restaurant{i+1}'
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(username, f'{username}@ateit.local', 'password')
                user.role = User.Role.RESTAURANT
                user.save()
                
                # Wallet
                Wallet.objects.create(user=user)
                
                # Address
                addr = Address.objects.create(
                    user=user,
                    state=state.name,
                    district=district.name,
                    city=city.name,
                    street_address=f'{i+10} Food Street',
                    postal_code='560001'
                )

                # Profile
                rest_profile = RestaurantProfile.objects.create(
                    user=user,
                    restaurant_name=name,
                    description=f'Best {name} in town',
                    is_open=True,
                    is_approved=True,
                    address=addr,
                    account_number=f'ACC{i}123456',
                    ifsc_code='HDFC0001234',
                    bank_name='HDFC Bank'
                )
                
                # Food Items
                items = [('Biryani', 250), ('Burger', 150), ('Salad', 200)]
                for fname, price in items:
                    FoodItem.objects.create(
                        restaurant=rest_profile,
                        name=f'{name} {fname}',
                        description='Delicious and fresh',
                        price=price * 0.7, # Discounted
                        original_price=price,
                        quantity=20
                    )
                self.stdout.write(f'Restaurant {name} created')

        # 3. Customers
        customer_names = ['alice', 'bob', 'charlie']
        for name in customer_names:
            if not User.objects.filter(username=name).exists():
                user = User.objects.create_user(name, f'{name}@ateit.local', 'password')
                user.role = User.Role.CUSTOMER
                user.save()
                
                # Wallet with Money
                wallet = Wallet.objects.create(user=user, balance=5000.00)
                
                Address.objects.create(
                    user=user,
                    state=state.name,
                    district=district.name,
                    city=city.name,
                    street_address=f'{random.randint(100,999)} Home Street',
                    postal_code='560001',
                    is_default=True
                )
                self.stdout.write(f'Customer {name} created')

        self.stdout.write(self.style.SUCCESS('Data seeded successfully!'))
