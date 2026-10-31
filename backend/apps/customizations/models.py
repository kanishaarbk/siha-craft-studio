import secrets
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from orders.models import Order


class CustomizationRequest(models.Model):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New Request'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Artisan Review'
        MORE_INFO_REQUIRED = 'MORE_INFO_REQUIRED', 'More Information Required'
        QUOTATION_SENT = 'QUOTATION_SENT', 'Quotation Sent'
        ACCEPTED = 'ACCEPTED', 'Quotation Accepted by Customer'
        REJECTED = 'REJECTED', 'Declined'
        CONVERTED_TO_ORDER = 'CONVERTED_TO_ORDER', 'Converted to Order'
        COMPLETED = 'COMPLETED', 'Crafting Completed'

    class CategoryType(models.TextChoices):
        PLUSHIES = 'PLUSHIES', 'Handmade Plushie / Amigurumi Toy'
        KEYCHAINS = 'KEYCHAINS', 'Personalized Keychain / Charm'
        BAGS = 'BAGS', 'Custom Crochet Tote / Purse'
        FLOWERS = 'FLOWERS', 'Everlasting Crochet Bouquet'
        GIFTS = 'GIFTS', 'Custom Keepsake Gift'
        HOME_DECOR = 'HOME_DECOR', 'Home Décor & Blanket'
        ACCESSORIES = 'ACCESSORIES', 'Custom Wearable Accessory'
        OTHER = 'OTHER', 'Other Custom Idea'

    request_number = models.CharField(max_length=40, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='customization_requests')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    category = models.CharField(max_length=40, choices=CategoryType.choices, default=CategoryType.PLUSHIES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    color_preferences = models.CharField(max_length=255, default='As per artisan recommendation')
    size_preferences = models.CharField(max_length=255, default='Standard boutique size')
    quantity = models.PositiveIntegerField(default=1)
    budget_range_inr = models.CharField(max_length=100, blank=True, default='₹500 - ₹2,500')
    required_by_date = models.DateField(null=True, blank=True)
    reference_image = models.ImageField(upload_to='customizations/', blank=True, null=True)
    reference_image_url = models.CharField(max_length=500, blank=True, null=True)
    additional_notes = models.TextField(blank=True, null=True)
    contact_consent = models.BooleanField(default=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.NEW)
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def generate_request_number(cls):
        date_str = timezone.now().strftime('%Y%m%d')
        suffix = secrets.token_hex(3).upper()
        return f"CR-{date_str}-{suffix}"

    def __str__(self):
        return f"{self.request_number} - {self.title} ({self.name})"


class CustomizationQuote(models.Model):
    request = models.OneToOneField(CustomizationRequest, on_delete=models.CASCADE, related_name='quote')
    quote_amount = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_production_days = models.PositiveIntegerField(default=7)
    quote_details = models.TextField()
    valid_until = models.DateField(null=True, blank=True)
    is_accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='customization_quotes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Quote ₹{self.quote_amount} for {self.request.request_number}"
