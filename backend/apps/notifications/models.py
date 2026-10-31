from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        REGISTRATION = 'REGISTRATION', 'Welcome & Registration'
        ORDER_CONFIRMATION = 'ORDER_CONFIRMATION', 'Order Confirmation'
        PAYMENT_SUCCESS = 'PAYMENT_SUCCESS', 'Payment Received'
        SHIPPING_UPDATE = 'SHIPPING_UPDATE', 'Shipment In Transit'
        TRACKING_LINK_UPDATE = 'TRACKING_LINK_UPDATE', 'Tracking Details Assigned'
        CUSTOMIZATION_QUOTE = 'CUSTOMIZATION_QUOTE', 'Custom Quote Sent'
        CLASS_BOOKING = 'CLASS_BOOKING', 'Class Seat Confirmed'

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    recipient_email = models.EmailField()
    notification_type = models.CharField(max_length=40, choices=NotificationType.choices)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} -> {self.recipient_email}"


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-subscribed_at']

    def __str__(self):
        return self.email
