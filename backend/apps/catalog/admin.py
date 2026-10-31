from django.contrib import admin
from .models import Category, Product, ProductImage, ProductVariant, Review


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'image_url', 'alt_text', 'is_primary', 'order')


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('color', 'color_code', 'size', 'sku_suffix', 'price_adjustment', 'stock', 'is_active')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'order')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('order',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'current_price', 'sale_price', 'is_ready_stock', 'is_featured', 'is_active')
    list_filter = ('category', 'is_ready_stock', 'is_customizable', 'is_featured', 'is_active', 'created_at')
    search_fields = ('name', 'sku', 'short_description', 'description')
    ordering = ('-created_at',)
    inlines = [ProductImageInline, ProductVariantInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'is_verified_purchase', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_verified_purchase', 'is_approved', 'created_at')
    search_fields = ('product__name', 'user__email', 'headline', 'comment')
    ordering = ('-created_at',)
