import os
from django.core.management.base import BaseCommand
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'siha_backend.settings')
django.setup()

from catalog.models import Category, Product, ProductImage, ProductVariant
from inventory.models import InventoryRecord

# Helper to get or create category
def get_category(slug, defaults):
    category, created = Category.objects.get_or_create(slug=slug, defaults=defaults)
    if created:
        print(f'Created category: {category.name}')
    return category

# Data definitions (same as populate_sample_products but simplified for idempotency)
CATEGORIES_DATA = [
    {'name': 'Crochet Bags', 'slug': 'crochet-bags', 'description': 'Handcrafted crochet tote bags, daisy shoulder bags, and slow-crafted floral slings.', 'order': 1},
    {'name': 'Crochet Accessories', 'slug': 'crochet-accessories', 'description': 'Wearable slow-crafted accents including scrunchies, headbands, keychains, and bookmarks.', 'order': 2},
    {'name': 'Crochet Flowers', 'slug': 'crochet-flowers', 'description': 'Everlasting handmade flower bouquets, roses, tulips, and cheerful sunflower stems.', 'order': 3},
    {'name': 'Amigurumi Toys', 'slug': 'amigurumi-toys', 'description': 'Ultra-soft hand-crocheted plushies, gentle teddy bears, bunnies, ducks, and cute animals.', 'order': 4},
    {'name': 'Home Décor', 'slug': 'home-decor', 'description': 'Artisan coasters, table runners, macramé-inspired wall hangings, and crochet baskets.', 'order': 5},
    {'name': 'Baby Collection', 'slug': 'baby-collection', 'description': 'Gentle, hypoallergenic hand-stitched baby dresses, caps, booties, and newborn gift sets.', 'order': 6},
    {'name': 'Custom Orders', 'slug': 'custom-orders', 'description': 'Bespoke made-to-order commissions tailored specifically to your chosen colors and designs.', 'order': 7},
]

# Minimal product sample (4 per category) – only a subset for brevity; expand as needed.
PRODUCTS_DATA = [
    # Crochet Bags
    {'category_slug': 'crochet-bags', 'name': 'Pastel Crochet Tote Bag', 'sku': 'SIHA-BAG-003', 'price': Decimal('1499.00'), 'sale_price': Decimal('1349.00'), 'short_description': 'Spacious pastel shoulder tote hand-stitched with durable cotton cord.', 'description': 'Hand‑stitched tote with 100% organic cotton yarn.', 'material': 'Organic Cotton', 'dimensions': '32x36cm', 'estimated_dispatch_days': 2, 'is_ready_stock': True, 'is_customizable': True, 'is_featured': True, 'primary_image_url': '/images/crochet-handbag-display.png', 'variants': [
        {'color': 'Sage Green & Cream', 'color_code': '#84977B', 'size': 'Standard', 'stock': 8},
        {'color': 'Dusty Pink & Cream', 'color_code': '#D98FA5', 'size': 'Standard', 'stock': 6},
    ]},
    # Crochet Accessories
    {'category_slug': 'crochet-accessories', 'name': 'Pastel Crochet Scrunchies', 'sku': 'SIHA-ACC-001', 'price': Decimal('249.00'), 'sale_price': Decimal('199.00'), 'short_description': 'Gentle snag‑free hair scrunchie crocheted around an elastic core.', 'description': 'Crochet scrunchie with soft scalloped edges.', 'material': 'Milk Cotton Yarn', 'dimensions': '11cm', 'estimated_dispatch_days': 1, 'is_ready_stock': True, 'is_customizable': True, 'is_featured': True, 'primary_image_url': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80', 'variants': [
        {'color': 'Dusty Pink', 'color_code': '#D98FA5', 'size': 'Regular', 'stock': 25},
        {'color': 'Sage Green', 'color_code': '#84977B', 'size': 'Regular', 'stock': 20},
    ]},
    # Crochet Flowers
    {'category_slug': 'crochet-flowers', 'name': 'Pink Rose Bouquet', 'sku': 'SIHA-FLW-003', 'price': Decimal('1299.00'), 'sale_price': Decimal('1149.00'), 'short_description': 'Heirloom bouquet of 5 hand‑crocheted blush roses.', 'description': 'Five hand‑crafted roses with crochet foliage.', 'material': 'Combed Cotton Yarn', 'dimensions': '34cm height', 'estimated_dispatch_days': 2, 'is_ready_stock': True, 'is_customizable': True, 'is_featured': True, 'primary_image_url': '/images/crochet-flower-bouquet.png', 'variants': [
        {'color': 'Blush Pink & Ivory', 'color_code': '#D98FA5', 'size': '5‑Stem Bouquet', 'stock': 8},
        {'color': 'Deep Rose & Sage', 'color_code': '#566B50', 'size': '5‑Stem Bouquet', 'stock': 6},
    ]},
    # Amigurumi Toys
    {'category_slug': 'amigurumi-toys', 'name': 'Mini Crochet Bunny', 'sku': 'SIHA-TOY-001', 'price': Decimal('499.00'), 'sale_price': None, 'short_description': 'Adorable crocheted bunny plushie.', 'description': 'Soft bunny with floppy ears.', 'material': 'Cotton Yarn', 'dimensions': '15cm tall', 'estimated_dispatch_days': 3, 'is_ready_stock': True, 'is_customizable': True, 'is_featured': False, 'primary_image_url': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', 'variants': [
        {'color': 'White', 'color_code': '#FFFFFF', 'size': 'Standard', 'stock': 12},
    ]},
    # Home Décor
    {'category_slug': 'home-decor', 'name': 'Crochet Coasters', 'sku': 'SIHA-DEC-001', 'price': Decimal('149.00'), 'sale_price': None, 'short_description': 'Set of 4 handcrafted coasters.', 'description': 'Absorbent cotton coasters.', 'material': 'Cotton', 'dimensions': '8cm diameter', 'estimated_dispatch_days': 2, 'is_ready_stock': True, 'is_customizable': False, 'is_featured': False, 'primary_image_url': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', 'variants': [
        {'color': 'Natural', 'color_code': '#FFFDF7', 'size': 'Standard', 'stock': 20},
    ]},
    # Baby Collection
    {'category_slug': 'baby-collection', 'name': 'Crochet Baby Booties', 'sku': 'SIHA-BABY-001', 'price': Decimal('299.00'), 'sale_price': None, 'short_description': 'Soft booties for newborns.', 'description': 'Gentle booties made with hypoallergenic yarn.', 'material': 'Organic Cotton', 'dimensions': 'Size 0-3 months', 'estimated_dispatch_days': 2, 'is_ready_stock': True, 'is_customizable': False, 'is_featured': False, 'primary_image_url': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80', 'variants': [
        {'color': 'Pastel Pink', 'color_code': '#D98FA5', 'size': 'Standard', 'stock': 15},
    ]},
    # Custom Orders
    {'category_slug': 'custom-orders', 'name': 'Custom Crochet Banner', 'sku': 'SIHA-CUST-001', 'price': Decimal('1999.00'), 'sale_price': None, 'short_description': 'Bespoke crochet banner for events.', 'description': 'Made‑to‑order banner, size and colors configurable.', 'material': 'Cotton Yarn', 'dimensions': 'Custom', 'estimated_dispatch_days': 7, 'is_ready_stock': False, 'is_customizable': True, 'is_featured': False, 'primary_image_url': None, 'variants': []},
]

def create_or_update_product(data):
    category = Category.objects.get(slug=data['category_slug'])
    product, created = Product.objects.get_or_create(sku=data['sku'], defaults={
        'name': data['name'],
        'slug': None,  # will be set by model save
        'price': data['price'],
        'sale_price': data.get('sale_price'),
        'short_description': data.get('short_description', ''),
        'description': data.get('description', ''),
        'material': data.get('material', ''),
        'dimensions': data.get('dimensions', ''),
        'estimated_dispatch_days': data.get('estimated_dispatch_days', 3),
        'is_ready_stock': data.get('is_ready_stock', True),
        'is_customizable': data.get('is_customizable', True),
        'is_featured': data.get('is_featured', False),
        'is_active': True,
        'primary_image_url': data.get('primary_image_url') or '',
        'category': category,
    })
    if not created:
        # Update mutable fields in case the script is re‑run with changes
        changed = False
        for field in ['name', 'price', 'sale_price', 'short_description', 'description', 'material', 'dimensions', 'estimated_dispatch_days', 'is_ready_stock', 'is_customizable', 'is_featured', 'primary_image_url']:
            new_val = data.get(field)
            if new_val is not None and getattr(product, field) != new_val:
                setattr(product, field, new_val)
                changed = True
        if changed:
            product.save()
            print(f'Updated product {product.sku}')
    # Variants – replace existing ones for idempotency
    product.variants.all().delete()
    for var in data.get('variants', []):
        ProductVariant.objects.create(
            product=product,
            color=var['color'],
            color_code=var.get('color_code', ''),
            size=var.get('size', 'Standard'),
            stock=var.get('stock', 0),
            is_active=True,
        )
    # Primary image – create ProductImage if URL provided and none exists
    if data.get('primary_image_url'):
        if not product.images.filter(is_primary=True).exists():
            ProductImage.objects.create(
                product=product,
                image_url=data['primary_image_url'],
                alt_text=product.name,
                is_primary=True,
            )
    print(f'Ensured product {product.sku} with {product.variants.count()} variants')
    return product

def generate_products_for_category(category):
    """Return a list of 5 product dictionaries for the given category.
    Uses deterministic SKUs based on the category slug to avoid duplicates.
    Image URLs are real Unsplash images matching the product type.
    """
    base_slug = category.slug
    # Simple mapping for example product names per category
    sample_names = {
        'crochet-bags': [
            'Elegant Crochet Tote', 'Floral Crochet Shoulder Bag', 'Mini Crochet Sling', 'Granny Square Handbag', 'Crochet Crossbody Bag'
        ],
        'crochet-accessories': [
            'Handmade Crochet Scrunchie', 'Crochet Headband', 'Mini Crochet Keychain', 'Crochet Bookmark', 'Crochet Hair Clip'
        ],
        'crochet-flowers': [
            'Pink Rose Bouquet', 'Daisy Flower Bouquet', 'Sunflower Stem', 'Tulip Bouquet', 'Single Crochet Rose'
        ],
        'amigurumi-toys': [
            'Crochet Bunny Plush', 'Crochet Teddy Bear', 'Crochet Duck', 'Crochet Cat', 'Crochet Frog'
        ],
        'home-decor': [
            'Crochet Coasters Set', 'Crochet Table Runner', 'Crochet Wall Hanging', 'Crochet Basket', 'Crochet Cushion Cover'
        ],
        'baby-collection': [
            'Crochet Baby Booties', 'Crochet Baby Hat', 'Crochet Baby Blanket', 'Crochet Baby Dress', 'Crochet Baby Bib'
        ],
        'custom-orders': [
            'Custom Crochet Banner', 'Custom Crochet Sign', 'Custom Crochet Pillow', 'Custom Crochet Tote', 'Custom Crochet Gift Box'
        ],
    }
    names = sample_names.get(base_slug, [f'{category.name} Product {i}' for i in range(1, 6)])
    # Simple price generation
    prices = [Decimal('199.00'), Decimal('299.00'), Decimal('399.00'), Decimal('499.00'), Decimal('599.00')]
    image_urls = [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    ]
    products = []
    for i in range(5):
        sku = f'SIHA-{base_slug.upper().replace("-", "")}—{i+1:03d}'
        products.append({
            'category_slug': base_slug,
            'name': names[i],
            'sku': sku,
            'price': prices[i],
            'sale_price': None,
            'short_description': f'Professional handcrafted {names[i].lower()} made with high‑quality cotton yarn.',
            'description': f'This {names[i].lower()} is meticulously crocheted using premium yarn, ensuring durability and a luxurious feel. Ideal for gifting or personal use.',
            'material': '100% Premium Cotton Yarn',
            'dimensions': 'Standard size',
            'estimated_dispatch_days': 3,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': False,
            'primary_image_url': image_urls[i],
            'variants': [
                {'color': 'Sage Green', 'color_code': '#84977B', 'size': 'Standard', 'stock': 15},
                {'color': 'Dusty Pink', 'color_code': '#D98FA5', 'size': 'Standard', 'stock': 12},
            ],
        })
    return products

def main():
    # Ensure all categories exist (already handled previously)
    for cat_data in CATEGORIES_DATA:
        get_category(cat_data['slug'], cat_data)
    # For every category in the DB, ensure it has at least 5 products
    from catalog.models import Category
    all_categories = Category.objects.filter(is_active=True)
    for category in all_categories:
        existing_count = category.products.filter(is_active=True).count()
        if existing_count >= 5:
            continue
        # generate needed products
        needed = 5 - existing_count
        generated = generate_products_for_category(category)
        for prod_data in generated[:needed]:
            create_or_update_product(prod_data)
    print('Seeding complete.')
    # Ensure all categories exist
    for cat_data in CATEGORIES_DATA:
        get_category(cat_data['slug'], cat_data)
    # Insert products
    for prod_data in PRODUCTS_DATA:
        create_or_update_product(prod_data)
    print('Seeding complete.')


class Command(BaseCommand):
    help = "Seed sample products into the database"

    def handle(self, *args, **options):
        main()

    # Ensure all categories exist
    for cat_data in CATEGORIES_DATA:
        get_category(cat_data['slug'], cat_data)
    # Insert products
    for prod_data in PRODUCTS_DATA:
        create_or_update_product(prod_data)
    print('Seeding complete.')

if __name__ == '__main__':
    main()
