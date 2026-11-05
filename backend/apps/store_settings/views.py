from decimal import Decimal
from django.db.models import Sum, F, Count, Q
from django.utils import timezone
from rest_framework import views, status, permissions
from rest_framework.response import Response

from .models import StoreSetting, AuditLog
from notifications.models import NewsletterSubscriber, Notification
from orders.models import Order, OrderItem, Coupon
from catalog.models import Product, Category, ProductVariant, ProductImage, Review
from inventory.models import InventoryRecord, InventoryMovement
from classes.models import CrochetClass, ClassSession, ClassBooking
from customizations.models import CustomizationRequest
from accounts.models import User
from accounts.permissions import IsStaffOrAdmin


class PublicStoreSettingsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings_qs = StoreSetting.objects.all()
        data = {s.key: s.value for s in settings_qs}
        # Defaults if not configured
        defaults = {
            'store_name': 'SiHA Craft Studio',
            'tagline': 'Little Stitches, Handmade with Love',
            'contact_email': 'hello@sihacraftstudio.com',
            'whatsapp_number': '919876543210',
            'instagram_url': 'https://instagram.com/sihacraftstudio',
            'free_shipping_threshold': '999',
            'default_shipping_fee': '79',
            'business_address': 'Bengaluru, Karnataka, India',
            'currency': 'INR',
            'currency_symbol': '₹'
        }
        for k, v in defaults.items():
            if k not in data:
                data[k] = v
        return Response(data)


class NewsletterSubscribeView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email or '@' not in email:
            return Response({'error': 'Please provide a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

        sub, created = NewsletterSubscriber.objects.get_or_create(email=email)
        return Response({
            'message': 'Thank you for subscribing to the SiHA Craft Studio newsletter!',
            'created': created
        })


class ContactMessageView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()
        subject = request.data.get('subject', 'Customer Inquiry').strip()
        message = request.data.get('message', '').strip()

        if not name or not email or not message:
            return Response({'error': 'Name, email, and message are required.'}, status=status.HTTP_400_BAD_REQUEST)

        Notification.objects.create(
            recipient_email=email,
            notification_type=Notification.NotificationType.REGISTRATION,
            subject=f"SiHA Craft Studio: We received your inquiry regarding {subject}",
            message=f"Dear {name},\n\nThank you for reaching out to SiHA Craft Studio! We have received your message:\n\n\"{message}\"\n\nOur team will respond to you at this email address within 24 business hours.\n\nWarm regards,\nSiHA Craft Studio Artisan Team"
        )

        return Response({
            'message': 'Your message has been sent successfully. We will reply to your email shortly!'
        })


# STAFF & ADMIN DASHBOARD APIS
class AdminDashboardStatsView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        now = timezone.now()

        # Real calculations from MySQL
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(fulfillment_status='PENDING_PAYMENT').count()

        verified_rev_agg = Order.objects.filter(payment_status='PAID').aggregate(Sum('total_amount'))
        verified_revenue = float(verified_rev_agg['total_amount__sum'] or 0.0)

        pending_payments = Order.objects.filter(payment_status='PENDING').count()

        total_products = Product.objects.count()
        low_stock_count = InventoryRecord.objects.filter(
            quantity__lte=F('low_stock_threshold'),
            quantity__gt=0
        ).count()
        out_of_stock_count = InventoryRecord.objects.filter(quantity__lte=0).count()
        in_stock_count = max(0, total_products - out_of_stock_count)

        total_available_stock_agg = InventoryRecord.objects.aggregate(total=Sum('quantity'))
        total_available_stock = total_available_stock_agg['total'] or 0

        pending_customizations = CustomizationRequest.objects.filter(
            status__in=['NEW', 'UNDER_REVIEW']
        ).count()

        upcoming_classes = ClassSession.objects.filter(start_time__gte=now).count()
        total_enrollments = ClassBooking.objects.filter(booking_status='CONFIRMED').count()

        # Recent orders
        recent_orders = [
            {
                'id': o.id,
                'order_number': o.order_number,
                'customer_name': o.shipping_name,
                'amount': float(o.total_amount),
                'payment_status': o.payment_status,
                'fulfillment_status': o.fulfillment_status,
                'date': o.created_at
            }
            for o in Order.objects.all().order_by('-created_at')[:6]
        ]

        # Recent inventory updates
        recent_inventory_updates = [
            {
                'id': m.id,
                'product_name': m.product.name,
                'sku': m.product.sku,
                'movement_type': m.get_movement_type_display(),
                'quantity_delta': m.quantity_delta,
                'quantity_before': m.quantity_before,
                'quantity_after': m.quantity_after,
                'reason': m.reason,
                'admin': m.recorded_by.email if m.recorded_by else 'Admin',
                'timestamp': m.created_at
            }
            for m in InventoryMovement.objects.select_related('product', 'recorded_by').all().order_by('-created_at')[:6]
        ]

        # Recent audit logs
        recent_logs = [
            {
                'id': log.id,
                'action': log.action,
                'resource': log.resource,
                'details': log.details,
                'user': log.user.email if log.user else 'System',
                'timestamp': log.created_at
            }
            for log in AuditLog.objects.all().order_by('-created_at')[:8]
        ]

        return Response({
            'total_products': total_products,
            'total_available_stock': total_available_stock,
            'low_stock_products': low_stock_count,
            'out_of_stock_products': out_of_stock_count,
            'products_in_stock': in_stock_count,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'verified_revenue': verified_revenue,
            'pending_payments': pending_payments,
            'pending_customizations': pending_customizations,
            'upcoming_classes': upcoming_classes,
            'class_enrollments': total_enrollments,
            'recent_orders': recent_orders,
            'recent_inventory_updates': recent_inventory_updates,
            'recent_logs': recent_logs
        })


class AdminInventoryListView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        queryset = InventoryRecord.objects.select_related('product__category').prefetch_related('product__variants')

        # Filter by stock status
        stock_status = request.query_params.get('status')
        if stock_status == 'low':
            queryset = queryset.filter(quantity__lte=F('low_stock_threshold'), quantity__gt=0)
        elif stock_status == 'out':
            queryset = queryset.filter(quantity__lte=0)
        elif stock_status == 'adequate':
            queryset = queryset.filter(quantity__gt=F('low_stock_threshold'))

        # Search query
        search_query = request.query_params.get('search')
        if search_query:
            q = search_query.strip()
            queryset = queryset.filter(
                Q(product__name__icontains=q) |
                Q(product__sku__icontains=q) |
                Q(product__category__name__icontains=q)
            )

        inventory_items = queryset.order_by('quantity')
        data = [
            {
                'id': inv.id,
                'product_id': inv.product.id,
                'product_name': inv.product.name,
                'sku': inv.product.sku,
                'category': inv.product.category.name,
                'category_id': inv.product.category.id,
                'primary_image_url': inv.product.primary_image_url,
                'quantity': inv.quantity,
                'low_stock_threshold': inv.low_stock_threshold,
                'available_quantity': inv.available_quantity,
                'is_low_stock': inv.is_low_stock,
                'is_out_of_stock': inv.is_out_of_stock,
                'is_active': inv.product.is_active,
                'variants': [
                    {
                        'id': v.id,
                        'color': v.color,
                        'size': v.size,
                        'color_code': v.color_code,
                        'stock': v.stock,
                        'price_adjustment': float(v.price_adjustment),
                        'is_active': v.is_active,
                    }
                    for v in inv.product.variants.all()
                ],
                'updated_at': inv.updated_at
            }
            for inv in inventory_items
        ]
        return Response(data)


class AdminInventoryAdjustView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity_delta = request.data.get('quantity_delta')
        new_quantity = request.data.get('new_quantity')
        low_stock_threshold = request.data.get('low_stock_threshold')
        reason = request.data.get('reason', 'Manual administrative stock adjustment')

        if not product_id:
            return Response({'error': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prod = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        inv, _ = InventoryRecord.objects.get_or_create(product=prod)
        before = inv.quantity

        variant_obj = None
        if variant_id:
            try:
                variant_obj = prod.variants.get(id=variant_id)
            except ProductVariant.DoesNotExist:
                return Response({'error': 'Variant not found for this product.'}, status=status.HTTP_404_NOT_FOUND)

        # Update threshold if requested
        if low_stock_threshold is not None and str(low_stock_threshold).isdigit():
            inv.low_stock_threshold = int(low_stock_threshold)
            inv.save(update_fields=['low_stock_threshold'])

        # Calculate new quantity
        if new_quantity is not None and str(new_quantity).lstrip('-').isdigit():
            after = max(0, int(new_quantity))
            delta = after - before
        elif quantity_delta is not None and str(quantity_delta).lstrip('-').isdigit():
            delta = int(quantity_delta)
            if variant_obj:
                v_before = variant_obj.stock
                v_after = max(0, v_before + delta)
                variant_obj.stock = v_after
                variant_obj.save(update_fields=['stock'])
                # Sum total variants
                after = sum(v.stock for v in prod.variants.all())
            else:
                after = max(0, before + delta)
        else:
            # Low stock threshold update only
            if low_stock_threshold is not None:
                return Response({
                    'message': f'Low stock alert threshold updated to {inv.low_stock_threshold}.',
                    'new_quantity': inv.quantity,
                    'low_stock_threshold': inv.low_stock_threshold
                })
            return Response({'error': 'Either quantity_delta, new_quantity, or low_stock_threshold is required.'}, status=status.HTTP_400_BAD_REQUEST)

        inv.quantity = after
        inv.save()

        # If direct product update (without specific variant), update first variant if present
        if not variant_obj:
            first_v = prod.variants.first()
            if first_v:
                first_v.stock = after
                first_v.save(update_fields=['stock'])

        # Record movement
        delta_val = delta if 'delta' in locals() else (after - before)
        movement_type = InventoryMovement.MovementType.STOCK_IN if delta_val >= 0 else InventoryMovement.MovementType.STOCK_OUT
        InventoryMovement.objects.create(
            product=prod,
            variant=variant_obj,
            movement_type=movement_type,
            quantity_delta=delta_val,
            quantity_before=before,
            quantity_after=after,
            reason=reason,
            recorded_by=request.user
        )

        AuditLog.objects.create(
            user=request.user,
            action='INVENTORY_ADJUSTMENT',
            resource='Product',
            resource_id=str(prod.id),
            details=f"Stock adjusted by {delta_val:+d} ({before} -> {after}). Reason: {reason}"
        )

        return Response({
            'message': f'Inventory for "{prod.name}" updated successfully.',
            'new_quantity': after,
            'is_low_stock': inv.is_low_stock,
            'is_out_of_stock': inv.is_out_of_stock,
            'low_stock_threshold': inv.low_stock_threshold
        })


class AdminInventoryHistoryView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        queryset = InventoryMovement.objects.select_related('product', 'variant', 'recorded_by').all().order_by('-created_at')

        product_id = request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        history = [
            {
                'id': m.id,
                'product_id': m.product.id,
                'product_name': m.product.name,
                'sku': m.product.sku,
                'variant_name': f"{m.variant.color} / {m.variant.size}" if m.variant else 'Standard',
                'movement_type': m.movement_type,
                'movement_type_display': m.get_movement_type_display(),
                'quantity_delta': m.quantity_delta,
                'quantity_before': m.quantity_before,
                'quantity_after': m.quantity_after,
                'reason': m.reason,
                'admin_email': m.recorded_by.email if m.recorded_by else 'Admin',
                'admin_name': (m.recorded_by.get_full_name() or m.recorded_by.email) if m.recorded_by else 'Artisan Staff',
                'created_at': m.created_at,
            }
            for m in queryset[:100]
        ]
        return Response(history)


class AdminProductManageView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request, product_id=None):
        if product_id:
            try:
                prod = Product.objects.select_related('category', 'inventory').prefetch_related('variants', 'images').get(id=product_id)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

            inv = getattr(prod, 'inventory', None)
            return Response({
                'id': prod.id,
                'name': prod.name,
                'slug': prod.slug,
                'sku': prod.sku,
                'category_id': prod.category.id,
                'category_name': prod.category.name,
                'price': float(prod.price),
                'sale_price': float(prod.sale_price) if prod.sale_price else None,
                'current_price': float(prod.current_price),
                'short_description': prod.short_description,
                'description': prod.description,
                'material': prod.material,
                'dimensions': prod.dimensions,
                'care_instructions': prod.care_instructions,
                'estimated_dispatch_days': prod.estimated_dispatch_days,
                'is_ready_stock': prod.is_ready_stock,
                'is_customizable': prod.is_customizable,
                'is_featured': prod.is_featured,
                'is_active': prod.is_active,
                'primary_image_url': prod.primary_image_url,
                'stock': inv.quantity if inv else 0,
                'low_stock_threshold': inv.low_stock_threshold if inv else 5,
                'images': [
                    {
                        'id': img.id,
                        'image_url': img.image_url or (img.image.url if img.image else ''),
                        'alt_text': img.alt_text,
                        'is_primary': img.is_primary,
                        'order': img.order,
                    }
                    for img in prod.images.all()
                ],
                'variants': [
                    {
                        'id': v.id,
                        'color': v.color,
                        'color_code': v.color_code,
                        'size': v.size,
                        'sku_suffix': v.sku_suffix,
                        'price_adjustment': float(v.price_adjustment),
                        'stock': v.stock,
                        'is_active': v.is_active,
                    }
                    for v in prod.variants.all()
                ],
                'created_at': prod.created_at,
                'updated_at': prod.updated_at,
            })

        # List all products
        queryset = Product.objects.select_related('category', 'inventory').prefetch_related('variants', 'images').all()

        # Category filter
        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Active filter
        active_filter = request.query_params.get('is_active')
        if active_filter in ('true', '1'):
            queryset = queryset.filter(is_active=True)
        elif active_filter in ('false', '0'):
            queryset = queryset.filter(is_active=False)

        # Stock status filter
        stock_status = request.query_params.get('stock_status')
        if stock_status == 'low':
            queryset = queryset.filter(inventory__quantity__lte=F('inventory__low_stock_threshold'), inventory__quantity__gt=0)
        elif stock_status == 'out':
            queryset = queryset.filter(inventory__quantity__lte=0)
        elif stock_status == 'in_stock':
            queryset = queryset.filter(inventory__quantity__gt=0)

        # Search query
        search_query = request.query_params.get('search')
        if search_query:
            q = search_query.strip()
            queryset = queryset.filter(
                Q(name__icontains=q) |
                Q(sku__icontains=q) |
                Q(category__name__icontains=q) |
                Q(description__icontains=q)
            )

        products = queryset.order_by('-created_at')
        data = [
            {
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'sku': p.sku,
                'category_id': p.category.id,
                'category_name': p.category.name,
                'price': float(p.price),
                'sale_price': float(p.sale_price) if p.sale_price else None,
                'current_price': float(p.current_price),
                'short_description': p.short_description,
                'is_featured': p.is_featured,
                'is_active': p.is_active,
                'primary_image_url': p.primary_image_url,
                'stock': p.total_stock,
                'is_in_stock': p.is_in_stock,
                'variants_count': p.variants.count(),
                'images_count': p.images.count(),
                'variants': [
                    {
                        'id': v.id,
                        'color': v.color,
                        'size': v.size,
                        'color_code': v.color_code,
                        'stock': v.stock,
                        'price_adjustment': float(v.price_adjustment),
                        'is_active': v.is_active,
                    }
                    for v in p.variants.all()
                ],
                'created_at': p.created_at,
            }
            for p in products
        ]
        return Response(data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        category_id = request.data.get('category_id')
        price = request.data.get('price')
        sale_price = request.data.get('sale_price')
        sku = request.data.get('sku', '').strip()
        description = request.data.get('description', '').strip()
        short_description = request.data.get('short_description', '').strip()
        material = request.data.get('material', '100% Premium Cotton Yarn').strip()
        dimensions = request.data.get('dimensions', 'Handcrafted Standard').strip()
        care_instructions = request.data.get('care_instructions', 'Hand wash gently in cold water. Lay flat to dry.').strip()
        estimated_dispatch_days = int(request.data.get('estimated_dispatch_days', 3))
        is_ready_stock = bool(request.data.get('is_ready_stock', True))
        is_customizable = bool(request.data.get('is_customizable', True))
        is_featured = bool(request.data.get('is_featured', False))
        is_active = bool(request.data.get('is_active', True))
        primary_image_url = request.data.get('primary_image_url', '').strip()
        stock = int(request.data.get('stock', 10))
        low_stock_threshold = int(request.data.get('low_stock_threshold', 5))
        image_urls = request.data.get('image_urls', [])
        variants_data = request.data.get('variants', [])

        if not name or not category_id or not price:
            return Response({'error': 'Product name, category, and price are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique SKU if not provided
        if not sku:
            import secrets
            sku = f"SIHA-{secrets.token_hex(3).upper()}"
        elif Product.objects.filter(sku=sku).exists():
            return Response({'error': f'Product with SKU "{sku}" already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cat = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({'error': 'Selected category does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        sale_price_val = Decimal(str(sale_price)) if sale_price else None
        price_val = Decimal(str(price))

        prod = Product.objects.create(
            name=name,
            sku=sku,
            category=cat,
            price=price_val,
            sale_price=sale_price_val,
            description=description or name,
            short_description=short_description or (description[:150] if description else name),
            material=material,
            dimensions=dimensions,
            care_instructions=care_instructions,
            estimated_dispatch_days=estimated_dispatch_days,
            is_ready_stock=is_ready_stock,
            is_customizable=is_customizable,
            is_featured=is_featured,
            is_active=is_active,
            primary_image_url=primary_image_url or (image_urls[0] if image_urls else 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80')
        )

        # Handle multiple images
        if primary_image_url and primary_image_url not in image_urls:
            image_urls.insert(0, primary_image_url)

        for idx, url in enumerate(image_urls):
            if url and str(url).strip():
                ProductImage.objects.create(
                    product=prod,
                    image_url=str(url).strip(),
                    alt_text=f"{prod.name} image {idx + 1}",
                    is_primary=(idx == 0),
                    order=idx
                )

        # Handle variants
        total_var_stock = 0
        if variants_data and isinstance(variants_data, list):
            for v_data in variants_data:
                v_stock = int(v_data.get('stock', stock))
                total_var_stock += v_stock
                ProductVariant.objects.create(
                    product=prod,
                    color=v_data.get('color', 'Standard'),
                    color_code=v_data.get('color_code', '#F8DDE0'),
                    size=v_data.get('size', 'Standard'),
                    sku_suffix=v_data.get('sku_suffix', ''),
                    price_adjustment=Decimal(str(v_data.get('price_adjustment', 0.00))),
                    stock=v_stock,
                    is_active=bool(v_data.get('is_active', True))
                )
        else:
            # Default variant
            ProductVariant.objects.create(
                product=prod,
                color='Standard',
                color_code='#F8DDE0',
                size='Standard',
                stock=stock,
                is_active=True
            )
            total_var_stock = stock

        effective_stock = total_var_stock if variants_data else stock

        # Inventory record
        InventoryRecord.objects.create(
            product=prod,
            quantity=effective_stock,
            low_stock_threshold=low_stock_threshold
        )

        # Inventory movement record
        InventoryMovement.objects.create(
            product=prod,
            movement_type=InventoryMovement.MovementType.STOCK_IN,
            quantity_delta=effective_stock,
            quantity_before=0,
            quantity_after=effective_stock,
            reason=f'Initial stock allocation for new product {prod.name}',
            recorded_by=request.user
        )

        AuditLog.objects.create(
            user=request.user,
            action='CREATE_PRODUCT',
            resource='Product',
            resource_id=str(prod.id),
            details=f"Product '{prod.name}' created with SKU {prod.sku} and initial stock {effective_stock}"
        )

        return Response({
            'message': f'Product "{prod.name}" created successfully.',
            'product_id': prod.id,
            'name': prod.name,
            'sku': prod.sku
        }, status=status.HTTP_201_CREATED)

    def put(self, request, product_id):
        try:
            prod = Product.objects.select_related('inventory').prefetch_related('variants', 'images').get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'name' in request.data:
            prod.name = request.data['name']
        if 'sku' in request.data:
            sku_val = request.data['sku'].strip()
            if sku_val and Product.objects.filter(sku=sku_val).exclude(id=prod.id).exists():
                return Response({'error': f'SKU "{sku_val}" already belongs to another product.'}, status=status.HTTP_400_BAD_REQUEST)
            prod.sku = sku_val
        if 'category_id' in request.data:
            try:
                prod.category = Category.objects.get(id=request.data['category_id'])
            except Category.DoesNotExist:
                return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        if 'price' in request.data:
            prod.price = Decimal(str(request.data['price']))
        if 'sale_price' in request.data:
            sp = request.data['sale_price']
            prod.sale_price = Decimal(str(sp)) if sp else None
        if 'description' in request.data:
            prod.description = request.data['description']
        if 'short_description' in request.data:
            prod.short_description = request.data['short_description']
        if 'material' in request.data:
            prod.material = request.data['material']
        if 'dimensions' in request.data:
            prod.dimensions = request.data['dimensions']
        if 'care_instructions' in request.data:
            prod.care_instructions = request.data['care_instructions']
        if 'estimated_dispatch_days' in request.data:
            prod.estimated_dispatch_days = int(request.data['estimated_dispatch_days'])
        if 'is_ready_stock' in request.data:
            prod.is_ready_stock = bool(request.data['is_ready_stock'])
        if 'is_customizable' in request.data:
            prod.is_customizable = bool(request.data['is_customizable'])
        if 'is_featured' in request.data:
            prod.is_featured = bool(request.data['is_featured'])
        if 'is_active' in request.data:
            prod.is_active = bool(request.data['is_active'])
        if 'primary_image_url' in request.data:
            prod.primary_image_url = request.data['primary_image_url']

        prod.save()

        # Update or add image URLs
        if 'image_urls' in request.data and isinstance(request.data['image_urls'], list):
            image_urls = request.data['image_urls']
            # Clear existing external URLs and replace
            prod.images.filter(image='').delete()
            for idx, url in enumerate(image_urls):
                if url and str(url).strip():
                    ProductImage.objects.create(
                        product=prod,
                        image_url=str(url).strip(),
                        alt_text=f"{prod.name} image {idx + 1}",
                        is_primary=(idx == 0),
                        order=idx
                    )

        # Update or add variants
        if 'variants' in request.data and isinstance(request.data['variants'], list):
            variants_input = request.data['variants']
            existing_variant_ids = []
            for v_data in variants_input:
                v_id = v_data.get('id')
                v_stock = int(v_data.get('stock', 0))
                v_price_adj = Decimal(str(v_data.get('price_adjustment', 0.00)))
                if v_id:
                    try:
                        v = prod.variants.get(id=v_id)
                        v.color = v_data.get('color', v.color)
                        v.color_code = v_data.get('color_code', v.color_code)
                        v.size = v_data.get('size', v.size)
                        v.price_adjustment = v_price_adj
                        v.stock = v_stock
                        v.is_active = bool(v_data.get('is_active', True))
                        v.save()
                        existing_variant_ids.append(v.id)
                    except ProductVariant.DoesNotExist:
                        pass
                else:
                    new_v = ProductVariant.objects.create(
                        product=prod,
                        color=v_data.get('color', 'Standard'),
                        color_code=v_data.get('color_code', '#F8DDE0'),
                        size=v_data.get('size', 'Standard'),
                        price_adjustment=v_price_adj,
                        stock=v_stock,
                        is_active=bool(v_data.get('is_active', True))
                    )
                    existing_variant_ids.append(new_v.id)

            # Sync inventory quantity to sum of variants
            total_stock = sum(v.stock for v in prod.variants.all())
            inv, _ = InventoryRecord.objects.get_or_create(product=prod)
            before = inv.quantity
            inv.quantity = total_stock
            inv.save()
            if before != total_stock:
                InventoryMovement.objects.create(
                    product=prod,
                    movement_type=InventoryMovement.MovementType.ADJUSTMENT,
                    quantity_delta=(total_stock - before),
                    quantity_before=before,
                    quantity_after=total_stock,
                    reason=f'Product variants update stock adjustment for {prod.name}',
                    recorded_by=request.user
                )
        elif 'stock' in request.data:
            new_stock = int(request.data['stock'])
            inv, _ = InventoryRecord.objects.get_or_create(product=prod)
            before = inv.quantity
            inv.quantity = new_stock
            inv.save()
            first_v = prod.variants.first()
            if first_v:
                first_v.stock = new_stock
                first_v.save(update_fields=['stock'])
            if before != new_stock:
                InventoryMovement.objects.create(
                    product=prod,
                    movement_type=InventoryMovement.MovementType.ADJUSTMENT,
                    quantity_delta=(new_stock - before),
                    quantity_before=before,
                    quantity_after=new_stock,
                    reason=f'Manual stock edit for {prod.name}',
                    recorded_by=request.user
                )

        if 'low_stock_threshold' in request.data:
            inv, _ = InventoryRecord.objects.get_or_create(product=prod)
            inv.low_stock_threshold = int(request.data['low_stock_threshold'])
            inv.save(update_fields=['low_stock_threshold'])

        AuditLog.objects.create(
            user=request.user,
            action='UPDATE_PRODUCT',
            resource='Product',
            resource_id=str(prod.id),
            details=f"Product '{prod.name}' updated."
        )

        return Response({'message': f'Product "{prod.name}" updated successfully.'})

    def delete(self, request, product_id):
        try:
            prod = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        prod_name = prod.name
        has_orders = OrderItem.objects.filter(product=prod).exists()

        if has_orders:
            # Safely deactivate so existing orders aren't corrupted
            prod.is_active = False
            prod.save(update_fields=['is_active'])
            AuditLog.objects.create(
                user=request.user,
                action='DEACTIVATE_PRODUCT',
                resource='Product',
                resource_id=str(prod.id),
                details=f"Product '{prod_name}' has customer order history, so it was marked inactive to preserve order records."
            )
            return Response({
                'message': f'Product "{prod_name}" has past order records, so it has been deactivated from catalog.',
                'deactivated': True
            })
        else:
            # No order dependencies - can safely hard delete
            prod.delete()
            AuditLog.objects.create(
                user=request.user,
                action='DELETE_PRODUCT',
                resource='Product',
                resource_id=str(product_id),
                details=f"Product '{prod_name}' deleted permanently."
            )
            return Response({
                'message': f'Product "{prod_name}" deleted successfully.',
                'deleted': True
            })



class AdminCouponManageView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        coupons = Coupon.objects.all().order_by('-valid_from')
        data = [
            {
                'id': c.id,
                'code': c.code,
                'discount_type': c.discount_type,
                'discount_value': float(c.discount_value),
                'min_order_amount': float(c.min_order_amount),
                'max_discount_amount': float(c.max_discount_amount) if c.max_discount_amount else None,
                'times_used': c.times_used,
                'is_active': c.is_active,
                'valid_until': c.valid_until
            }
            for c in coupons
        ]
        return Response(data)

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        discount_type = request.data.get('discount_type', Coupon.DiscountType.PERCENTAGE)
        discount_value = Decimal(str(request.data.get('discount_value', 10)))
        min_order_amount = Decimal(str(request.data.get('min_order_amount', 0)))

        coupon = Coupon.objects.create(
            code=code,
            discount_type=discount_type,
            discount_value=discount_value,
            min_order_amount=min_order_amount,
            is_active=True
        )

        return Response({'message': f'Coupon {coupon.code} created.'}, status=status.HTTP_201_CREATED)


class AdminRunMigrationsView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        import io
        from django.core.management import call_command
        out = io.StringIO()
        try:
            call_command('migrate', interactive=False, stdout=out)
            # Seed workshops if none exist
            try:
                from classes.models import Workshop
                if not Workshop.objects.exists():
                    Workshop.objects.create(
                        title="Beginner Crochet: Sunflower Coasters",
                        description="Learn basic crochet stitches, magic ring technique, and petal shaping in this cozy 90-minute live workshop with SiHA artisans.",
                        meet_url="https://meet.google.com/abc-defg-hij",
                        date="2026-11-20",
                        time="16:00:00",
                        registration_url="https://meet.google.com/abc-defg-hij",
                        is_published=True
                    )
                    Workshop.objects.create(
                        title="Amigurumi Plushie Masterclass",
                        description="Step-by-step guidance on creating adorable crochet mini plushies, stuffing, embroidery detailing, and joining limbs.",
                        meet_url="https://meet.google.com/xyz-uvwx-rst",
                        date="2026-11-28",
                        time="17:30:00",
                        registration_url="https://meet.google.com/xyz-uvwx-rst",
                        is_published=True
                    )
            except Exception:
                pass
            # Seed demo order if none exist
            order_seed_msg = "No order seeded"
            try:
                from datetime import timedelta
                from orders.models import Order, OrderItem, OrderStatusHistory
                from catalog.models import Product
                demo_order = Order.objects.filter(order_number="SIHA-20261105-DEMO1").first()
                customer_user = User.objects.filter(email='customer@sihacraftstudio.com').first()
                first_prod = Product.objects.first()
                if not demo_order:
                    demo_order = Order.objects.create(
                        order_number="SIHA-20261105-DEMO1",
                        customer=customer_user,
                        guest_email="customer@sihacraftstudio.com",
                        guest_name="Aaradhya Sharma",
                        guest_phone="+919876543210",
                        shipping_name="Aaradhya Sharma",
                        shipping_phone="+919876543210",
                        shipping_address_line1="42, Lavender Lane, Koramangala",
                        shipping_city="Bengaluru",
                        shipping_state="Karnataka",
                        shipping_postal_code="560034",
                        shipping_country="India",
                        subtotal=Decimal("1299.00"),
                        shipping_fee=Decimal("0.00"),
                        discount_amount=Decimal("0.00"),
                        total_amount=Decimal("1299.00"),
                        payment_status=Order.PaymentStatus.PAID,
                        fulfillment_status=Order.FulfillmentStatus.SHIPPED,
                        courier_name="BlueDart Express",
                        tracking_number="BLUEDART-IND-8849201",
                        tracking_url="https://www.bluedart.com/tracking?track=BLUEDART-IND-8849201",
                        estimated_delivery_date=timezone.now().date() + timedelta(days=3),
                        admin_notes="Handcrafted with organic cotton yarn and gift wrapped."
                    )
                if demo_order and not demo_order.items.exists() and first_prod:
                    prod_price = first_prod.sale_price if first_prod.sale_price else first_prod.price
                    OrderItem.objects.create(
                        order=demo_order,
                        product=first_prod,
                        product_name=first_prod.name,
                        unit_price=prod_price,
                        quantity=1,
                        total_price=prod_price
                    )
                if demo_order and not demo_order.status_history.exists():
                    OrderStatusHistory.objects.create(
                        order=demo_order,
                        status=Order.FulfillmentStatus.CONFIRMED,
                        notes="Order verified and artisan assigned to handcrafting."
                    )
                    OrderStatusHistory.objects.create(
                        order=demo_order,
                        status=Order.FulfillmentStatus.PROCESSING,
                        notes="Item hand-crocheted and inspected by master artisan."
                    )
                    OrderStatusHistory.objects.create(
                        order=demo_order,
                        status=Order.FulfillmentStatus.SHIPPED,
                        notes="Dispatched via BlueDart Express. AWB: BLUEDART-IND-8849201"
                    )
                order_seed_msg = f"Configured order {demo_order.order_number}"
            except Exception as ex:
                order_seed_msg = f"Order seed failed: {str(ex)}"
            return Response({'output': out.getvalue(), 'order_seed': order_seed_msg, 'status': 'success'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

