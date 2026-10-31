from decimal import Decimal
import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from catalog.models import Category, Product, ProductVariant
from inventory.models import InventoryRecord
from orders.models import Order, Coupon
from classes.models import CrochetClass, ClassSession, ClassBooking
from customizations.models import CustomizationRequest, CustomizationQuote
from accounts.models import AuthToken

User = get_user_model()


class SiHACraftStudioBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_superuser(
            email='admin@test.com',
            password='AdminPassword123!',
            username='admin_test'
        )
        self.admin_token = AuthToken.generate_token(self.admin)

        # Customer user
        self.customer = User.objects.create_user(
            email='customer@test.com',
            password='CustomerPassword123!',
            username='customer_test',
            first_name='Maya',
            last_name='Craft'
        )
        self.customer_token = AuthToken.generate_token(self.customer)

        # Category and Product
        self.category = Category.objects.create(name='Plushies', slug='plushies')
        self.product = Product.objects.create(
            name='Test Bunny Amigurumi',
            sku='TEST-BUNNY-001',
            category=self.category,
            price=Decimal('699.00'),
            description='Test amigurumi description',
            is_active=True
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            color='Blush Pink',
            size='Medium',
            stock=10
        )
        InventoryRecord.objects.create(
            product=self.product,
            quantity=10,
            low_stock_threshold=3
        )

        # Coupon
        self.coupon = Coupon.objects.create(
            code='WELCOME10',
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal('10.00'),
            min_order_amount=Decimal('500.00')
        )

    def test_user_registration_and_login(self):
        # Register
        reg_response = self.client.post('/api/auth/register/', {
            'email': 'newcustomer@test.com',
            'password': 'StrongPassword123!',
            'first_name': 'Meera',
            'last_name': 'Dev'
        })
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', reg_response.data)

        # Login
        login_response = self.client.post('/api/auth/login/', {
            'email': 'newcustomer@test.com',
            'password': 'StrongPassword123!'
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('token', login_response.data)

    def test_product_catalog_listing_and_filtering(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

        # Search filter
        search_res = self.client.get('/api/products/?search=Bunny')
        self.assertEqual(search_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(search_res.data['count'], 1)

    def test_cart_operations_and_stock_validation(self):
        # Add to cart
        add_res = self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'variant_id': self.variant.id,
            'quantity': 2
        })
        self.assertEqual(add_res.status_code, status.HTTP_200_OK)
        session_key = add_res.data['cart']['session_key']

        # Attempt to add more than stock (stock is 10, target 12)
        over_stock_res = self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'variant_id': self.variant.id,
            'quantity': 10,
            'session_key': session_key
        })
        self.assertEqual(over_stock_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_and_backend_totals_calculation(self):
        # Add item to cart
        add_res = self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'variant_id': self.variant.id,
            'quantity': 1
        })
        session_key = add_res.data['cart']['session_key']

        # Checkout
        checkout_res = self.client.post('/api/orders/checkout/', {
            'full_name': 'Aarav Patel',
            'email': 'aarav@test.com',
            'phone_number': '9876543210',
            'address_line1': '101 Lotus St',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'postal_code': '560001',
            'coupon_code': 'WELCOME10',
            'session_key': session_key
        })
        self.assertEqual(checkout_res.status_code, status.HTTP_201_CREATED)
        order_data = checkout_res.data['order']
        self.assertEqual(order_data['payment_status'], 'PENDING')
        self.assertEqual(Decimal(str(order_data['subtotal'])), Decimal('699.00'))
        # 10% coupon discount on 699 = 69.90
        self.assertEqual(Decimal(str(order_data['discount_amount'])), Decimal('69.90'))

    def test_order_tracking_retrieval(self):
        order = Order.objects.create(
            order_number='SIHA-TEST-001',
            shipping_name='Maya Craft',
            shipping_phone='9876543210',
            shipping_address_line1='Test St',
            shipping_city='Mumbai',
            shipping_state='Maharashtra',
            shipping_postal_code='400001',
            subtotal=Decimal('500.00'),
            total_amount=Decimal('579.00'),
            courier_name='Blue Dart',
            tracking_number='BD123456789',
            tracking_url='https://bluedart.com/track/BD123456789'
        )

        tracking_res = self.client.get(f'/api/orders/tracking/{order.order_number}/')
        self.assertEqual(tracking_res.status_code, status.HTTP_200_OK)
        self.assertEqual(tracking_res.data['courier_name'], 'Blue Dart')
        self.assertEqual(tracking_res.data['tracking_number'], 'BD123456789')
        self.assertEqual(tracking_res.data['tracking_url'], 'https://bluedart.com/track/BD123456789')

    def test_admin_dashboard_authorization(self):
        # Unauthenticated request should be rejected
        unauth_res = self.client.get('/api/admin/dashboard/')
        self.assertIn(unauth_res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Customer request should be forbidden
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.customer_token.key}')
        cust_res = self.client.get('/api/admin/dashboard/')
        self.assertEqual(cust_res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin request should succeed
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token.key}')
        admin_res = self.client.get('/api/admin/dashboard/')
        self.assertEqual(admin_res.status_code, status.HTTP_200_OK)
        self.assertIn('total_orders', admin_res.data)
        self.assertIn('verified_revenue', admin_res.data)
