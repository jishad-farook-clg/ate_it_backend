from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import User, Address, Wallet, Transaction, State, District, City
from restaurant_app.models import RestaurantProfile, FoodItem, Order, OrderItem
from customer_app.models import Issue
import random
from decimal import Decimal
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seeds the database with comprehensive initial data'

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
        restaurant_data = [
            ('Spicy Treat', 'Authentic Indian Spices', '560001'), 
            ('Green Bowl', 'Healthy Salads & Vegan', '560002'), 
            ('Burger Hub', 'Juicy Burgers & Fries', '560003'),
            ('Pizza Paradise', 'Cheesy Delights', '560004'),
            ('Sushi Spot', 'Fresh Japanese Cuisine', '560005')
        ]
        
        restaurants = []
        for i, (name, desc, pincode) in enumerate(restaurant_data):
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
                    postal_code=pincode
                )

                # Profile
                rest_profile = RestaurantProfile.objects.create(
                    user=user,
                    restaurant_name=name,
                    description=desc,
                    is_open=True,
                    is_approved=True,
                    address=addr,
                    account_number=f'ACC{i}123456',
                    ifsc_code='HDFC0001234',
                    bank_name='HDFC Bank'
                )
                restaurants.append(rest_profile)
                
                # Food Items
                items = [
                    ('Biryani', 250), ('Burger', 150), ('Salad', 200), 
                    ('Pizza', 300), ('Sushi', 400), ('Pasta', 220),
                    ('Tacos', 180), ('Sandwich', 120)
                ]
                # Randomly select 5 items for each restaurant
                selected_items = random.sample(items, 5)
                
                for fname, price in selected_items:
                    FoodItem.objects.create(
                        restaurant=rest_profile,
                        name=f'{name} {fname}',
                        description=f'Delicious {fname} prepared fresh.',
                        price=price * 0.8, # Discounted
                        original_price=price,
                        quantity=random.randint(5, 50),
                        is_available=True
                    )
                self.stdout.write(f'Restaurant {name} created')
            else:
                restaurants.append(RestaurantProfile.objects.get(user__username=username))

        # 3. Customers
        customer_names = ['alice', 'bob', 'charlie', 'david', 'eve']
        customers = []
        for name in customer_names:
            if not User.objects.filter(username=name).exists():
                user = User.objects.create_user(name, f'{name}@ateit.local', 'password')
                user.role = User.Role.CUSTOMER
                user.save()
                
                # Wallet with Money
                wallet = Wallet.objects.create(user=user, balance=Decimal('5000.00'))
                
                # Transaction history
                Transaction.objects.create(
                    wallet=wallet,
                    amount=Decimal('5000.00'),
                    transaction_type=Transaction.TransactionType.CREDIT,
                    status=Transaction.Status.COMPLETED,
                    description='Initial Wallet Load'
                )
                
                Address.objects.create(
                    user=user,
                    state=state.name,
                    district=district.name,
                    city=city.name,
                    street_address=f'{random.randint(100,999)} Home Street',
                    postal_code='560001',
                    is_default=True
                )
                customers.append(user)
                self.stdout.write(f'Customer {name} created')
            else:
                customers.append(User.objects.get(username=name))

        # 4. Create Random Orders
        self.stdout.write('Creating dummy orders...')
        statuses = [Order.Status.COMPLETED, Order.Status.PENDING, Order.Status.CANCELLED]
        
        for _ in range(20): # Create 20 random orders
            customer = random.choice(customers)
            restaurant = random.choice(restaurants)
            
            # Select items
            food_items = list(FoodItem.objects.filter(restaurant=restaurant))
            if not food_items: continue
            
            order_items_selection = random.sample(food_items, random.randint(1, 3))
            
            total_amount = Decimal('0.00')
            order = Order.objects.create(
                customer=customer,
                restaurant=restaurant,
                status=random.choice(statuses),
                total_amount=Decimal('0.00'), # Will update
                platform_fee=Decimal('10.00'),
                delivery_fee=Decimal('30.00')
            )
            
            items_total = Decimal('0.00')
            for item in order_items_selection:
                qty = random.randint(1, 2)
                price = item.price
                items_total += price * qty
                OrderItem.objects.create(
                    order=order,
                    food_item=item,
                    quantity=qty,
                    price=price
                )
            
            order.total_amount = items_total + order.platform_fee + order.delivery_fee
            order.save()
            
            # If completed, create transaction deduction
            if order.status == Order.Status.COMPLETED:
                Transaction.objects.create(
                    wallet=customer.wallet,
                    amount=order.total_amount,
                    transaction_type=Transaction.TransactionType.DEBIT,
                    status=Transaction.Status.COMPLETED,
                    description=f'Payment for Order #{order.id}'
                )

        # 5. Create Issues
        self.stdout.write('Creating dummy issues...')
        for _ in range(5):
            customer = random.choice(customers)
            order = Order.objects.filter(customer=customer).first()
            if order:
                Issue.objects.create(
                    customer=customer,
                    order=order,
                    title='Late Delivery',
                    description='The food arrived cold and late.',
                    status=Issue.Status.OPEN
                )

        self.stdout.write(self.style.SUCCESS('Data seeded successfully!'))
