import secrets
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from catalog.models import Product, ProductVariant


class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage'
        FIXED = 'FIXED', 'Fixed Amount'

    code = models.CharField(max_length=30, unique=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)

    def is_valid(self, order_amount):
        now = timezone.now()
        if not self.is_active:
            return False, "This coupon is no longer active."
        if self.valid_from and now < self.valid_from:
            return False, "This coupon is not yet valid."
        if self.valid_until and now > self.valid_until:
            return False, "This coupon has expired."
        if self.usage_limit and self.times_used >= self.usage_limit:
            return False, "This coupon has reached its maximum usage limit."
        if order_amount < self.min_order_amount:
            return False, f"Minimum order amount for this coupon is ₹{self.min_order_amount}."
        return True, "Coupon is valid."

    def calculate_discount(self, order_amount):
        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (order_amount * self.discount_value) / Decimal('100.00')
            if self.max_discount_amount and discount > self.max_discount_amount:
                discount = self.max_discount_amount
        else:
            discount = min(self.discount_value, order_amount)
        return discount.quantize(Decimal('0.01'))

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == 'PERCENTAGE' else ' INR'})"


class Order(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Payment'
        AUTHORIZED = 'AUTHORIZED', 'Payment Authorized'
        PAID = 'PAID', 'Paid'
        FAILED = 'FAILED', 'Payment Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    class FulfillmentStatus(models.TextChoices):
        PENDING_PAYMENT = 'PENDING_PAYMENT', 'Pending Payment'
        CONFIRMED = 'CONFIRMED', 'Order Confirmed'
        PROCESSING = 'PROCESSING', 'Processing & Handcrafting'
        READY_TO_SHIP = 'READY_TO_SHIP', 'Ready to Ship'
        SHIPPED = 'SHIPPED', 'Shipped'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REFUND_PENDING = 'REFUND_PENDING', 'Refund Pending'
        REFUNDED = 'REFUNDED', 'Refunded'

    order_number = models.CharField(max_length=40, unique=True, db_index=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    # Guest & Contact details
    guest_email = models.EmailField(blank=True, null=True)
    guest_name = models.CharField(max_length=150, blank=True, null=True)
    guest_phone = models.CharField(max_length=20, blank=True, null=True)

    # Shipping Address JSON
    shipping_name = models.CharField(max_length=150)
    shipping_phone = models.CharField(max_length=20)
    shipping_address_line1 = models.CharField(max_length=255)
    shipping_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default='India')

    # Totals
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_fee = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    # Statuses
    payment_status = models.CharField(max_length=30, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    fulfillment_status = models.CharField(max_length=30, choices=FulfillmentStatus.choices, default=FulfillmentStatus.PENDING_PAYMENT)

    # Shipping Courier tracking
    courier_name = models.CharField(max_length=100, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    tracking_url = models.URLField(max_length=500, blank=True, null=True)
    estimated_delivery_date = models.DateField(null=True, blank=True)

    customer_notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def generate_order_number(cls):
        date_str = timezone.now().strftime('%Y%m%d')
        suffix = secrets.token_hex(3).upper()
        return f"SIHA-{date_str}-{suffix}"

    def get_contact_email(self):
        if self.customer:
            return self.customer.email
        return self.guest_email

    def __str__(self):
        return f"Order #{self.order_number} ({self.total_amount} INR)"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=200)
    variant_name = models.CharField(max_length=150, blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_number}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=50)
    notes = models.TextField(blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.order.order_number}: {self.status} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"
