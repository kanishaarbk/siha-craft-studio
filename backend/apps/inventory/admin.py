from django.contrib import admin
from .models import InventoryRecord, InventoryMovement


@admin.register(InventoryRecord)
class InventoryRecordAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'low_stock_threshold', 'available_quantity', 'is_low_stock', 'is_out_of_stock', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('product__name', 'product__sku')


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ('product', 'movement_type', 'quantity_delta', 'quantity_before', 'quantity_after', 'recorded_by', 'created_at')
    list_filter = ('movement_type', 'created_at')
    search_fields = ('product__name', 'product__sku', 'reason')
    ordering = ('-created_at',)

