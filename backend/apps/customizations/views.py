from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from rest_framework import views, status, permissions
from rest_framework.response import Response

from .models import CustomizationRequest, CustomizationQuote
from .serializers import CustomizationRequestSerializer, CustomizationQuoteSerializer
from orders.models import Order, OrderItem, OrderStatusHistory
from catalog.models import Product, Category
from accounts.permissions import IsStaffOrAdmin
from notifications.models import Notification


class CreateCustomizationRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CustomizationRequestSerializer(data=request.data)
        if serializer.is_valid():
            req_data = serializer.validated_data

            # Safe file handling
            image_file = request.FILES.get('reference_image')
            if image_file:
                # Max 5MB limit
                if image_file.size > 5 * 1024 * 1024:
                    return Response({'error': 'Uploaded reference image must not exceed 5MB.'}, status=status.HTTP_400_BAD_REQUEST)
                # MIME type check
                if not image_file.content_type.startswith('image/'):
                    return Response({'error': 'Only image files (JPEG, PNG, WEBP) are supported.'}, status=status.HTTP_400_BAD_REQUEST)

            custom_req = CustomizationRequest.objects.create(
                request_number=CustomizationRequest.generate_request_number(),
                user=request.user if request.user.is_authenticated else None,
                name=req_data['name'],
                email=req_data['email'],
                phone=req_data['phone'],
                category=req_data.get('category', CustomizationRequest.CategoryType.PLUSHIES),
                title=req_data['title'],
                description=req_data['description'],
                color_preferences=req_data.get('color_preferences', 'Boutique standard'),
                size_preferences=req_data.get('size_preferences', 'Standard'),
                quantity=req_data.get('quantity', 1),
                budget_range_inr=req_data.get('budget_range_inr', ''),
                required_by_date=req_data.get('required_by_date'),
                reference_image=image_file,
                reference_image_url=request.data.get('reference_image_url', ''),
                additional_notes=req_data.get('additional_notes', ''),
                contact_consent=req_data.get('contact_consent', True),
                status=CustomizationRequest.Status.NEW
            )

            # Notification
            Notification.objects.create(
                recipient=request.user if request.user.is_authenticated else None,
                recipient_email=custom_req.email,
                notification_type=Notification.NotificationType.CUSTOMIZATION_QUOTE,
                subject=f"Customization Request Received: #{custom_req.request_number}",
                message=f"Hello {custom_req.name}, we have received your request for '{custom_req.title}'. Our crochet artisan will review your design and prepare a detailed quotation."
            )

            return Response({
                'message': 'Your custom crochet request has been received! We will send a quotation shortly.',
                'request': CustomizationRequestSerializer(custom_req).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyCustomizationRequestsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        requests = CustomizationRequest.objects.filter(
            user=request.user
        ).select_related('quote').order_by('-created_at')
        return Response(CustomizationRequestSerializer(requests, many=True).data)


class AcceptQuoteAndCheckoutView(views.APIView):
    """
    Accept an artisan quotation and convert it into a checkout-ready Order.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, request_id):
        try:
            custom_req = CustomizationRequest.objects.get(id=request_id, user=request.user)
        except CustomizationRequest.DoesNotExist:
            return Response({'error': 'Customization request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(custom_req, 'quote') or not custom_req.quote:
            return Response({'error': 'No quotation has been issued for this request yet.'}, status=status.HTTP_400_BAD_REQUEST)

        quote = custom_req.quote
        if quote.is_accepted and quote.order:
            return Response({
                'message': 'Quotation has already been accepted and converted to Order.',
                'order_id': quote.order.id,
                'order_number': quote.order.order_number
            })

        with transaction.atomic():
            quote.is_accepted = True
            quote.accepted_at = timezone.now()

            # Create or get custom product category
            custom_cat, _ = Category.objects.get_or_create(
                slug='custom-creations',
                defaults={'name': 'Custom Creations', 'description': 'Bespoke handmade orders', 'order': 99}
            )

            # Create or get matching product representation
            sku = f"CUST-{custom_req.request_number}"
            prod, _ = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': f"Bespoke: {custom_req.title}",
                    'category': custom_cat,
                    'price': quote.quote_amount,
                    'short_description': f"Custom order for {custom_req.name}",
                    'description': custom_req.description,
                    'is_ready_stock': False,
                    'is_customizable': True,
                    'is_active': True,
                    'estimated_dispatch_days': quote.estimated_production_days
                }
            )

            # Create Order
            order = Order.objects.create(
                order_number=Order.generate_order_number(),
                customer=request.user,
                shipping_name=request.data.get('shipping_name') or custom_req.name,
                shipping_phone=request.data.get('shipping_phone') or custom_req.phone,
                shipping_address_line1=request.data.get('address_line1') or 'Address provided at checkout',
                shipping_address_line2=request.data.get('address_line2', ''),
                shipping_city=request.data.get('city', 'Bengaluru'),
                shipping_state=request.data.get('state', 'Karnataka'),
                shipping_postal_code=request.data.get('postal_code', '560001'),
                shipping_country='India',
                subtotal=quote.quote_amount,
                shipping_fee=Decimal('0.00'),
                discount_amount=Decimal('0.00'),
                total_amount=quote.quote_amount,
                payment_status=Order.PaymentStatus.PENDING,
                fulfillment_status=Order.FulfillmentStatus.PROCESSING,
                customer_notes=f"Custom Crochet Order Ref: {custom_req.request_number}. {custom_req.color_preferences}"
            )

            OrderItem.objects.create(
                order=order,
                product=prod,
                product_name=f"Custom: {custom_req.title}",
                variant_name=f"Qty: {custom_req.quantity} | {custom_req.color_preferences}",
                unit_price=quote.quote_amount / custom_req.quantity,
                quantity=custom_req.quantity,
                total_price=quote.quote_amount
            )

            OrderStatusHistory.objects.create(
                order=order,
                status=Order.FulfillmentStatus.PROCESSING,
                notes=f"Quote accepted for custom request #{custom_req.request_number}."
            )

            quote.order = order
            quote.save()

            custom_req.status = CustomizationRequest.Status.CONVERTED_TO_ORDER
            custom_req.save()

        return Response({
            'message': 'Quotation accepted! You can now proceed to complete payment for your custom piece.',
            'order_id': order.id,
            'order_number': order.order_number,
            'amount': order.total_amount
        })


# STAFF / ADMIN VIEWS
class AdminCustomizationListView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        queryset = CustomizationRequest.objects.all().select_related('quote').order_by('-created_at')
        s = request.query_params.get('status')
        if s:
            queryset = queryset.filter(status=s)
        return Response(CustomizationRequestSerializer(queryset, many=True).data)


class AdminCustomizationStatusView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def put(self, request, request_id):
        try:
            req_obj = CustomizationRequest.objects.get(id=request_id)
        except CustomizationRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'status' in request.data:
            req_obj.status = request.data['status']
        if 'admin_notes' in request.data:
            req_obj.admin_notes = request.data['admin_notes']

        req_obj.save()
        return Response(CustomizationRequestSerializer(req_obj).data)


class AdminCustomizationQuoteView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request, request_id):
        try:
            req_obj = CustomizationRequest.objects.get(id=request_id)
        except CustomizationRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        quote_amount = request.data.get('quote_amount')
        production_days = request.data.get('estimated_production_days', 7)
        details = request.data.get('quote_details', '')

        if not quote_amount:
            return Response({'error': 'quote_amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        quote, created = CustomizationQuote.objects.update_or_create(
            request=req_obj,
            defaults={
                'quote_amount': Decimal(str(quote_amount)),
                'estimated_production_days': int(production_days),
                'quote_details': details,
                'is_accepted': False
            }
        )

        req_obj.status = CustomizationRequest.Status.QUOTATION_SENT
        req_obj.save(update_fields=['status'])

        # Notify customer
        Notification.objects.create(
            recipient=req_obj.user,
            recipient_email=req_obj.email,
            notification_type=Notification.NotificationType.CUSTOMIZATION_QUOTE,
            subject=f"SiHA Craft Studio: Quotation for Custom #{req_obj.request_number}",
            message=f"We have prepared your quotation of ₹{quote.quote_amount} with estimated production of {quote.estimated_production_days} days. Review and accept in your account dashboard."
        )

        return Response({
            'message': 'Quotation issued and sent to customer.',
            'quote': CustomizationQuoteSerializer(quote).data
        })
