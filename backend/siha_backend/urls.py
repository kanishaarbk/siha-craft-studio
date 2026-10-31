from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication & User Profiles
    path('api/auth/', include('accounts.urls')),

    # Catalog (Products, Categories, Reviews)
    path('api/', include('catalog.urls')),

    # Shopping Cart & Wishlist
    path('api/', include('cart.urls')),

    # Orders, Checkout & Tracking
    path('api/orders/', include('orders.urls')),

    # Razorpay Payments
    path('api/payments/', include('payments.urls')),

    # Online Crochet Classes with Google Meet
    path('api/', include('classes.urls')),

    # Custom Crochet Requests & Quotations
    path('api/customizations/', include('customizations.urls')),

    # Store Settings, Admin Operations, Newsletter, Contact
    path('api/', include('store_settings.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
