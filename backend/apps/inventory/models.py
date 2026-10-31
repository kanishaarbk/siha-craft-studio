from django.db import models
from django.conf import settings
from catalog.models import Product, ProductVariant


class InventoryRecord(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    quantity = models.IntegerField(default=10)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    reserved_quantity = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def available_quantity(self):
        return max(0, self.quantity - self.reserved_quantity)

    @property
    def is_low_stock(self):
        return self.available_quantity <= self.low_stock_threshold and self.available_quantity > 0

    @property
    def is_out_of_stock(self):
        return self.available_quantity <= 0

    def __str__(self):
        return f"Inventory for {self.product.name}: {self.quantity} (Available: {self.available_quantity})"


class InventoryMovement(models.Model):
    class MovementType(models.TextChoices):
        STOCK_IN = 'STOCK_IN', 'Stock In'
        STOCK_OUT = 'STOCK_OUT', 'Stock Out'
        SALE = 'SALE', 'Sale / Order Placed'
        RETURN = 'RETURN', 'Customer Return'
        ADJUSTMENT = 'ADJUSTMENT', 'Manual Adjustment'

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity_delta = models.IntegerField(help_text='Positive for addition, negative for deduction')
    quantity_before = models.IntegerField()
    quantity_after = models.IntegerField()
    reason = models.CharField(max_length=255)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} [{self.movement_type}]: {self.quantity_delta:+d} -> {self.quantity_after}"
