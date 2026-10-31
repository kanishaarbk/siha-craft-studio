from django.urls import path
from .views import (
    PublicStoreSettingsView, NewsletterSubscribeView, ContactMessageView,
    AdminDashboardStatsView, AdminInventoryListView, AdminInventoryAdjustView,
    AdminProductManageView, AdminCouponManageView
)

urlpatterns = [
    path('store-settings/', PublicStoreSettingsView.as_view(), name='store-settings'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    path('contact/', ContactMessageView.as_view(), name='contact-message'),
    path('admin/dashboard/', AdminDashboardStatsView.as_view(), name='admin-dashboard'),
    path('admin/inventory/', AdminInventoryListView.as_view(), name='admin-inventory-list'),
    path('admin/inventory/adjust/', AdminInventoryAdjustView.as_view(), name='admin-inventory-adjust'),
    path('admin/products/', AdminProductManageView.as_view(), name='admin-products-create'),
    path('admin/products/<int:product_id>/', AdminProductManageView.as_view(), name='admin-products-detail'),
    path('admin/coupons/', AdminCouponManageView.as_view(), name='admin-coupons'),
]
