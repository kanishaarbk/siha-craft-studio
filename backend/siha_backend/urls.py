from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

api_patterns = [
    # Authentication & User Profiles
    path('auth/', include('accounts.urls')),

    # Catalog (Products, Categories, Reviews)
    path('', include('catalog.urls')),

    # Shopping Cart & Wishlist
    path('', include('cart.urls')),

    # Orders, Checkout & Tracking
    path('orders/', include('orders.urls')),

    # Razorpay Payments
    path('payments/', include('payments.urls')),

    # Online Crochet Classes with Google Meet
    path('', include('classes.urls')),

    # Custom Crochet Requests & Quotations
    path('customizations/', include('customizations.urls')),

    # Store Settings, Admin Operations, Newsletter, Contact
    path('', include('store_settings.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),

    # Support both /api/... (standard frontend base URL) and root paths
    path('api/', include(api_patterns)),
    path('', include(api_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
