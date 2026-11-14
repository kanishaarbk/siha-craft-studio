import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'siha_backend.settings')
django.setup()

from catalog.models import Category, Product, ProductImage, ProductVariant
from inventory.models import InventoryRecord

# 1. Standardize / Create the 7 main product categories
CATEGORIES_DATA = [
    {
        'name': 'Crochet Bags',
        'slug': 'crochet-bags',
        'description': 'Handcrafted crochet tote bags, daisy shoulder bags, and slow-crafted floral slings.',
        'order': 1
    },
    {
        'name': 'Crochet Accessories',
        'slug': 'crochet-accessories',
        'description': 'Wearable slow-crafted accents including scrunchies, headbands, keychains, and bookmarks.',
        'order': 2
    },
    {
        'name': 'Crochet Flowers',
        'slug': 'crochet-flowers',
        'description': 'Everlasting handmade flower bouquets, roses, tulips, and cheerful sunflower stems.',
        'order': 3
    },
    {
        'name': 'Amigurumi Toys',
        'slug': 'amigurumi-toys',
        'description': 'Ultra-soft hand-crocheted plushies, gentle teddy bears, bunnies, ducks, and cute animals.',
        'order': 4
    },
    {
        'name': 'Home Décor',
        'slug': 'home-decor',
        'description': 'Artisan coasters, table runners, macramé-inspired wall hangings, and crochet baskets.',
        'order': 5
    },
    {
        'name': 'Baby Collection',
        'slug': 'baby-collection',
        'description': 'Gentle, hypoallergenic hand-stitched baby dresses, caps, booties, and newborn gift sets.',
        'order': 6
    },
    {
        'name': 'Custom Orders',
        'slug': 'custom-orders',
        'description': 'Bespoke made-to-order commissions tailored specifically to your chosen colors and designs.',
        'order': 7
    },
]

# 2. Comprehensive 42 Sample Products (6 per category)
PRODUCTS_DATA = [
    # ==================== CATEGORY 1: CROCHET BAGS ====================
    {
        'category_slug': 'crochet-bags',
        'name': 'Pastel Crochet Tote Bag',
        'sku': 'SIHA-BAG-003',
        'price': Decimal('1499.00'),
        'sale_price': Decimal('1349.00'),
        'short_description': 'Spacious pastel shoulder tote hand-stitched with durable cotton cord and reinforced handles.',
        'description': 'Our Pastel Crochet Tote Bag combines functional everyday durability with slow-crafted elegance. Hand-stitched using 100% double-ply organic cotton yarn, this roomy tote comfortably fits a tablet, book, wallet, and essentials. The sturdy tight stitches prevent sagging while retaining a wonderfully soft texture.',
        'material': '100% Organic Double-Ply Cotton Yarn',
        'dimensions': '32cm x 36cm (Handle drop: 26cm)',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/crochet-handbag-display.png',
        'variants': [
            {'color': 'Sage Green & Cream', 'color_code': '#84977B', 'size': 'Standard', 'stock': 8},
            {'color': 'Dusty Pink & Cream', 'color_code': '#D98FA5', 'size': 'Standard', 'stock': 6},
        ]
    },
    {
        'category_slug': 'crochet-bags',
        'name': 'Daisy Crochet Shoulder Bag',
        'sku': 'SIHA-BAG-004',
        'price': Decimal('1299.00'),
        'sale_price': Decimal('1199.00'),
        'short_description': 'Charming vintage shoulder bag adorned with raised 3D daisy flower motifs.',
        'description': 'Brighten every day with our Daisy Crochet Shoulder Bag. Featuring textured 3D daisy flower appliqués hand-stitched across a warm cream foundation, this bag adds a joyful artisanal touch to casual and weekend outfits. Includes a smooth inner cotton lining and magnetic snap clasp.',
        'material': 'Soft Cotton & Acrylic Blend',
        'dimensions': '28cm x 24cm (Strap length: 60cm)',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/crochet-sunflower-bag.png',
        'variants': [
            {'color': 'Cream & Daisy Yellow', 'color_code': '#FFFDF7', 'size': 'Medium', 'stock': 10},
            {'color': 'Sage Green & Daisy', 'color_code': '#84977B', 'size': 'Medium', 'stock': 7},
        ]
    },
    {
        'category_slug': 'crochet-bags',
        'name': 'Mini Crochet Sling Bag',
        'sku': 'SIHA-BAG-005',
        'price': Decimal('899.00'),
        'sale_price': None,
        'short_description': 'Compact lightweight crossbody sling designed for phone, cards, and daily essentials.',
        'description': 'A minimalist, hands-free companion for quick cafe visits and weekend strolls. This Mini Crochet Sling Bag is woven in a dense textured moss stitch, providing structure while being feather-light over your shoulder.',
        'material': '100% Combed Cotton Yarn',
        'dimensions': '18cm x 13cm x 4cm (Strap drop: 52cm)',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Dusty Pink', 'color_code': '#D98FA5', 'size': 'Compact', 'stock': 12},
            {'color': 'Deep Sage', 'color_code': '#566B50', 'size': 'Compact', 'stock': 9},
            {'color': 'Warm Cream', 'color_code': '#FFFDF7', 'size': 'Compact', 'stock': 11},
        ]
    },
    {
        'category_slug': 'crochet-bags',
        'name': 'Granny Square Handbag',
        'sku': 'SIHA-BAG-006',
        'price': Decimal('1599.00'),
        'sale_price': Decimal('1449.00'),
        'short_description': 'Heirloom retro granny square purse with solid wooden handles and internal lining.',
        'description': 'A tribute to nostalgic retro needlecraft. Each Granny Square Handbag features 18 individual granny squares meticulously joined and framed with circular wooden ring handles. The interior is fully lined with soft organic cotton muslin.',
        'material': 'Mercerized Cotton with Natural Wooden Handles',
        'dimensions': '30cm x 28cm x 8cm',
        'estimated_dispatch_days': 3,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Pastel Meadow Palette', 'color_code': '#84977B', 'size': 'Standard', 'stock': 5},
            {'color': 'Blush Earthy Tones', 'color_code': '#D98FA5', 'size': 'Standard', 'stock': 4},
        ]
    },
    {
        'category_slug': 'crochet-bags',
        'name': 'Crochet Everyday Tote',
        'sku': 'SIHA-BAG-007',
        'price': Decimal('1399.00'),
        'sale_price': None,
        'short_description': 'Practical, breathable mesh-weave market tote engineered for farmers markets and book runs.',
        'description': 'Crafted in an airy open-stitch filet crochet technique, our Everyday Tote expands gently to accommodate produce, yarn skeins, or your favorite beach read. Strong braided strap distributes weight evenly across the shoulder.',
        'material': 'Heavy Duty 3-Ply Cotton Cord',
        'dimensions': '38cm x 40cm',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': False,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Natural Ecru', 'color_code': '#FFFDF7', 'size': 'Large', 'stock': 14},
            {'color': 'Sage Green', 'color_code': '#84977B', 'size': 'Large', 'stock': 8},
        ]
    },
    {
        'category_slug': 'crochet-bags',
        'name': 'Floral Crochet Crossbody Bag',
        'sku': 'SIHA-BAG-008',
        'price': Decimal('1199.00'),
        'sale_price': Decimal('1099.00'),
        'short_description': 'Delicate floral medallion crossbody bag with secure zipper closure and tassel detail.',
        'description': 'Featuring an intricate lace mandala medallion pattern, this crossbody bag brings botanical charm to your wardrobe. Fitted with a smooth zip fastener and handcrafted tassel pull.',
        'material': 'Premium Milk Cotton Yarn',
        'dimensions': '22cm diameter x 6cm depth',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Blush Pink', 'color_code': '#D98FA5', 'size': 'Standard', 'stock': 7},
            {'color': 'Olive Sage', 'color_code': '#566B50', 'size': 'Standard', 'stock': 6},
        ]
    },

    # ==================== CATEGORY 2: CROCHET ACCESSORIES ====================
    {
        'category_slug': 'crochet-accessories',
        'name': 'Pastel Crochet Scrunchies',
        'sku': 'SIHA-ACC-001',
        'price': Decimal('249.00'),
        'sale_price': Decimal('199.00'),
        'short_description': 'Gentle snag-free hair scrunchie crocheted around an elastic core with soft scalloped edges.',
        'description': 'Protect your hair from breakage with our artisan crochet scrunchie. Crocheted around high-resilience non-slip elastic, the ruffled cotton petals add delicate volume to everyday ponytails and messy buns without pulling.',
        'material': '100% Skin-Friendly Milk Cotton Yarn',
        'dimensions': '11cm outer diameter',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Dusty Pink', 'color_code': '#D98FA5', 'size': 'Regular', 'stock': 25},
            {'color': 'Sage Green', 'color_code': '#84977B', 'size': 'Regular', 'stock': 20},
            {'color': 'Warm Cream', 'color_code': '#FFFDF7', 'size': 'Regular', 'stock': 22},
        ]
    },
    {
        'category_slug': 'crochet-accessories',
        'name': 'Floral Crochet Headband',
        'sku': 'SIHA-ACC-002',
        'price': Decimal('399.00'),
        'sale_price': None,
        'short_description': 'Adjustable vintage floral crown headband with tie-back ribbons for effortless styling.',
        'description': 'Channel romantic cottagecore charm with our Floral Crochet Headband. A garland of hand-stitched mini blossom florets connected by an airy leafy vine that ties comfortably at the nape of your neck.',
        'material': '100% Combed Cotton Thread',
        'dimensions': 'Band: 38cm, Ribbon ties: 25cm each',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Meadow Green & Pink', 'color_code': '#84977B', 'size': 'Free Size', 'stock': 12},
            {'color': 'Cream & White Daisy', 'color_code': '#FFFDF7', 'size': 'Free Size', 'stock': 14},
        ]
    },
    {
        'category_slug': 'crochet-accessories',
        'name': 'Mini Crochet Keychains',
        'sku': 'SIHA-ACC-003',
        'price': Decimal('199.00'),
        'sale_price': None,
        'short_description': 'Delightful miniature amigurumi keychain charms with antique brass hardware.',
        'description': 'Add personality to your keys, bag zippers, or car fob with our hand-stitched mini charms. Firmly stuffed with eco-polyester and anchored to a sturdy stainless steel split ring.',
        'material': 'Cotton Yarn & Brass Hardware',
        'dimensions': '5cm x 4cm',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Mini Strawberry', 'color_code': '#D98FA5', 'size': 'Mini', 'stock': 18},
            {'color': 'Mini Acorn', 'color_code': '#566B50', 'size': 'Mini', 'stock': 15},
            {'color': 'Mini Daisy', 'color_code': '#FFFDF7', 'size': 'Mini', 'stock': 20},
        ]
    },
    {
        'category_slug': 'crochet-accessories',
        'name': 'Crochet Bookmark',
        'sku': 'SIHA-ACC-004',
        'price': Decimal('229.00'),
        'sale_price': Decimal('199.00'),
        'short_description': 'Flat lace bookmark adorned with a botanical sprout and silk tassel for avid readers.',
        'description': 'A thoughtful handmade gift for bookworms. Super thin profile lies completely flat between pages without bending the spine, finished with a delightful crochet blossom tassel.',
        'material': 'Mercerized Cotton Thread',
        'dimensions': '24cm length (including stem & tassel)',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Botanical Sprout Green', 'color_code': '#84977B', 'size': 'Standard', 'stock': 25},
            {'color': 'Cherry Blossom Pink', 'color_code': '#D98FA5', 'size': 'Standard', 'stock': 22},
        ]
    },
    {
        'category_slug': 'crochet-accessories',
        'name': 'Cute Crochet Hair Clips',
        'sku': 'SIHA-ACC-005',
        'price': Decimal('299.00'),
        'sale_price': None,
        'short_description': 'Set of 2 alligator clips wrapped in crochet floral blossoms and delicate leaves.',
        'description': 'Gentle alligator clips fully wrapped in soft crochet stitches so metal never rubs against sensitive scalps. Adorned with tiny handmade daisies and buttercups.',
        'material': 'Milk Cotton & Metal Alligator Clip',
        'dimensions': '6cm length per clip',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': False,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Blush Duo (Pair of 2)', 'color_code': '#D98FA5', 'size': 'Standard Pair', 'stock': 16},
            {'color': 'Sage Duo (Pair of 2)', 'color_code': '#84977B', 'size': 'Standard Pair', 'stock': 14},
        ]
    },
    {
        'category_slug': 'crochet-accessories',
        'name': 'Crochet Flower Keychain',
        'sku': 'SIHA-ACC-006',
        'price': Decimal('249.00'),
        'sale_price': Decimal('219.00'),
        'short_description': 'Double-sided 3D puffed crochet flower charm with leafy vine and golden clasp.',
        'description': 'A cheerful puff flower keychain handcrafted with five plush petals and leafy accents. Stitched in our signature Namakkal studio with lustrous golden lobster swivel hooks.',
        'material': '100% Cotton Yarn & Gold Tone Alloy',
        'dimensions': '8cm total length, flower 5.5cm diameter',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Dusty Pink & White', 'color_code': '#D98FA5', 'size': 'Standard', 'stock': 18},
            {'color': 'Sunflower Yellow', 'color_code': '#F3DCE3', 'size': 'Standard', 'stock': 15},
        ]
    },

    # ==================== CATEGORY 3: CROCHET FLOWERS ====================
    {
        'category_slug': 'crochet-flowers',
        'name': 'Pink Rose Bouquet',
        'sku': 'SIHA-FLW-003',
        'price': Decimal('1299.00'),
        'sale_price': Decimal('1149.00'),
        'short_description': 'Heirloom bouquet of 5 hand-crocheted blush roses wrapped in craft paper and twine.',
        'description': 'A timeless floral arrangement that never wilts. This Pink Rose Bouquet features five hand-crafted open rose blossoms complete with delicate calyxes, bendable floristry wire stems, and realistic crochet foliage. Arrives beautifully wrapped in premium tissue paper and tied with natural jute twine.',
        'material': 'Soft Combed Cotton Yarn & Floral Wire Stems',
        'dimensions': '34cm height x 20cm bouquet spread',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/crochet-flower-bouquet.png',
        'variants': [
            {'color': 'Blush Pink & Ivory', 'color_code': '#D98FA5', 'size': '5-Stem Bouquet', 'stock': 8},
            {'color': 'Deep Rose & Sage', 'color_code': '#566B50', 'size': '5-Stem Bouquet', 'stock': 6},
        ]
    },
    {
        'category_slug': 'crochet-flowers',
        'name': 'Daisy Flower Bouquet',
        'sku': 'SIHA-FLW-004',
        'price': Decimal('1099.00'),
        'sale_price': None,
        'short_description': 'Sunny bouquet of 6 crisp white daisies with golden centers and leafy accents.',
        'description': 'Bring meadow sunshine into any room. Each daisy is hand-crocheted with 12 radiant petals and a textured honey-yellow pistil, supported by flexible floral wire so you can arrange them in your favorite ceramic vase.',
        'material': '100% Milk Cotton Yarn',
        'dimensions': '30cm height x 18cm spread',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Classic White & Gold', 'color_code': '#FFFDF7', 'size': '6-Stem Bouquet', 'stock': 10},
            {'color': 'Pastel Mixed Daisies', 'color_code': '#F3DCE3', 'size': '6-Stem Bouquet', 'stock': 7},
        ]
    },
    {
        'category_slug': 'crochet-flowers',
        'name': 'Sunflower Crochet Stem',
        'sku': 'SIHA-FLW-005',
        'price': Decimal('449.00'),
        'sale_price': Decimal('399.00'),
        'short_description': 'Single large statement sunflower with chocolate seed head and double petal tiers.',
        'description': 'A vibrant single stem sunflower featuring two full tiers of golden amber petals hand-stitched around an intricate chocolate seed center. Includes two textured leaves along the bendable stem.',
        'material': 'Premium Cotton & Flexible Internal Wire',
        'dimensions': '35cm stem height, 12cm blossom diameter',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': False,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Golden Sunflower', 'color_code': '#84977B', 'size': 'Single Stem', 'stock': 15},
        ]
    },
    {
        'category_slug': 'crochet-flowers',
        'name': 'Tulip Crochet Bouquet',
        'sku': 'SIHA-FLW-006',
        'price': Decimal('1199.00'),
        'sale_price': Decimal('1049.00'),
        'short_description': 'Arrangement of 5 closed and blooming Dutch tulip stems in calming pastel hues.',
        'description': 'Elegant Dutch tulip blossoms hand-crocheted in smooth gradient milk cotton. Their graceful teardrop silhouette and smooth long green foliage bring Scandinavian serenity to mantels and office desks.',
        'material': 'Lustrous Milk Cotton Yarn',
        'dimensions': '32cm height',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Pastel Pink & Cream', 'color_code': '#D98FA5', 'size': '5-Stem Bouquet', 'stock': 9},
            {'color': 'Soft Sage & Lavender', 'color_code': '#84977B', 'size': '5-Stem Bouquet', 'stock': 6},
        ]
    },
    {
        'category_slug': 'crochet-flowers',
        'name': 'Single Crochet Rose',
        'sku': 'SIHA-FLW-007',
        'price': Decimal('349.00'),
        'sale_price': None,
        'short_description': 'Individual handcrafted long-stem rose presented with natural kraft packaging.',
        'description': 'The quintessential gesture of affection. An individual blooming rose crafted with 16 layered petals, thornless leafy stem, and craft tag for your handwritten message.',
        'material': '100% Pure Cotton Yarn',
        'dimensions': '32cm height, 8cm rose head',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Dusty Rose', 'color_code': '#D98FA5', 'size': 'Single Stem', 'stock': 20},
            {'color': 'Creamy White', 'color_code': '#FFFDF7', 'size': 'Single Stem', 'stock': 18},
            {'color': 'Deep Crimson', 'color_code': '#566B50', 'size': 'Single Stem', 'stock': 12},
        ]
    },
    {
        'category_slug': 'crochet-flowers',
        'name': 'Mixed Pastel Flower Bouquet',
        'sku': 'SIHA-FLW-008',
        'price': Decimal('1499.00'),
        'sale_price': Decimal('1399.00'),
        'short_description': 'Deluxe botanical bouquet combining roses, tulips, daisies, and lavender sprigs.',
        'description': 'Our flagship florist arrangement. An exquisite medley of 2 blush roses, 2 lavender sprigs, 2 Dutch tulips, and 2 mini daisies hand-assembled into a breathtaking artisanal centerpiece.',
        'material': 'Pure Organic Cotton & Velvet Ribbons',
        'dimensions': '36cm height x 24cm spread',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/crochet-flower-bouquet.png',
        'variants': [
            {'color': 'Signature Studio Pastel Blend', 'color_code': '#D98FA5', 'size': 'Deluxe 8-Stem Bouquet', 'stock': 6},
        ]
    },

    # ==================== CATEGORY 4: AMIGURUMI TOYS ====================
    {
        'category_slug': 'amigurumi-toys',
        'name': 'Teddy Bear with Flower Bouquet',
        'sku': 'SIHA-TOY-004',
        'price': Decimal('1699.00'),
        'sale_price': Decimal('1499.00'),
        'short_description': 'Beloved collectible amigurumi teddy bear clutching an everlasting crochet bouquet.',
        'description': 'The signature piece of Siha Craft Studio. Hand-stitched with ultra-soft hypoallergenic cotton in a warm biscuit hue, this heirloom teddy bear holds a miniature five-flower crochet bouquet between its gentle paws. Embroidered safety eyes and non-allergenic polyfill make it safe and cuddle-friendly for all ages.',
        'material': '100% Baby Cotton Yarn & Hypoallergenic Fiberfill',
        'dimensions': '24cm sitting height x 18cm width',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/teddy-bear-bouquet.png',
        'variants': [
            {'color': 'Biscuit Bear with Pastel Bouquet', 'color_code': '#FFFDF7', 'size': 'Standard (24cm)', 'stock': 10},
            {'color': 'Cream Bear with Rose Bouquet', 'color_code': '#D98FA5', 'size': 'Standard (24cm)', 'stock': 8},
        ]
    },
    {
        'category_slug': 'amigurumi-toys',
        'name': 'Mini Crochet Bunny',
        'sku': 'SIHA-TOY-005',
        'price': Decimal('699.00'),
        'sale_price': None,
        'short_description': 'Pocket-sized amigurumi bunny rabbit with floppy ears and blush pink cheeks.',
        'description': 'Small enough to accompany you anywhere. This adorable pocket bunny features extra-long floppy ears, stitched whiskers, and hand-tinted pastel cheeks.',
        'material': 'Milk Cotton Yarn',
        'dimensions': '16cm height (including ears)',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Soft White', 'color_code': '#FFFDF7', 'size': 'Pocket Mini', 'stock': 14},
            {'color': 'Dusty Pink', 'color_code': '#D98FA5', 'size': 'Pocket Mini', 'stock': 11},
            {'color': 'Sage Green Overall', 'color_code': '#84977B', 'size': 'Pocket Mini', 'stock': 9},
        ]
    },
    {
        'category_slug': 'amigurumi-toys',
        'name': 'Crochet Duck',
        'sku': 'SIHA-TOY-006',
        'price': Decimal('749.00'),
        'sale_price': Decimal('649.00'),
        'short_description': 'Chubby yellow duckling wearing a tiny crochet frog hat and mini crossbody bag.',
        'description': 'Irresistibly quirky and cute! Our plump yellow duckling comes styled with a removable green frog beanie hat and a miniature flower purse. Guaranteed to bring smiles to desks and nursery shelves.',
        'material': 'Soft Anti-Pill Cotton Yarn',
        'dimensions': '14cm height x 12cm width',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Classic Yellow Duck', 'color_code': '#F3DCE3', 'size': 'Medium', 'stock': 12},
        ]
    },
    {
        'category_slug': 'amigurumi-toys',
        'name': 'Cute Crochet Cat',
        'sku': 'SIHA-TOY-007',
        'price': Decimal('849.00'),
        'sale_price': None,
        'short_description': 'Sleepy calico kitten plush with curled tail and cozy knitted scarf.',
        'description': 'A peaceful amigurumi feline companion sleeping peacefully. Stitched in gentle calico patches with delicate embroidered eyelashes and a warm removable neckerchief.',
        'material': '100% Combed Cotton',
        'dimensions': '18cm length x 11cm height',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Calico Mix', 'color_code': '#FFFDF7', 'size': 'Standard', 'stock': 8},
            {'color': 'Slate Grey & Cream', 'color_code': '#84977B', 'size': 'Standard', 'stock': 7},
        ]
    },
    {
        'category_slug': 'amigurumi-toys',
        'name': 'Mini Crochet Bear',
        'sku': 'SIHA-TOY-008',
        'price': Decimal('699.00'),
        'sale_price': Decimal('599.00'),
        'short_description': 'Pocket palm bear dressed in tiny knitted overalls with wooden button details.',
        'description': 'Handcrafted palm-sized friend designed to fit snugly inside a coat pocket or travel pouch. Embroidered facial features and durable jointed arms.',
        'material': 'Hypoallergenic Organic Cotton',
        'dimensions': '15cm height',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Honey Biscuit', 'color_code': '#84977B', 'size': 'Palm Mini', 'stock': 16},
            {'color': 'Warm Chestnut', 'color_code': '#566B50', 'size': 'Palm Mini', 'stock': 12},
        ]
    },
    {
        'category_slug': 'amigurumi-toys',
        'name': 'Crochet Frog Plushie',
        'sku': 'SIHA-TOY-009',
        'price': Decimal('799.00'),
        'sale_price': None,
        'short_description': 'Happy wide-eyed moss frog with rosy cheeks and poseable dangle legs.',
        'description': 'Spreading cheerful vibes wherever he perches. Crocheted in earthy sage green with oversized expressive eyes and floppy legs that dangle over bookshelf edges.',
        'material': 'Anti-Pilling Milk Cotton',
        'dimensions': '17cm seated height',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': False,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Moss Sage Green', 'color_code': '#84977B', 'size': 'Medium', 'stock': 10},
        ]
    },

    # ==================== CATEGORY 5: HOME DÉCOR ====================
    {
        'category_slug': 'home-decor',
        'name': 'Pastel Crochet Coasters',
        'sku': 'SIHA-DEC-002',
        'price': Decimal('499.00'),
        'sale_price': Decimal('429.00'),
        'short_description': 'Set of 4 absorbent double-stitched cotton drink coasters with scalloped borders.',
        'description': 'Shield your wooden and glass tables in style with our set of four hand-crocheted mug coasters. Super absorbent, washable, and finished with delicate scalloped lace edging.',
        'material': '100% Absorbent Natural Cotton Yarn',
        'dimensions': '12cm diameter each (Set of 4)',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Sage & Cream Mix (Set of 4)', 'color_code': '#84977B', 'size': 'Pack of 4', 'stock': 18},
            {'color': 'Dusty Pink & Cream (Set of 4)', 'color_code': '#D98FA5', 'size': 'Pack of 4', 'stock': 15},
        ]
    },
    {
        'category_slug': 'home-decor',
        'name': 'Crochet Table Runner',
        'sku': 'SIHA-DEC-003',
        'price': Decimal('1799.00'),
        'sale_price': Decimal('1599.00'),
        'short_description': 'Heirloom lace dining table runner with intricate botanical motifs and tassel ends.',
        'description': 'Elevate your dining and coffee table with an heirloom centerpiece. Hand-crocheted over 40 artisan hours in a floral lace medallion repeat, finished with hand-knotted fringe tassels at each end.',
        'material': 'High-Tenacity Mercerized Cotton Thread',
        'dimensions': '140cm x 32cm (including tassels)',
        'estimated_dispatch_days': 3,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/crochet-workspace.png',
        'variants': [
            {'color': 'Warm Cream', 'color_code': '#FFFDF7', 'size': 'Standard 140cm', 'stock': 6},
            {'color': 'Soft Sage Mist', 'color_code': '#84977B', 'size': 'Standard 140cm', 'stock': 4},
        ]
    },
    {
        'category_slug': 'home-decor',
        'name': 'Floral Wall Hanging',
        'sku': 'SIHA-DEC-004',
        'price': Decimal('1299.00'),
        'sale_price': None,
        'short_description': 'Bohemian wall tapestry suspended on natural treated driftwood with crochet floral cascade.',
        'description': 'Add textural warmth to bedrooms and living spaces. Features layered crochet leaves and 3D floral blooms cascading from a smooth wooden dowel with sturdy hanging loop.',
        'material': 'Cotton Macrame Cord & Teak Dowel',
        'dimensions': '35cm width x 60cm drop',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Botanical Sage & Blush', 'color_code': '#84977B', 'size': 'Medium', 'stock': 7},
        ]
    },
    {
        'category_slug': 'home-decor',
        'name': 'Crochet Storage Basket',
        'sku': 'SIHA-DEC-005',
        'price': Decimal('999.00'),
        'sale_price': Decimal('899.00'),
        'short_description': 'Sturdy freestanding woven cotton rope basket with integrated carry handles.',
        'description': 'A beautiful organizer for craft supplies, nursery essentials, bathroom accessories, or bedside knickknacks. Rigid base and dense tight knit hold its round silhouette even when empty.',
        'material': 'Thick 5mm Braided Cotton Cord',
        'dimensions': '22cm diameter x 16cm height',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Two-Tone Sage & Natural', 'color_code': '#84977B', 'size': 'Medium', 'stock': 9},
            {'color': 'Two-Tone Blush & Natural', 'color_code': '#D98FA5', 'size': 'Medium', 'stock': 8},
        ]
    },
    {
        'category_slug': 'home-decor',
        'name': 'Decorative Crochet Cushion Cover',
        'sku': 'SIHA-DEC-006',
        'price': Decimal('1199.00'),
        'sale_price': None,
        'short_description': 'Textured crochet front pillow sham with hidden zipper and smooth canvas backing.',
        'description': 'Handcrafted front panel in a tactile bobble and waffle crochet weave, backed with durable cotton canvas and a concealed zip closure for easy laundering.',
        'material': 'Cotton Front & Heavy Canvas Back',
        'dimensions': '40cm x 40cm (Fits 16" insert)',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Cream Bobble Texture', 'color_code': '#FFFDF7', 'size': '16x16 inch', 'stock': 11},
            {'color': 'Sage Green Waffle', 'color_code': '#84977B', 'size': '16x16 inch', 'stock': 9},
        ]
    },
    {
        'category_slug': 'home-decor',
        'name': 'Crochet Plant Pot Cover',
        'sku': 'SIHA-DEC-007',
        'price': Decimal('599.00'),
        'sale_price': Decimal('529.00'),
        'short_description': 'Chic textured cozy designed to slip effortlessly over nursery and indoor plant pots.',
        'description': 'Give your houseplants a warm handmade sweater! Features a foldable ribbed top rim to adjust height perfectly to your pot, stitched with thick moisture-resistant cotton.',
        'material': 'Heavy Cotton Cord',
        'dimensions': '15cm diameter x 14cm height',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Earth Sage', 'color_code': '#566B50', 'size': 'Fits 4-6" Pots', 'stock': 16},
            {'color': 'Cream Macramé', 'color_code': '#FFFDF7', 'size': 'Fits 4-6" Pots', 'stock': 14},
        ]
    },

    # ==================== CATEGORY 6: BABY COLLECTION ====================
    {
        'category_slug': 'baby-collection',
        'name': 'Crochet Baby Dress',
        'sku': 'SIHA-BBY-001',
        'price': Decimal('1599.00'),
        'sale_price': Decimal('1399.00'),
        'short_description': 'Soft heirloom infant frock with delicate lace yoke, wooden buttons, and flutter sleeves.',
        'description': 'Lovingly handcrafted with ultra-soft, certified hypoallergenic organic bamboo-cotton yarn. Gentle against delicate newborn skin with no scratchy seams, coconut shell back buttons, and a flared scalloped skirt.',
        'material': '100% Organic Bamboo Cotton Blend',
        'dimensions': 'Size 0–6 Months (Length: 36cm, Chest: 44cm)',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Blush Pink', 'color_code': '#D98FA5', 'size': '0-6 Months', 'stock': 6},
            {'color': 'Pure Cream', 'color_code': '#FFFDF7', 'size': '6-12 Months', 'stock': 5},
            {'color': 'Sage Whisper', 'color_code': '#84977B', 'size': '0-6 Months', 'stock': 4},
        ]
    },
    {
        'category_slug': 'baby-collection',
        'name': 'Baby Crochet Cap',
        'sku': 'SIHA-BBY-002',
        'price': Decimal('449.00'),
        'sale_price': None,
        'short_description': 'Breathable newborn pixie bonnet with chin ties and soft ribbing to keep ears cozy.',
        'description': 'A classic vintage pixie bonnet hand-stitched with breathable ribbed stitches that stretch naturally as baby grows. Features soft braided chin cords to stay securely in place.',
        'material': 'Ultra-Gentle Milk Cotton',
        'dimensions': 'Head circumference 34–40cm',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Warm Cream', 'color_code': '#FFFDF7', 'size': 'Newborn (0-3M)', 'stock': 12},
            {'color': 'Dusty Pink', 'color_code': '#D98FA5', 'size': 'Infant (3-9M)', 'stock': 10},
            {'color': 'Sage Green', 'color_code': '#84977B', 'size': 'Newborn (0-3M)', 'stock': 8},
        ]
    },
    {
        'category_slug': 'baby-collection',
        'name': 'Baby Booties',
        'sku': 'SIHA-BBY-003',
        'price': Decimal('499.00'),
        'sale_price': Decimal('449.00'),
        'short_description': 'Soft-soled infant booties with stay-on ankle tie ribbons and plush turnover cuffs.',
        'description': 'Keep tiny toes snug in these charming hand-crocheted baby booties. Featuring seamless soft soles and functional satin ankle ribbons designed to prevent booties from kicking off.',
        'material': '100% Baby Cotton Yarn',
        'dimensions': 'Sole length: 9.5cm (0–6 Months)',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Cream & Pink Ribbon', 'color_code': '#D98FA5', 'size': '0-6 Months', 'stock': 14},
            {'color': 'Cream & Sage Ribbon', 'color_code': '#84977B', 'size': '0-6 Months', 'stock': 11},
        ]
    },
    {
        'category_slug': 'baby-collection',
        'name': 'Newborn Crochet Gift Set',
        'sku': 'SIHA-BBY-004',
        'price': Decimal('2199.00'),
        'sale_price': Decimal('1999.00'),
        'short_description': 'Complete luxury gift hamper containing baby bonnet, booties, mini rattle, and blanket.',
        'description': 'The ultimate welcome hamper for new parents. Handcrafted with love in Namakkal, this set includes matching baby bonnet, soft booties, mini amigurumi bunny rattle, and mini security lovey, all presented in a reusable keepsake box.',
        'material': 'Certified Hypoallergenic Organic Cotton',
        'dimensions': 'Deluxe Hamper Set',
        'estimated_dispatch_days': 2,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/teddy-bear-bouquet.png',
        'variants': [
            {'color': 'Unisex Cream & Sage', 'color_code': '#84977B', 'size': '0-6M Hamper', 'stock': 6},
            {'color': 'Blush Pink & Ivory', 'color_code': '#D98FA5', 'size': '0-6M Hamper', 'stock': 5},
        ]
    },
    {
        'category_slug': 'baby-collection',
        'name': 'Baby Blanket',
        'sku': 'SIHA-BBY-005',
        'price': Decimal('1899.00'),
        'sale_price': Decimal('1699.00'),
        'short_description': 'Breathable cellular baby blanket in soft ripple wave stitch with shell border.',
        'description': 'An heirloom blanket destined to be cherished through generations. Woven in a light, breathable chevron wave stitch that allows safe airflow while providing comforting warmth during stroller rides and crib naps.',
        'material': '100% Breathable Combed Cotton',
        'dimensions': '85cm x 75cm',
        'estimated_dispatch_days': 3,
        'is_ready_stock': True,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Pastel Meadow Wave (Sage/Cream/Pink)', 'color_code': '#84977B', 'size': 'Crib Size (85x75cm)', 'stock': 5},
            {'color': 'Solid Warm Cream', 'color_code': '#FFFDF7', 'size': 'Crib Size (85x75cm)', 'stock': 4},
        ]
    },
    {
        'category_slug': 'baby-collection',
        'name': 'Baby Headband Set',
        'sku': 'SIHA-BBY-006',
        'price': Decimal('399.00'),
        'sale_price': None,
        'short_description': 'Trio of ultra-soft stretchy nylon headbands with miniature crochet blossoms.',
        'description': 'Designed specifically for delicate infant heads. Ultra-stretchy seamless nylon bands that never leave pressure marks, topped with delicate micro-crochet roses and buttercups.',
        'material': 'Soft Nylon & Fine Cotton Yarn',
        'dimensions': 'Set of 3 (Fits 0–24 Months)',
        'estimated_dispatch_days': 1,
        'is_ready_stock': True,
        'is_customizable': False,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Blush / Cream / Sage Trio', 'color_code': '#D98FA5', 'size': 'Set of 3', 'stock': 15},
        ]
    },

    # ==================== CATEGORY 7: CUSTOM ORDERS (MADE TO ORDER) ====================
    {
        'category_slug': 'custom-orders',
        'name': 'Customized Amigurumi Toy',
        'sku': 'SIHA-CST-001',
        'price': Decimal('1899.00'),
        'sale_price': None,
        'short_description': 'Made-to-order personalized plush companion crafted from your reference photos or sketches.',
        'description': 'Turn your ideas, favorite animals, or beloved pets into a cuddly heirloom amigurumi toy. Once ordered, our head artisan coordinates with you to finalize colors, accessories, and embroidered name tags. Hand-crafted specifically for you with love in Namakkal.',
        'material': 'Custom Organic Cotton Yarn & Safety Eyes',
        'dimensions': 'Custom Height (Approx 20–28cm)',
        'estimated_dispatch_days': 8,
        'is_ready_stock': False,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/teddy-bear-bouquet.png',
        'variants': [
            {'color': 'Custom Color Palette', 'color_code': '#84977B', 'size': 'Custom Spec', 'stock': 99},
        ]
    },
    {
        'category_slug': 'custom-orders',
        'name': 'Personalized Crochet Doll',
        'sku': 'SIHA-CST-002',
        'price': Decimal('2299.00'),
        'sale_price': None,
        'short_description': 'Bespoke portrait doll custom-styled with hair, outfit, and initials of your choice.',
        'description': 'A heartwarming keepsake doll crafted to resemble a child, bride, graduate, or loved one. Customize skin tone, hairstyle, attire, and personalized embroidered initial charms.',
        'material': 'Premium Cotton & Hypoallergenic Fiberfill',
        'dimensions': '30cm height',
        'estimated_dispatch_days': 10,
        'is_ready_stock': False,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Custom Portrait Specification', 'color_code': '#D98FA5', 'size': '30cm Bespoke', 'stock': 99},
        ]
    },
    {
        'category_slug': 'custom-orders',
        'name': 'Custom Flower Bouquet',
        'sku': 'SIHA-CST-003',
        'price': Decimal('1699.00'),
        'sale_price': None,
        'short_description': 'Curate your dream everlasting floral arrangement with chosen flower species and stem counts.',
        'description': 'Design your own everlasting floral centerpiece or wedding keepsake. Select from our studio repertoire of roses, tulips, daisies, sunflowers, calla lilies, and eucalyptus foliage in your wedding or home decor palette.',
        'material': 'Artisan Cotton Yarn & Wire Stems',
        'dimensions': 'Custom Bouquet Spread',
        'estimated_dispatch_days': 7,
        'is_ready_stock': False,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': '/images/crochet-flower-bouquet.png',
        'variants': [
            {'color': 'Custom Floral Palette', 'color_code': '#D98FA5', 'size': 'Curated Bouquet', 'stock': 99},
        ]
    },
    {
        'category_slug': 'custom-orders',
        'name': 'Customized Crochet Bag',
        'sku': 'SIHA-CST-004',
        'price': Decimal('1999.00'),
        'sale_price': None,
        'short_description': 'Tailor-made tote or crossbody bag customized in size, strap length, motifs, and lining.',
        'description': 'Bring your ideal bag to life. Choose strap type (leather or crochet), lining pockets, zipper or magnetic closure, and unique floral or geometric motifs.',
        'material': 'Heavy Duty Cotton Cord',
        'dimensions': 'Custom Dimensions',
        'estimated_dispatch_days': 9,
        'is_ready_stock': False,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': '/images/crochet-handbag-display.png',
        'variants': [
            {'color': 'Bespoke Bag Specification', 'color_code': '#566B50', 'size': 'Custom Spec', 'stock': 99},
        ]
    },
    {
        'category_slug': 'custom-orders',
        'name': 'Personalized Keychain',
        'sku': 'SIHA-CST-005',
        'price': Decimal('349.00'),
        'sale_price': None,
        'short_description': 'Hand-stitched initial letter or custom symbol charm with engraved wooden medallion.',
        'description': 'An intimate small gift featuring your chosen alphabet initial letter hand-crocheted in 3D, accompanied by a laser-engraved wooden tag with custom initials or dates.',
        'material': 'Fine Cotton Thread & Brass Clasp',
        'dimensions': 'Approx 8cm length',
        'estimated_dispatch_days': 4,
        'is_ready_stock': False,
        'is_customizable': True,
        'is_featured': False,
        'primary_image_url': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
        'variants': [
            {'color': 'Custom Letter & Color', 'color_code': '#84977B', 'size': 'Personalized', 'stock': 99},
        ]
    },
    {
        'category_slug': 'custom-orders',
        'name': 'Custom Baby Gift Set',
        'sku': 'SIHA-CST-006',
        'price': Decimal('2499.00'),
        'sale_price': None,
        'short_description': 'Bespoke newborn hamper tailored with custom color themes and embroidered baby name.',
        'description': 'The most personal baby shower gift possible. Crafted in your nursery theme with embroidered baby name initials on the blanket and keepsake rattle. Includes gift card and ribbon presentation.',
        'material': 'Organic Hypoallergenic Bamboo Cotton',
        'dimensions': 'Custom Luxury Gift Box',
        'estimated_dispatch_days': 10,
        'is_ready_stock': False,
        'is_customizable': True,
        'is_featured': True,
        'primary_image_url': '/images/teddy-bear-bouquet.png',
        'variants': [
            {'color': 'Bespoke Baby Theme', 'color_code': '#FFFDF7', 'size': 'Custom Hamper', 'stock': 99},
        ]
    },
]

def run():
    print("Populating official Siha Craft Studio categories & sample products...")

    # 1. Update/Create Categories
    category_objs = {}
    for cat_data in CATEGORIES_DATA:
        # Check by slug or name
        cat = Category.objects.filter(slug=cat_data['slug']).first()
        if not cat:
            cat = Category.objects.filter(name=cat_data['name']).first()
        if cat:
            cat.name = cat_data['name']
            cat.slug = cat_data['slug']
            cat.description = cat_data['description']
            cat.order = cat_data['order']
            cat.is_active = True
            cat.save()
            print(f"Updated category: {cat.name} ({cat.slug})")
        else:
            cat = Category.objects.create(
                name=cat_data['name'],
                slug=cat_data['slug'],
                description=cat_data['description'],
                order=cat_data['order'],
                is_active=True
            )
            print(f"Created category: {cat.name} ({cat.slug})")
        category_objs[cat_data['slug']] = cat

    # Also make sure existing category records map smoothly if any
    legacy_map = {
        'crochet-bags-purses': 'crochet-bags',
        'keychains-small-gifts': 'crochet-accessories',
        'crochet-flowers-bouquets': 'crochet-flowers',
        'crochet-toys-plushies': 'amigurumi-toys',
        'home-decor-coasters': 'home-decor',
    }
    for old_slug, new_slug in legacy_map.items():
        old_cat = Category.objects.filter(slug=old_slug).first()
        if old_cat and old_slug != new_slug:
            # We can keep or update slug
            target = category_objs.get(new_slug)
            if target and target.id != old_cat.id:
                print(f"Legacy category {old_slug} already exists; preserving.")

    # 2. Populate Products safely and idempotently
    created_count = 0
    updated_count = 0

    for pdata in PRODUCTS_DATA:
        cat = category_objs.get(pdata['category_slug'])
        if not cat:
            print(f"Warning: Category not found for {pdata['category_slug']}")
            continue

        prod, created = Product.objects.update_or_create(
            sku=pdata['sku'],
            defaults={
                'name': pdata['name'],
                'category': cat,
                'price': pdata['price'],
                'sale_price': pdata.get('sale_price'),
                'short_description': pdata['short_description'],
                'description': pdata['description'],
                'material': pdata['material'],
                'dimensions': pdata['dimensions'],
                'care_instructions': 'Hand wash gently in cold water with mild liquid detergent. Lay flat on a clean dry towel. Do not bleach, wring, or tumble dry.',
                'estimated_dispatch_days': pdata['estimated_dispatch_days'],
                'is_ready_stock': pdata['is_ready_stock'],
                'is_customizable': pdata['is_customizable'],
                'is_featured': pdata.get('is_featured', False),
                'is_active': True,
                'primary_image_url': pdata['primary_image_url'],
            }
        )

        if created:
            created_count += 1
        else:
            updated_count += 1

        # Primary ProductImage
        ProductImage.objects.update_or_create(
            product=prod,
            is_primary=True,
            defaults={
                'image_url': pdata['primary_image_url'],
                'alt_text': prod.name,
                'order': 0,
            }
        )

        # Variants
        total_stock = 0
        for vdata in pdata.get('variants', []):
            variant, _ = ProductVariant.objects.update_or_create(
                product=prod,
                color=vdata['color'],
                size=vdata['size'],
                defaults={
                    'color_code': vdata.get('color_code', '#84977B'),
                    'stock': vdata['stock'],
                    'is_active': True,
                }
            )
            total_stock += vdata['stock']

        # Ensure Inventory Record
        InventoryRecord.objects.update_or_create(
            product=prod,
            defaults={
                'quantity': total_stock or 10,
                'low_stock_threshold': 3,
                'reserved_quantity': 0,
            }
        )

    print(f"Seeding completed successfully! Created: {created_count}, Updated: {updated_count}, Total in DB: {Product.objects.count()}")

if __name__ == '__main__':
    run()

