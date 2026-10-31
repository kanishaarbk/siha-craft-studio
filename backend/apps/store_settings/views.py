from decimal import Decimal
from django.db.models import Sum, F, Count
from django.utils import timezone
from rest_framework import views, status, permissions
from rest_framework.response import Response

from .models import StoreSetting, AuditLog
from notifications.models import NewsletterSubscriber, Notification
from orders.models import Order, Coupon
from catalog.models import Product, Category, ProductVariant, Review
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

        pending_customizations = CustomizationRequest.objects.filter(
            status__in=['NEW', 'UNDER_REVIEW']
        ).count()

        upcoming_classes = ClassSession.objects.filter(start_time__gte=now).count()
        total_enrollments = ClassBooking.objects.filter(booking_status='CONFIRMED').count()

        # Recent 5 orders
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
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'verified_revenue': verified_revenue,
            'pending_payments': pending_payments,
            'products_in_stock': in_stock_count,
            'low_stock_products': low_stock_count,
            'out_of_stock_products': out_of_stock_count,
            'pending_customizations': pending_customizations,
            'upcoming_classes': upcoming_classes,
            'class_enrollments': total_enrollments,
            'recent_orders': recent_orders,
            'recent_logs': recent_logs
        })


class AdminInventoryListView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        inventory_items = InventoryRecord.objects.select_related('product__category').all().order_by('quantity')
        data = [
            {
                'id': inv.id,
                'product_id': inv.product.id,
                'product_name': inv.product.name,
                'sku': inv.product.sku,
                'category': inv.product.category.name,
                'quantity': inv.quantity,
                'low_stock_threshold': inv.low_stock_threshold,
                'available_quantity': inv.available_quantity,
                'is_low_stock': inv.is_low_stock,
                'is_out_of_stock': inv.is_out_of_stock,
                'updated_at': inv.updated_at
            }
            for inv in inventory_items
        ]
        return Response(data)


class AdminInventoryAdjustView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity_delta = int(request.data.get('quantity_delta', 0))
        reason = request.data.get('reason', 'Manual administrative stock adjustment')

        if not product_id or quantity_delta == 0:
            return Response({'error': 'product_id and non-zero quantity_delta are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prod = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        inv, _ = InventoryRecord.objects.get_or_create(product=prod)
        before = inv.quantity
        after = max(0, before + quantity_delta)
        inv.quantity = after
        inv.save()

        # Update first variant if exists
        variant = prod.variants.first()
        if variant:
            variant.stock = max(0, variant.stock + quantity_delta)
            variant.save(update_fields=['stock'])

        # Movement record
        movement_type = InventoryMovement.MovementType.STOCK_IN if quantity_delta > 0 else InventoryMovement.MovementType.STOCK_OUT
        InventoryMovement.objects.create(
            product=prod,
            variant=variant,
            movement_type=movement_type,
            quantity_delta=quantity_delta,
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
            details=f"Stock adjusted by {quantity_delta:+d} ({before} -> {after}). Reason: {reason}"
        )

        return Response({
            'message': f'Inventory for "{prod.name}" adjusted successfully.',
            'new_quantity': after
        })


class AdminProductManageView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        name = request.data.get('name')
        category_id = request.data.get('category_id')
        price = request.data.get('price')
        sku = request.data.get('sku')
        description = request.data.get('description', '')
        short_description = request.data.get('short_description', '')
        stock = int(request.data.get('stock', 10))
        image_url = request.data.get('primary_image_url', '')

        if not name or not category_id or not price or not sku:
            return Response({'error': 'Name, category_id, price, and SKU are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cat = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)

        prod = Product.objects.create(
            name=name,
            sku=sku,
            category=cat,
            price=Decimal(str(price)),
            description=description,
            short_description=short_description,
            primary_image_url=image_url or 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
            is_active=True
        )

        # Default variant
        ProductVariant.objects.create(
            product=prod,
            color='Standard',
            size='Standard',
            stock=stock,
            is_active=True
        )

        # Inventory record
        InventoryRecord.objects.create(
            product=prod,
            quantity=stock,
            low_stock_threshold=5
        )

        AuditLog.objects.create(
            user=request.user,
            action='CREATE_PRODUCT',
            resource='Product',
            resource_id=str(prod.id),
            details=f"Product '{prod.name}' created with SKU {prod.sku} and initial stock {stock}"
        )

        return Response({
            'message': 'Product created successfully.',
            'product_id': prod.id,
            'name': prod.name
        }, status=status.HTTP_201_CREATED)

    def put(self, request, product_id):
        try:
            prod = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'name' in request.data:
            prod.name = request.data['name']
        if 'price' in request.data:
            prod.price = Decimal(str(request.data['price']))
        if 'sale_price' in request.data:
            sp = request.data['sale_price']
            prod.sale_price = Decimal(str(sp)) if sp else None
        if 'description' in request.data:
            prod.description = request.data['description']
        if 'short_description' in request.data:
            prod.short_description = request.data['short_description']
        if 'is_featured' in request.data:
            prod.is_featured = bool(request.data['is_featured'])
        if 'is_active' in request.data:
            prod.is_active = bool(request.data['is_active'])
        if 'primary_image_url' in request.data:
            prod.primary_image_url = request.data['primary_image_url']

        prod.save()

        # Update stock if provided
        if 'stock' in request.data:
            new_stock = int(request.data['stock'])
            inv, _ = InventoryRecord.objects.get_or_create(product=prod)
            inv.quantity = new_stock
            inv.save()
            variant = prod.variants.first()
            if variant:
                variant.stock = new_stock
                variant.save(update_fields=['stock'])

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
            prod.is_active = False
            prod.save(update_fields=['is_active'])
            AuditLog.objects.create(
                user=request.user,
                action='ARCHIVE_PRODUCT',
                resource='Product',
                resource_id=str(prod.id),
                details=f"Product '{prod.name}' marked inactive."
            )
            return Response({'message': 'Product archived.'})
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)


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
