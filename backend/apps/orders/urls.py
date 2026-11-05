from django.urls import path
from .views import (
    ValidateCouponView, CheckoutView, MyOrdersView,
    OrderDetailView, OrderTrackingView,
    AdminOrderListView, AdminOrderFulfillmentView
)

urlpatterns = [
    path('validate-coupon/', ValidateCouponView.as_view(), name='validate-coupon'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('my-orders/', MyOrdersView.as_view(), name='my-orders'),
    path('detail/<str:order_id_or_number>/', OrderDetailView.as_view(), name='order-detail'),
    path('tracking/', OrderTrackingView.as_view(), name='order-tracking-lookup'),
    path('tracking/<str:order_number>/', OrderTrackingView.as_view(), name='order-tracking'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-orders-list'),
    path('admin/orders/<int:order_id>/fulfillment/', AdminOrderFulfillmentView.as_view(), name='admin-order-fulfillment'),
]
