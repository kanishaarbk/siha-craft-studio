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
    Publicly or authenticatedly track order shipping status and courier details.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found with provided tracking reference.'}, status=status.HTTP_404_NOT_FOUND)

        history = [
            {
                'status': h.status,
                'notes': h.notes,
                'timestamp': h.created_at
            }
            for h in order.status_history.all()
        ]

        return Response({
            'order_number': order.order_number,
            'fulfillment_status': order.fulfillment_status,
            'payment_status': order.payment_status,
            'courier_name': order.courier_name or 'Pending Dispatch',
            'tracking_number': order.tracking_number,
            'tracking_url': order.tracking_url,
            'estimated_delivery_date': order.estimated_delivery_date,
            'items_count': order.items.count(),
            'destination_city': order.shipping_city,
            'order_date': order.created_at,
            'status_history': history,
        })


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

        serializer = AdminOrderFulfillmentSerializer(order, data=request.data, partial=True)
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
