from django.db import models
from orders.models import Order


class PaymentRecord(models.Model):
    class Gateway(models.TextChoices):
        RAZORPAY = 'RAZORPAY', 'Razorpay Checkout'

    class Status(models.TextChoices):
        CREATED = 'CREATED', 'Order Created'
        AUTHORIZED = 'AUTHORIZED', 'Payment Authorized'
        CAPTURED = 'CAPTURED', 'Payment Captured / Verified'
        FAILED = 'FAILED', 'Payment Failed'
        REFUNDED = 'REFUNDED', 'Payment Refunded'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    gateway = models.CharField(max_length=30, choices=Gateway.choices, default=Gateway.RAZORPAY)
    razorpay_order_id = models.CharField(max_length=100, db_index=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.CREATED)
    error_code = models.CharField(max_length=100, blank=True, null=True)
    error_description = models.TextField(blank=True, null=True)
    notes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.razorpay_order_id} - {self.status} (₹{self.amount})"


class PaymentWebhookEvent(models.Model):
    event_id = models.CharField(max_length=100, unique=True, db_index=True)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    is_processed = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True, null=True)
    received_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Webhook {self.event_id} ({self.event_type})"
