from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariant, Review


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'order', 'product_count']


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'color', 'color_code', 'size', 'sku_suffix', 'price_adjustment', 'stock', 'effective_price', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'is_primary', 'order']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'product', 'rating', 'headline', 'comment', 'is_verified_purchase', 'reviewer_name', 'created_at']
        read_only_fields = ['id', 'is_verified_purchase', 'reviewer_name', 'created_at']

    def get_reviewer_name(self, obj):
        name = obj.user.get_full_name() or obj.user.username or "Crochet Enthusiast"
        # Mask partly for privacy: "Aaradhya S."
        parts = name.split()
        if len(parts) > 1:
            return f"{parts[0]} {parts[1][0]}."
        return parts[0] if parts else "Customer"


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'category_name', 'category_slug',
            'price', 'sale_price', 'current_price', 'short_description', 'material',
            'is_ready_stock', 'is_customizable', 'is_featured', 'is_in_stock',
            'total_stock', 'primary_image_url', 'created_at'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    total_stock = serializers.IntegerField(read_only=True)
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'price', 'sale_price', 'current_price',
            'short_description', 'description', 'material', 'dimensions', 'care_instructions',
            'estimated_dispatch_days', 'is_ready_stock', 'is_customizable', 'is_featured',
            'is_in_stock', 'total_stock', 'primary_image_url', 'images', 'variants',
            'reviews', 'average_rating', 'reviews_count', 'created_at'
        ]

    def get_reviews(self, obj):
        approved_reviews = obj.reviews.filter(is_approved=True)[:10]
        return ReviewSerializer(approved_reviews, many=True).data

    def get_average_rating(self, obj):
        approved_reviews = obj.reviews.filter(is_approved=True)
        if not approved_reviews.exists():
            return 5.0  # Default boutique standard
        ratings = [r.rating for r in approved_reviews]
        return round(sum(ratings) / len(ratings), 1)

    def get_reviews_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()
