from django.db import models
from django.utils.text import slugify
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    sku = models.CharField(max_length=60, unique=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    material = models.CharField(max_length=150, default='100% Premium Cotton Yarn')
    dimensions = models.CharField(max_length=150, blank=True, default='Handcrafted Standard')
    care_instructions = models.TextField(default='Hand wash gently in cold water. Lay flat on a clean towel to dry. Do not bleach or wring.')
    estimated_dispatch_days = models.PositiveIntegerField(default=3)
    is_ready_stock = models.BooleanField(default=True, help_text='True if ready to ship, False if made-to-order')
    is_customizable = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    primary_image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def current_price(self):
        if self.sale_price and self.sale_price > 0 and self.sale_price < self.price:
            return self.sale_price
        return self.price

    @property
    def total_stock(self):
        variants = self.variants.all()
        if variants.exists():
            return sum(v.stock for v in variants)
        inv = getattr(self, 'inventory', None)
        return inv.quantity if inv else 0

    @property
    def is_in_stock(self):
        return self.total_stock > 0

    def __str__(self):
        return f"{self.name} ({self.sku})"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    color = models.CharField(max_length=60, default='Standard')
    color_code = models.CharField(max_length=20, default='#F8DDE0')
    size = models.CharField(max_length=60, default='Standard')
    sku_suffix = models.CharField(max_length=30, blank=True)
    price_adjustment = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    stock = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'color', 'size')

    @property
    def effective_price(self):
        return self.product.current_price + self.price_adjustment

    def __str__(self):
        return f"{self.product.name} - {self.color} / {self.size}"


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, f"{i} Stars") for i in range(1, 6)])
    headline = models.CharField(max_length=150)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.product.name} by {self.user.email} - {self.rating}★"
