from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory, Coupon


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'variant', 'product_name', 'variant_name', 'unit_price', 'quantity', 'total_price')


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('status', 'notes', 'updated_by', 'created_at')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'shipping_name', 'total_amount', 'payment_status', 'fulfillment_status', 'courier_name', 'tracking_number', 'created_at')
    list_filter = ('payment_status', 'fulfillment_status', 'created_at')
    search_fields = ('order_number', 'shipping_name', 'guest_email', 'customer__email', 'tracking_number')
    ordering = ('-created_at',)
    inlines = [OrderItemInline, OrderStatusHistoryInline]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'min_order_amount', 'times_used', 'is_active', 'valid_until')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('code',)

