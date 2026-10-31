from rest_framework import serializers
from .models import Order, OrderItem, Coupon, OrderStatusHistory


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'min_order_amount', 'max_discount_amount', 'is_active', 'valid_until']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'product_name', 'variant_name', 'unit_price', 'quantity', 'total_price']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'notes', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    coupon_code = serializers.CharField(source='coupon.code', read_only=True, default=None)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'guest_email', 'guest_name', 'guest_phone',
            'shipping_name', 'shipping_phone', 'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_postal_code', 'shipping_country',
            'subtotal', 'shipping_fee', 'discount_amount', 'total_amount', 'coupon_code',
            'payment_status', 'fulfillment_status', 'courier_name', 'tracking_number',
            'tracking_url', 'estimated_delivery_date', 'customer_notes', 'items',
            'status_history', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'subtotal', 'shipping_fee', 'discount_amount',
            'total_amount', 'payment_status', 'fulfillment_status', 'created_at', 'updated_at'
        ]


class CheckoutInputSerializer(serializers.Serializer):
    # Customer/Guest info
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)

    # Address
    address_line1 = serializers.CharField(max_length=255)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, default='India')

    # Optional delivery notes & coupon
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    session_key = serializers.CharField(required=False, allow_blank=True)


class AdminOrderFulfillmentSerializer(serializers.ModelSerializer):
    status_notes = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'fulfillment_status', 'payment_status', 'courier_name',
            'tracking_number', 'tracking_url', 'estimated_delivery_date',
            'admin_notes', 'status_notes'
        ]
