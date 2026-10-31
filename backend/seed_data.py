import os
import django
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'siha_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from catalog.models import Category, Product, ProductImage, ProductVariant, Review
from inventory.models import InventoryRecord, InventoryMovement
from orders.models import Coupon
from classes.models import CrochetClass, ClassSession, ClassResource
from customizations.models import CustomizationRequest, CustomizationQuote
from store_settings.models import StoreSetting

User = get_user_model()


def seed_database():
    print("Beginning SiHA Craft Studio database seeding...")

    # 1. Admin & Customer Users
    admin_user, created = User.objects.get_or_create(
        email='admin@sihacraftstudio.com',
        defaults={
            'username': 'siha_admin',
            'first_name': 'SiHA',
            'last_name': 'Administrator',
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created or not admin_user.check_password('Admin@Siha2026!'):
        admin_user.set_password('Admin@Siha2026!')
        admin_user.save()
    print(f"Admin user verified: {admin_user.email} (password: Admin@Siha2026!)")

    customer_user, created = User.objects.get_or_create(
        email='customer@sihacraftstudio.com',
        defaults={
            'username': 'siha_customer',
            'first_name': 'Aaradhya',
            'last_name': 'Sharma',
            'role': User.Role.CUSTOMER,
        }
    )
    if created or not customer_user.check_password('Customer@Siha2026!'):
        customer_user.set_password('Customer@Siha2026!')
        customer_user.save()
    print(f"Customer user verified: {customer_user.email} (password: Customer@Siha2026!)")

    # 2. Store Settings
    settings_data = [
        ('store_name', 'SiHA Craft Studio', 'Brand store name'),
        ('tagline', 'Little Stitches, Handmade with Love', 'Hero brand tagline'),
        ('contact_email', 'hello@sihacraftstudio.com', 'Primary customer inquiry email'),
        ('whatsapp_number', '919876543210', 'WhatsApp business number for floating button'),
        ('instagram_url', 'https://instagram.com/sihacraftstudio', 'Official Instagram page'),
        ('free_shipping_threshold', '999', 'Order amount in INR eligible for free delivery'),
        ('default_shipping_fee', '79', 'Standard domestic shipping rate in INR'),
        ('support_hours', 'Mon - Sat: 10:00 AM - 7:00 PM IST', 'Customer service hours'),
    ]
    for key, val, desc in settings_data:
        StoreSetting.objects.update_or_create(
            key=key,
            defaults={'value': val, 'description': desc}
        )

    # 3. Coupons
    coupons_data = [
        ('WELCOME10', Coupon.DiscountType.PERCENTAGE, Decimal('10.00'), Decimal('499.00'), Decimal('300.00'), 500),
        ('SIHALOVE', Coupon.DiscountType.FIXED, Decimal('150.00'), Decimal('999.00'), None, 200),
        ('PASTEL20', Coupon.DiscountType.PERCENTAGE, Decimal('20.00'), Decimal('1499.00'), Decimal('500.00'), 100),
    ]
    for code, dtype, val, min_amt, max_d, limit in coupons_data:
        Coupon.objects.update_or_create(
            code=code,
            defaults={
                'discount_type': dtype,
                'discount_value': val,
                'min_order_amount': min_amt,
                'max_discount_amount': max_d,
                'usage_limit': limit,
                'is_active': True,
                'valid_from': timezone.now(),
                'valid_until': timezone.now() + timedelta(days=365)
            }
        )

    # 4. Categories
    categories = [
        {
            'name': 'Crochet Toys and Plushies',
            'slug': 'crochet-toys-plushies',
            'description': 'Lovingly handcrafted amigurumi plush toys, gentle bunnies, bears, and whimsical animal companions made from ultra-soft cotton yarn.',
            'order': 1
        },
        {
            'name': 'Crochet Bags and Purses',
            'slug': 'crochet-bags-purses',
            'description': 'Chic handcrafted tote bags, granny square shoulder purses, and bohemian bucket bags lined with natural cotton fabric.',
            'order': 2
        },
        {
            'name': 'Crochet Flowers and Bouquets',
            'slug': 'crochet-flowers-bouquets',
            'description': 'Everlasting blooms including crochet roses, tulips, daisies, and lavender sprigs that never wilt and bring permanent warmth to any room.',
            'order': 3
        },
        {
            'name': 'Keychains and Small Gifts',
            'slug': 'keychains-small-gifts',
            'description': 'Delightful miniature crochet charms, floral keyrings, fruit charms, and thoughtful handmade tokens for loved ones.',
            'order': 4
        },
        {
            'name': 'Yarn and Crochet Supplies',
            'slug': 'yarn-crochet-supplies',
            'description': 'Curated pastel milk cotton skeins, ergonomic bamboo and aluminum hooks, locking stitch markers, and premium crafting kits.',
            'order': 5
        },
        {
            'name': 'Home Décor & Coasters',
            'slug': 'home-decor-coasters',
            'description': 'Hand-stitched mug cozies, floral coaster sets, delicate doilies, and decorative wall hangings woven with pastel elegance.',
            'order': 6
        },
    ]

    cat_objs = {}
    for c in categories:
        cat, _ = Category.objects.update_or_create(
            slug=c['slug'],
            defaults={'name': c['name'], 'description': c['description'], 'order': c['order'], 'is_active': True}
        )
        cat_objs[c['slug']] = cat

    # 5. Products with realistic details, high quality pastel photos & inventory
    products_data = [
        # Toys & Plushies
        {
            'category': 'crochet-toys-plushies',
            'name': 'Blush Bunny Amigurumi Plushie',
            'sku': 'SIHA-TOY-001',
            'price': Decimal('899.00'),
            'sale_price': Decimal('799.00'),
            'short_description': 'Ultra-soft hand-crocheted bunny with floppy ears, safety eyes, and a hand-tied pastel bow.',
            'description': 'Our signature Blush Bunny is stitched by hand using hypoallergenic milk cotton yarn. Filled with cloud-soft polyfill and featuring safety-locked eyes, it makes the sweetest nursery keepsake or heartfelt gift. Each bunny takes approximately 7 hours of meticulous handcrafting.',
            'material': '100% Milk Cotton Yarn, Hypoallergenic Polyfill',
            'dimensions': '28cm Height x 14cm Width',
            'care_instructions': 'Spot clean with mild baby detergent or gentle cold hand wash. Reshape and air dry flat.',
            'estimated_dispatch_days': 2,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': True,
            'primary_image_url': 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Blush Pink', 'color_code': '#F8DDE0', 'size': 'Medium (28cm)', 'stock': 12},
                {'color': 'Warm Cream', 'color_code': '#FFF9F3', 'size': 'Medium (28cm)', 'stock': 8},
                {'color': 'Soft Lavender', 'color_code': '#EAE2F5', 'size': 'Medium (28cm)', 'stock': 6},
            ]
        },
        {
            'category': 'crochet-toys-plushies',
            'name': 'Vintage Teddy Bear Companion',
            'sku': 'SIHA-TOY-002',
            'price': Decimal('999.00'),
            'sale_price': None,
            'short_description': 'Classic heirloom crochet teddy bear with articulated limbs and chocolate-brown nose embroidery.',
            'description': 'A timeless teddy bear inspired by vintage handcraft traditions. Woven in warm oatmeal and chocolate accents, this heirloom piece is designed to be cherished for generations.',
            'material': 'Organic Combed Cotton Yarn, Embroidered Details',
            'dimensions': '25cm x 16cm',
            'care_instructions': 'Hand wash gently in lukewarm water. Do not twist or wring.',
            'estimated_dispatch_days': 3,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': True,
            'primary_image_url': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Oatmeal Cream', 'color_code': '#FFE8DF', 'size': 'Standard (25cm)', 'stock': 10},
                {'color': 'Chocolate Brown', 'color_code': '#55352E', 'size': 'Standard (25cm)', 'stock': 5},
            ]
        },
        {
            'category': 'crochet-toys-plushies',
            'name': 'Pastel Sleeping Cloud Pillow Plushie',
            'sku': 'SIHA-TOY-003',
            'price': Decimal('649.00'),
            'sale_price': Decimal('549.00'),
            'short_description': 'Whimsical smiling cloud amigurumi with gentle sleepy embroidered eyes and rosy cheeks.',
            'description': 'A soothing handmade decorative cloud plushie finished with blush cheeks and sleepy embroidered lashes. Perfect for pastel-themed bedrooms, study desks, and baby cribs.',
            'material': 'Plush Chenille Velvet Yarn',
            'dimensions': '22cm x 15cm',
            'care_instructions': 'Surface wash with a damp cloth.',
            'estimated_dispatch_days': 2,
            'is_ready_stock': True,
            'is_customizable': False,
            'is_featured': False,
            'primary_image_url': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Soft White', 'color_code': '#FFFFFF', 'size': 'One Size', 'stock': 15},
                {'color': 'Soft Lavender', 'color_code': '#EAE2F5', 'size': 'One Size', 'stock': 7},
            ]
        },

        # Bags & Purses
        {
            'category': 'crochet-bags-purses',
            'name': 'Pastel Garden Granny Square Tote Bag',
            'sku': 'SIHA-BAG-001',
            'price': Decimal('1499.00'),
            'sale_price': Decimal('1299.00'),
            'short_description': 'Handcrafted granny square shoulder tote assembled from 18 individual floral motifs with reinforced cotton lining.',
            'description': 'Every single motif of this iconic tote bag is hand-crocheted with intricate floral centers and framed in muted cream borders. Reinforced with sturdy handles and an inner cotton lining with a slip pocket for your phone and keys.',
            'material': 'Heavy Duty 100% Mercerized Cotton Yarn, Breathable Cotton Lining',
            'dimensions': '36cm Width x 38cm Height x 60cm Strap Drop',
            'care_instructions': 'Cold hand wash with mild wool/cotton liquid detergent. Lay flat on dry surface away from direct harsh sun.',
            'estimated_dispatch_days': 3,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': True,
            'primary_image_url': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Pastel Bloom Palette', 'color_code': '#F8DDE0', 'size': 'Standard Tote', 'stock': 8},
                {'color': 'Sage & Lavender Melody', 'color_code': '#DCE8D8', 'size': 'Standard Tote', 'stock': 5},
            ]
        },
        {
            'category': 'crochet-bags-purses',
            'name': 'Handmade Daisy Crossbody Sling Purse',
            'sku': 'SIHA-BAG-002',
            'price': Decimal('1099.00'),
            'sale_price': Decimal('999.00'),
            'short_description': 'Chic circular crochet sling purse with raised relief daisy petals and an antique brass zipper.',
            'description': 'A playful yet refined round sling purse featuring three-dimensional textured daisies. Lightweight and spacious enough for everyday essentials like your sunglasses, cardholder, and lipstick.',
            'material': 'Cotton Cord Yarn, Brass Hardware, Fabric Lining',
            'dimensions': '20cm Diameter x 6cm Depth',
            'care_instructions': 'Spot clean with a damp cloth.',
            'estimated_dispatch_days': 2,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': True,
            'primary_image_url': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Pale Peach', 'color_code': '#FFE8DF', 'size': 'Standard (20cm)', 'stock': 9},
                {'color': 'Blush Pink', 'color_code': '#F8DDE0', 'size': 'Standard (20cm)', 'stock': 11},
            ]
        },

        # Flowers and Bouquets
        {
            'category': 'crochet-flowers-bouquets',
            'name': 'Everlasting Pastel Rose & Tulip Bouquet',
            'sku': 'SIHA-FLW-001',
            'price': Decimal('1299.00'),
            'sale_price': Decimal('1149.00'),
            'short_description': 'Delicate 7-stem crochet bouquet wrapped in Korean flower paper with blush satin ribbon.',
            'description': 'Flowers that never wither and always carry your love. This bespoke arrangement includes 3 pastel blooming roses, 2 hand-knit tulips, and 2 eucalyptus/sage sprigs with internal wire framing that allows you to bend and arrange each stem.',
            'material': 'Fine Combed Milk Cotton, Floral Stem Wire, Satin Ribbon',
            'dimensions': '35cm Height x 22cm Width',
            'care_instructions': 'Dust lightly with a soft makeup brush or gentle hairdryer on cool setting.',
            'estimated_dispatch_days': 2,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': True,
            'primary_image_url': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Blush & Peach Romance', 'color_code': '#F8DDE0', 'size': '7 Stems Wrapped', 'stock': 14},
                {'color': 'Lavender Mist & Sage', 'color_code': '#EAE2F5', 'size': '7 Stems Wrapped', 'stock': 8},
            ]
        },
        {
            'category': 'crochet-flowers-bouquets',
            'name': 'Potted Sunshine Daisy Plant',
            'sku': 'SIHA-FLW-002',
            'price': Decimal('599.00'),
            'sale_price': Decimal('499.00'),
            'short_description': 'Cheerful crocheted mini daisy in a handmade textured terra-cotta-styled crochet pot.',
            'description': 'Brighten up your study desk, bookshelf, or window ledge with this maintenance-free crocheted desk plant. Features five blooming white daisies with sunny yellow centers nested in a soil-textured base.',
            'material': 'Mercerized Cotton Yarn, Ceramic Weighted Core',
            'dimensions': '16cm Height x 10cm Diameter',
            'care_instructions': 'Dust periodically.',
            'estimated_dispatch_days': 1,
            'is_ready_stock': True,
            'is_customizable': False,
            'is_featured': False,
            'primary_image_url': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'White & Yellow Bloom', 'color_code': '#FFF9F3', 'size': 'Mini Pot (16cm)', 'stock': 16},
                {'color': 'Pastel Pink Daisy', 'color_code': '#F8DDE0', 'size': 'Mini Pot (16cm)', 'stock': 10},
            ]
        },

        # Keychains and Small Gifts
        {
            'category': 'keychains-small-gifts',
            'name': 'Handmade Strawberry Keychain Charm',
            'sku': 'SIHA-KCH-001',
            'price': Decimal('299.00'),
            'sale_price': Decimal('249.00'),
            'short_description': 'Plump amigurumi strawberry charm with tiny embroidered seed beads and a gold swivel clasp.',
            'description': 'A cute handmade strawberry accessory that adds a cozy handcrafted charm to bags, backpacks, car keys, or airpod cases. Finished with an anti-tarnish gold lobster clasp.',
            'material': 'Fine Cotton Thread, Gold Plated Alloy Hardware',
            'dimensions': '6cm x 4cm',
            'care_instructions': 'Gently wipe with dry cloth.',
            'estimated_dispatch_days': 1,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': False,
            'primary_image_url': 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Sweet Red', 'color_code': '#71313D', 'size': 'Standard Charm', 'stock': 25},
                {'color': 'Pastel Pink', 'color_code': '#F8DDE0', 'size': 'Standard Charm', 'stock': 20},
            ]
        },
        {
            'category': 'keychains-small-gifts',
            'name': 'Crochet Heart Keepsake Keychain',
            'sku': 'SIHA-KCH-002',
            'price': Decimal('249.00'),
            'sale_price': Decimal('199.00'),
            'short_description': 'Puffy crocheted mini heart charm with delicate lace edging and pearl bead accent.',
            'description': 'The sweetest gift to remind someone they are treasured. Light, soft, and hand-stitched with love in our signature pastel tones.',
            'material': 'Milk Cotton, Faux Pearl, Gold Clasp',
            'dimensions': '5cm x 5cm',
            'care_instructions': 'Spot clean only.',
            'estimated_dispatch_days': 1,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': False,
            'primary_image_url': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Blush Pink', 'color_code': '#F8DDE0', 'size': 'One Size', 'stock': 30},
                {'color': 'Soft Lavender', 'color_code': '#EAE2F5', 'size': 'One Size', 'stock': 20},
            ]
        },

        # Yarn and Supplies
        {
            'category': 'yarn-crochet-supplies',
            'name': 'Pastel Palette 5-Ply Milk Cotton Yarn (100g Skein)',
            'sku': 'SIHA-SUP-001',
            'price': Decimal('240.00'),
            'sale_price': Decimal('210.00'),
            'short_description': 'Buttery soft 5-ply combed milk cotton yarn ideal for plushies, wearables, and delicate blankets.',
            'description': 'Our handpicked milk cotton yarn offers unbeatable stitch definition, subtle natural sheen, and zero split fibers. Glides smoothly across any hook without hand fatigue.',
            'material': '80% Combed Cotton, 20% Milk Fiber',
            'dimensions': '100g / 193 meters (211 yards)',
            'care_instructions': 'Machine washable gentle cycle 30°C. Lay flat to dry.',
            'estimated_dispatch_days': 1,
            'is_ready_stock': True,
            'is_customizable': False,
            'is_featured': True,
            'primary_image_url': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Blush Pink (Code 08)', 'color_code': '#F8DDE0', 'size': '100g Skein', 'stock': 40},
                {'color': 'Warm Cream (Code 02)', 'color_code': '#FFF9F3', 'size': '100g Skein', 'stock': 35},
                {'color': 'Sage Green (Code 19)', 'color_code': '#DCE8D8', 'size': '100g Skein', 'stock': 25},
                {'color': 'Soft Lavender (Code 24)', 'color_code': '#EAE2F5', 'size': '100g Skein', 'stock': 30},
            ]
        },
        {
            'category': 'yarn-crochet-supplies',
            'name': 'Ergonomic Soft-Grip Pastel Crochet Hook Set (9 Sizes)',
            'sku': 'SIHA-SUP-002',
            'price': Decimal('799.00'),
            'sale_price': Decimal('699.00'),
            'short_description': 'Complete set of 9 ergonomic silicone grip hooks (2.0mm to 6.0mm) with smooth aluminum glide tips.',
            'description': 'Say goodbye to wrist and finger strain. Each hook features an ergonomically molded soft-touch handle color-coded in soothing pastels with laser-engraved sizing.',
            'material': 'High-Grade Aluminum, Soft Silicone Grip',
            'dimensions': 'Lengths 14cm (Sizes: 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0mm)',
            'care_instructions': 'Wipe clean with a microfiber cloth.',
            'estimated_dispatch_days': 1,
            'is_ready_stock': True,
            'is_customizable': False,
            'is_featured': False,
            'primary_image_url': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Pastel Macaron Collection', 'color_code': '#F8DDE0', 'size': 'Set of 9 Hooks', 'stock': 18},
            ]
        },

        # Home Décor & Coasters
        {
            'category': 'home-decor-coasters',
            'name': 'Botanical Floral Coaster Set (Pack of 4)',
            'sku': 'SIHA-DEC-001',
            'price': Decimal('499.00'),
            'sale_price': Decimal('449.00'),
            'short_description': 'Four absorbent handmade floral coasters with scalloped petals in harmonious pastel shades.',
            'description': 'Protect your tabletops with handcrafted elegance. Thick, absorbent double-knit cotton insulates against both hot coffee mugs and chilled drinks.',
            'material': '100% Thick Mercerized Cotton',
            'dimensions': '12cm Diameter per Coaster',
            'care_instructions': 'Hand or machine wash gentle in laundry net. Block and dry flat.',
            'estimated_dispatch_days': 2,
            'is_ready_stock': True,
            'is_customizable': True,
            'is_featured': False,
            'primary_image_url': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
            'variants': [
                {'color': 'Pastel Meadow Quad', 'color_code': '#DCE8D8', 'size': 'Pack of 4', 'stock': 20},
                {'color': 'Monochrome Cream & Blush', 'color_code': '#FFF9F3', 'size': 'Pack of 4', 'stock': 15},
            ]
        },
    ]

    for pdata in products_data:
        cat = cat_objs[pdata['category']]
        prod, created = Product.objects.update_or_create(
            sku=pdata['sku'],
            defaults={
                'name': pdata['name'],
                'category': cat,
                'price': pdata['price'],
                'sale_price': pdata['sale_price'],
                'short_description': pdata['short_description'],
                'description': pdata['description'],
                'material': pdata['material'],
                'dimensions': pdata['dimensions'],
                'care_instructions': pdata['care_instructions'],
                'estimated_dispatch_days': pdata['estimated_dispatch_days'],
                'is_ready_stock': pdata['is_ready_stock'],
                'is_customizable': pdata['is_customizable'],
                'is_featured': pdata['is_featured'],
                'primary_image_url': pdata['primary_image_url'],
                'is_active': True,
            }
        )

        # Primary Product Image
        ProductImage.objects.update_or_create(
            product=prod,
            is_primary=True,
            defaults={
                'image_url': pdata['primary_image_url'],
                'alt_text': prod.name,
                'order': 1
            }
        )

        # Variants and stock
        total_p_stock = 0
        for v in pdata['variants']:
            variant_obj, _ = ProductVariant.objects.update_or_create(
                product=prod,
                color=v['color'],
                size=v['size'],
                defaults={
                    'color_code': v['color_code'],
                    'stock': v['stock'],
                    'price_adjustment': Decimal('0.00'),
                    'is_active': True
                }
            )
            total_p_stock += v['stock']

        # Inventory record
        inv, _ = InventoryRecord.objects.update_or_create(
            product=prod,
            defaults={
                'quantity': total_p_stock,
                'low_stock_threshold': 5,
                'reserved_quantity': 0
            }
        )
        if created:
            InventoryMovement.objects.create(
                product=prod,
                movement_type=InventoryMovement.MovementType.STOCK_IN,
                quantity_delta=total_p_stock,
                quantity_before=0,
                quantity_after=total_p_stock,
                reason='Initial catalogue opening stock',
                recorded_by=admin_user
            )

    print(f"Catalog populated with {Product.objects.count()} products across {Category.objects.count()} categories.")

    # 6. Crochet Training Classes with Google Meet Links
    classes_data = [
        {
            'title': 'Beginner Crochet Basics: Foundation Stitches & Granny Squares',
            'slug': 'beginner-crochet-basics',
            'skill_level': CrochetClass.SkillLevel.BEGINNER,
            'price': Decimal('499.00'),
            'duration_minutes': 90,
            'instructor_name': 'SiHA Master Artisan',
            'instructor_bio': 'Handcraft designer with over 8 years of crochet experience, specializing in mindful stitching and beginner ergonomics.',
            'cover_image_url': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
            'description': 'Start your crochet journey with step-by-step personal guidance! In this live interactive workshop, you will learn how to hold the hook comfortably, create slip knots, chain stitches, single crochet, and double crochet, culminating in your first complete classic Granny Square.',
            'required_materials': '- 4.0mm or 4.5mm Crochet Hook\n- 100g 4-ply or 5-ply Cotton or Acrylic Yarn (light color recommended for visibility)\n- Small Pair of Scissors\n- 2 Stitch Markers\n- Tapestry Yarn Needle',
            'learning_outcomes': '- Master consistent tension and comfortable hand positioning\n- Understand stitch anatomy (front loop, back loop, post)\n- Read standard written crochet abbreviations (ch, sc, dc, sl st)\n- Weave in tails securely for a clean finish',
            'sessions': [
                {'days_ahead': 3, 'hour': 17, 'max': 15, 'meet': 'https://meet.google.com/sih-crft-cls1'},
                {'days_ahead': 10, 'hour': 11, 'max': 15, 'meet': 'https://meet.google.com/sih-crft-cls2'},
            ]
        },
        {
            'title': 'Amigurumi Mastery: Crochet Your First Plushie Companion',
            'slug': 'amigurumi-mastery-plushie',
            'skill_level': CrochetClass.SkillLevel.INTERMEDIATE,
            'price': Decimal('799.00'),
            'duration_minutes': 120,
            'instructor_name': 'SiHA Master Artisan',
            'instructor_bio': 'Amigurumi sculptor creating cute character designs and heirloom plush companions.',
            'cover_image_url': 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=800&q=80',
            'description': 'Take your skills into the 3D realm! Learn the indispensable Magic Ring technique, seamless amigurumi increases and invisible decreases, shaping techniques, safety eye placement, firm stuffing methods, and seamless limb attachment.',
            'required_materials': '- 3.0mm or 3.5mm Crochet Hook\n- 100g Worsted or Milk Cotton Yarn\n- 100g Polyfill Toy Stuffing\n- 1 Pair of 9mm Black Safety Eyes with Washers\n- Tapestry Needle & Embroidery Thread',
            'learning_outcomes': '- Perfect the Magic Ring circle without gaps\n- Execute invisible decrease (invdec) for smooth rounded shapes\n- Stuff evenly to prevent lumpy or misshapen figures\n- Seamlessly join limbs with invisible mattress stitch',
            'sessions': [
                {'days_ahead': 5, 'hour': 16, 'max': 12, 'meet': 'https://meet.google.com/sih-crft-cls3'},
                {'days_ahead': 14, 'hour': 15, 'max': 12, 'meet': 'https://meet.google.com/sih-crft-cls4'},
            ]
        },
        {
            'title': 'Everlasting Crochet Blooms: Hand-Stitched Floral Bouquets',
            'slug': 'everlasting-crochet-blooms',
            'skill_level': CrochetClass.SkillLevel.ALL_LEVELS,
            'price': Decimal('599.00'),
            'duration_minutes': 105,
            'instructor_name': 'SiHA Master Artisan',
            'instructor_bio': 'Floral artisan combining botanical realism with delicate pastel yarn artistry.',
            'cover_image_url': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
            'description': 'Discover the joy of crafting perpetual flowers! You will craft a realistic layered rose, a curved tulip, and realistic eucalyptus leaves, learning how to work with floral wire to give your bouquet lifelike posture and grace.',
            'required_materials': '- 2.5mm or 3.0mm Crochet Hook\n- 4-Ply Cotton Yarn in Pink, Cream, and Sage Green\n- 20-Gauge Green Floral Wire & Hot Glue Stick\n- Floral Tape & Pliers',
            'learning_outcomes': '- Shape petals using treble and double treble crochet\n- Inlay wire inside stitches for bendable natural foliage\n- Wrap and finish floral stems cleanly with floristry tape\n- Professional bouquet wrapping and ribbon tying',
            'sessions': [
                {'days_ahead': 7, 'hour': 18, 'max': 15, 'meet': 'https://meet.google.com/sih-crft-cls5'},
            ]
        },
    ]

    for cdata in classes_data:
        cobj, _ = CrochetClass.objects.update_or_create(
            slug=cdata['slug'],
            defaults={
                'title': cdata['title'],
                'skill_level': cdata['skill_level'],
                'price': cdata['price'],
                'duration_minutes': cdata['duration_minutes'],
                'instructor_name': cdata['instructor_name'],
                'instructor_bio': cdata['instructor_bio'],
                'cover_image_url': cdata['cover_image_url'],
                'description': cdata['description'],
                'required_materials': cdata['required_materials'],
                'learning_outcomes': cdata['learning_outcomes'],
                'is_active': True
            }
        )

        # Create session dates
        now = timezone.now()
        for s in cdata['sessions']:
            s_date = (now + timedelta(days=s['days_ahead'])).replace(hour=s['hour'], minute=0, second=0, microsecond=0)
            e_date = s_date + timedelta(minutes=cdata['duration_minutes'])
            ClassSession.objects.update_or_create(
                crochet_class=cobj,
                start_time=s_date,
                defaults={
                    'end_time': e_date,
                    'max_participants': s['max'],
                    'google_meet_link': s['meet'],
                    'is_cancelled': False
                }
            )

        # Add sample PDF pattern / resource
        ClassResource.objects.update_or_create(
            crochet_class=cobj,
            title=f"{cobj.title} - Official Pattern & Stitch Guide (PDF)",
            defaults={
                'description': 'Comprehensive step-by-step illustrated PDF guide with stitch diagrams, abbreviation glossary, and yarn conversion chart.',
                'external_link': 'https://sihacraftstudio.com/resources/sample-crochet-guide.pdf',
                'is_public': False
            }
        )

    print(f"Loaded {CrochetClass.objects.count()} crochet classes and sessions.")

    # 7. Sample Customization Request
    custom_req, _ = CustomizationRequest.objects.update_or_create(
        request_number='CR-20261026-DEMO',
        defaults={
            'user': customer_user,
            'name': 'Aaradhya Sharma',
            'email': 'customer@sihacraftstudio.com',
            'phone': '+91 98765 43210',
            'category': CustomizationRequest.CategoryType.PLUSHIES,
            'title': 'Pastel Lilac Bunny with Floral Ear Headband',
            'description': 'I would love a personalized amigurumi bunny similar to the Blush Bunny, but in lilac purple with a tiny wreath of daisy flowers around one ear. It is a birthday surprise for my sister.',
            'color_preferences': 'Soft lilac purple body, butter-yellow flower centers, sage green leaves',
            'size_preferences': 'Medium (approx. 28-30cm)',
            'quantity': 1,
            'budget_range_inr': '₹1,000 - ₹1,500',
            'required_by_date': (timezone.now() + timedelta(days=14)).date(),
            'status': CustomizationRequest.Status.QUOTATION_SENT,
            'admin_notes': 'Can be completed in 5 days. Custom floral headband pattern ready.'
        }
    )

    CustomizationQuote.objects.update_or_create(
        request=custom_req,
        defaults={
            'quote_amount': Decimal('1199.00'),
            'estimated_production_days': 6,
            'quote_details': 'Handcrafted customized amigurumi bunny in premium lilac cotton with miniature hand-embroidered daisy headband. Includes personalized gift wrapping and handwritten card.',
            'valid_until': (timezone.now() + timedelta(days=7)).date(),
            'is_accepted': False
        }
    )

    print("SiHA Craft Studio database seeding successfully completed!")


if __name__ == '__main__':
    seed_database()
