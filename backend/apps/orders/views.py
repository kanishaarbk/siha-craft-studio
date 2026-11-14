from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import Order, OrderItem, Coupon, OrderStatusHistory
from .serializers import OrderSerializer, CheckoutInputSerializer, CouponSerializer, AdminOrderFulfillmentSerializer
from cart.views import get_cart_for_request
from store_settings.models import StoreSetting, AuditLog
from accounts.permissions import IsStaffOrAdmin


class ValidateCouponView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        amount_raw = request.data.get('amount', 0)

        try:
            amount = Decimal(str(amount_raw))
        except Exception:
            return Response({'error': 'Invalid subtotal amount.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'error': f'Coupon code "{code}" does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        is_valid, msg = coupon.is_valid(amount)
        if not is_valid:
            return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.calculate_discount(amount)
        return Response({
            'valid': True,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': coupon.discount_value,
            'discount_amount': discount,
            'new_total': max(Decimal('0.00'), amount - discount),
            'message': f'Coupon "{coupon.code}" applied! You save ₹{discount}.'
        })


class CheckoutView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CheckoutInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        cart = get_cart_for_request(request)

        if not cart or not cart.items.exists():
            return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Validate stock and calculate authoritative subtotal on backend
            subtotal = Decimal('0.00')
            cart_items = cart.items.select_for_update().select_related('product', 'variant')

            order_items_data = []
            for item in cart_items:
                product = item.product
                variant = item.variant

                if not product.is_active:
                    return Response({'error': f'"{product.name}" is no longer available.'}, status=status.HTTP_400_BAD_REQUEST)

                # Available stock check
                available_stock = variant.stock if variant else product.total_stock
                if item.quantity > available_stock:
                    return Response({
                        'error': f'Insufficient stock for "{product.name}". Only {available_stock} available.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                unit_price = variant.effective_price if variant else product.current_price
                line_total = unit_price * item.quantity
                subtotal += line_total

                order_items_data.append({
                    'product': product,
                    'variant': variant,
                    'product_name': product.name,
                    'variant_name': f"{variant.color} / {variant.size}" if variant else None,
                    'unit_price': unit_price,
                    'quantity': item.quantity,
                    'total_price': line_total
                })

            # Shipping calculation from StoreSettings
            free_shipping_threshold = Decimal(StoreSetting.get_value('free_shipping_threshold', '999'))
            default_shipping_fee = Decimal(StoreSetting.get_value('default_shipping_fee', '79'))

            shipping_fee = Decimal('0.00') if subtotal >= free_shipping_threshold else default_shipping_fee

            # Coupon discount calculation
            discount_amount = Decimal('0.00')
            applied_coupon = None
            coupon_code = data.get('coupon_code', '').strip().upper()
            if coupon_code:
                try:
                    c_obj = Coupon.objects.get(code=coupon_code)
                    c_valid, _ = c_obj.is_valid(subtotal)
                    if c_valid:
                        discount_amount = c_obj.calculate_discount(subtotal)
                        applied_coupon = c_obj
                        c_obj.times_used += 1
                        c_obj.save(update_fields=['times_used'])
                except Coupon.DoesNotExist:
                    pass

            total_amount = max(Decimal('0.00'), subtotal + shipping_fee - discount_amount)

            # Create Order
            order = Order.objects.create(
                order_number=Order.generate_order_number(),
                customer=request.user if request.user.is_authenticated else None,
                guest_email=data.get('email') if not request.user.is_authenticated else None,
                guest_name=data.get('full_name') if not request.user.is_authenticated else None,
                guest_phone=data.get('phone_number') if not request.user.is_authenticated else None,
                shipping_name=data.get('full_name'),
                shipping_phone=data.get('phone_number'),
                shipping_address_line1=data.get('address_line1'),
                shipping_address_line2=data.get('address_line2', ''),
                shipping_city=data.get('city'),
                shipping_state=data.get('state'),
                shipping_postal_code=data.get('postal_code'),
                shipping_country=data.get('country', 'India'),
                subtotal=subtotal,
                shipping_fee=shipping_fee,
                discount_amount=discount_amount,
                total_amount=total_amount,
                coupon=applied_coupon,
                payment_status=Order.PaymentStatus.PENDING,
                fulfillment_status=Order.FulfillmentStatus.PENDING_PAYMENT,
                customer_notes=data.get('customer_notes', '')
            )

            # Create OrderItems
            for odata in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    product=odata['product'],
                    variant=odata['variant'],
                    product_name=odata['product_name'],
                    variant_name=odata['variant_name'],
                    unit_price=odata['unit_price'],
                    quantity=odata['quantity'],
                    total_price=odata['total_price']
                )

            # Create initial status history entry
            OrderStatusHistory.objects.create(
                order=order,
                status=Order.FulfillmentStatus.PENDING_PAYMENT,
                notes='Order created. Awaiting Razorpay payment authorization.'
            )

            # Clear cart
            cart.items.all().delete()

        return Response({
            'message': 'Order created successfully. Ready for payment.',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


class MyOrdersView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(customer=request.user).order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)


class OrderDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_id_or_number):
        try:
            if order_id_or_number.isdigit():
                order = Order.objects.get(id=int(order_id_or_number))
            else:
                order = Order.objects.get(order_number=order_id_or_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Access control
        if order.customer:
            if not request.user.is_authenticated or (request.user != order.customer and not request.user.is_staff):
                return Response({'error': 'You do not have permission to view this order.'}, status=status.HTTP_403_FORBIDDEN)
        else:
            # Guest order lookup requires matching email query param
            guest_email = request.query_params.get('email', '').strip().lower()
            if guest_email and order.guest_email.lower() != guest_email:
                return Response({'error': 'Invalid verification email for guest order.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(OrderSerializer(order).data)


class OrderTrackingView(views.APIView):
    """
    Securely track order shipping status and courier details.
    Allows tracking by Order Number (e.g. SIHA-...), Courier Tracking/AWB Number, or numeric Order ID.
    Requires registered email/phone verification, or authorized customer/staff session.
    """
    permission_classes = [permissions.AllowAny]

    STATUS_LABEL_MAP = {
        'PENDING_PAYMENT': 'Order Placed',
        'CONFIRMED': 'Payment Confirmed',
        'PROCESSING': 'Processing',
        'READY_TO_SHIP': 'Processing',
        'SHIPPED': 'Shipped',
        'OUT_FOR_DELIVERY': 'Out for Delivery',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled',
        'REFUND_PENDING': 'Processing',
        'REFUNDED': 'Cancelled',
    }

    def _verify_and_respond(self, request, order_identifier=None, verification_input=None):
        lookup = (
            order_identifier or 
            request.query_params.get('order') or 
            request.query_params.get('order_number') or 
            request.query_params.get('order_id') or 
            request.data.get('order') or 
            request.data.get('order_number') or 
            request.data.get('order_id') or 
            ''
        ).strip()

        if lookup.startswith('#'):
            lookup = lookup.lstrip('#').strip()

        if not lookup:
            return Response({'error': 'Order ID or tracking reference is required.'}, status=status.HTTP_400_BAD_REQUEST)

        order_q = Q(order_number__iexact=lookup) | Q(tracking_number__iexact=lookup)
        if lookup.isdigit():
            order_q |= Q(id=int(lookup))

        order = Order.objects.prefetch_related('items', 'status_history', 'customer').filter(order_q).first()
        if not order:
            return Response({'error': 'Order not found with provided tracking reference. Please double-check your Order ID or Tracking Number.'}, status=status.HTTP_404_NOT_FOUND)

        # Verification check
        is_authorized = False
        user = request.user if request.user and request.user.is_authenticated else None

        if user and (user.is_staff or getattr(user, 'role', '') in ('ADMIN', 'STAFF')):
            is_authorized = True
        elif user and order.customer_id and order.customer_id == user.id:
            is_authorized = True
        elif user and user.email and (
            (order.customer and order.customer.email.lower() == user.email.lower()) or
            (order.guest_email and order.guest_email.lower() == user.email.lower())
        ):
            is_authorized = True
        else:
            v_input = (
                verification_input or
                request.query_params.get('email') or
                request.query_params.get('verification') or
                request.query_params.get('phone') or
                request.data.get('email') or
                request.data.get('verification') or
                request.data.get('phone') or
                ''
            ).strip().lower()

            if not v_input:
                return Response({
                    'error': 'Please provide the registered email address or phone number associated with this order to securely verify your identity.'
                }, status=status.HTTP_400_BAD_REQUEST)

            customer_email = (order.customer.email.lower() if order.customer else '')
            guest_email = (order.guest_email.lower() if order.guest_email else '')
            shipping_phone = (order.shipping_phone or '').strip().replace(' ', '').replace('-', '')
            guest_phone = (order.guest_phone or '').strip().replace(' ', '').replace('-', '')
            clean_v_input = v_input.replace(' ', '').replace('-', '')

            if v_input in (customer_email, guest_email):
                is_authorized = True
            elif clean_v_input and (
                clean_v_input in shipping_phone or 
                clean_v_input in guest_phone or 
                (len(clean_v_input) >= 4 and (shipping_phone.endswith(clean_v_input) or guest_phone.endswith(clean_v_input)))
            ):
                is_authorized = True

        if not is_authorized:
            return Response({
                'error': 'Security verification failed: The email address or phone number provided does not match the order records.'
            }, status=status.HTTP_403_FORBIDDEN)

        history = [
            {
                'status': self.STATUS_LABEL_MAP.get(h.status, h.status.replace('_', ' ').title()),
                'raw_status': h.status,
                'notes': h.notes,
                'timestamp': h.created_at
            }
            for h in order.status_history.all()
        ]

        items = [
            {
                'product_name': it.product_name,
                'variant_name': it.variant_name,
                'quantity': it.quantity,
                'unit_price': float(it.unit_price),
                'total_price': float(it.total_price),
            }
            for it in order.items.all()
        ]

        order_status_label = self.STATUS_LABEL_MAP.get(order.fulfillment_status, 'Order Placed')
        
        # Shipping status label
        if order.fulfillment_status in ('SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'):
            shipping_status_label = order_status_label
        elif order.fulfillment_status == 'CANCELLED':
            shipping_status_label = 'Cancelled'
        elif order.fulfillment_status in ('CONFIRMED', 'PROCESSING', 'READY_TO_SHIP'):
            shipping_status_label = 'Processing & Handcrafting'
        else:
            shipping_status_label = 'Pending Payment'

        return Response({
            'order_id': order.id,
            'order_number': order.order_number,
            'order_date': order.created_at,
            'order_status': order_status_label,
            'shipping_status': shipping_status_label,
            'payment_status': order.payment_status.replace('_', ' ').title(),
            'fulfillment_status': order.fulfillment_status,
            'courier_name': order.courier_name or 'Pending Assignment',
            'tracking_number': order.tracking_number,
            'tracking_url': order.tracking_url,
            'estimated_delivery_date': order.estimated_delivery_date,
            'items_count': order.items.count(),
            'destination_city': order.shipping_city,
            'destination_state': order.shipping_state,
            'shipping_name': order.shipping_name,
            'total_amount': float(order.total_amount),
            'items': items,
            'status_history': history,
        })

    def get(self, request, order_number=None):
        return self._verify_and_respond(request, order_number)

    def post(self, request, order_number=None):
        ord_num = order_number or request.data.get('order_number') or request.data.get('order_id') or request.data.get('order')
        email = request.data.get('email') or request.data.get('verification') or request.data.get('phone')
        return self._verify_and_respond(request, ord_num, verification_input=email)



# STAFF / ADMIN VIEWS
class AdminOrderListView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        queryset = Order.objects.all().order_by('-created_at')

        # Status filter
        f_status = request.query_params.get('fulfillment_status')
        if f_status:
            queryset = queryset.filter(fulfillment_status=f_status)

        p_status = request.query_params.get('payment_status')
        if p_status:
            queryset = queryset.filter(payment_status=p_status)

        # Search
        q = request.query_params.get('search')
        if q:
            queryset = queryset.filter(
                Q(order_number__icontains=q) |
                Q(shipping_name__icontains=q) |
                Q(customer__email__icontains=q) |
                Q(guest_email__icontains=q) |
                Q(tracking_number__icontains=q)
            )

        return Response(OrderSerializer(queryset[:50], many=True).data)


class AdminOrderFulfillmentView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def put(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if data.get('estimated_delivery_date') == '':
            data['estimated_delivery_date'] = None

        serializer = AdminOrderFulfillmentSerializer(order, data=data, partial=True)
        if serializer.is_valid():
            status_notes = request.data.get('status_notes', '')
            new_status = request.data.get('fulfillment_status', order.fulfillment_status)
            old_status = order.fulfillment_status

            updated_order = serializer.save()

            if new_status != old_status or status_notes:
                OrderStatusHistory.objects.create(
                    order=updated_order,
                    status=new_status,
                    notes=status_notes or f"Fulfillment updated to {new_status} by staff.",
                    updated_by=request.user
                )

            # Record in AuditLog
            AuditLog.objects.create(
                user=request.user,
                action='UPDATE_ORDER_FULFILLMENT',
                resource='Order',
                resource_id=str(updated_order.id),
                details=f"Status: {new_status}, Courier: {updated_order.courier_name}, Tracking: {updated_order.tracking_number}"
            )

            return Response({
                'message': 'Order shipment details updated successfully.',
                'order': OrderSerializer(updated_order).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
