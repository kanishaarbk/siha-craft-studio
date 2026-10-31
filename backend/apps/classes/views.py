from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import views, status, permissions
from rest_framework.response import Response

from .models import CrochetClass, ClassSession, ClassBooking, ClassResource
from .serializers import (
    CrochetClassListSerializer, CrochetClassDetailSerializer,
    ClassBookingSerializer, ClassSessionSerializer, ClassResourceSerializer
)
from accounts.permissions import IsStaffOrAdmin
from notifications.models import Notification


class CrochetClassListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = CrochetClass.objects.filter(is_active=True).prefetch_related('sessions')

        # Filter by skill level
        level = request.query_params.get('skill_level')
        if level:
            queryset = queryset.filter(skill_level__iexact=level)

        serializer = CrochetClassListSerializer(queryset, many=True)
        return Response(serializer.data)


class CrochetClassDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            crochet_class = CrochetClass.objects.prefetch_related('sessions', 'resources').get(slug=slug, is_active=True)
        except CrochetClass.DoesNotExist:
            return Response({'error': 'Class not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CrochetClassDetailSerializer(crochet_class, context={'request': request})
        return Response(serializer.data)


class BookClassSessionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id')
        student_name = request.data.get('name') or request.user.get_full_name() or request.user.username
        student_email = request.data.get('email') or request.user.email
        student_phone = request.data.get('phone', '')

        if not session_id:
            return Response({'error': 'session_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            try:
                session = ClassSession.objects.select_for_update().get(id=session_id, is_cancelled=False)
            except ClassSession.DoesNotExist:
                return Response({'error': 'Class session not found or has been cancelled.'}, status=status.HTTP_404_NOT_FOUND)

            if session.is_past:
                return Response({'error': 'This class session has already taken place.'}, status=status.HTTP_400_BAD_REQUEST)

            # Prevent double booking
            if ClassBooking.objects.filter(session=session, student=request.user, booking_status=ClassBooking.BookingStatus.CONFIRMED).exists():
                return Response({'error': 'You are already enrolled in this class session!'}, status=status.HTTP_400_BAD_REQUEST)

            if session.available_seats <= 0:
                return Response({'error': 'Sorry, this session is fully booked. Please select another time slot.'}, status=status.HTTP_400_BAD_REQUEST)

            crochet_class = session.crochet_class
            is_free = crochet_class.price <= Decimal('0.00')

            booking = ClassBooking.objects.create(
                booking_reference=ClassBooking.generate_booking_reference(),
                session=session,
                student=request.user,
                student_name=student_name,
                student_email=student_email,
                student_phone=student_phone,
                booking_status=ClassBooking.BookingStatus.CONFIRMED,
                payment_status=ClassBooking.PaymentStatus.FREE if is_free else ClassBooking.PaymentStatus.PAID,
                amount_paid=crochet_class.price
            )

            # Send Notification
            Notification.objects.create(
                recipient=request.user,
                recipient_email=student_email,
                notification_type=Notification.NotificationType.CLASS_BOOKING,
                subject=f"Confirmed: {crochet_class.title} on {session.start_time.strftime('%b %d, %Y')}",
                message=f"You are successfully enrolled! Your session will be held on Google Meet. Access your meeting link from your My Classes dashboard."
            )

        return Response({
            'message': 'Successfully enrolled in class session!',
            'booking': ClassBookingSerializer(booking).data
        }, status=status.HTTP_201_CREATED)


class MyClassBookingsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookings = ClassBooking.objects.filter(student=request.user).select_related('session__crochet_class').order_by('-session__start_time')
        return Response(ClassBookingSerializer(bookings, many=True).data)


class ClassResourcesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        try:
            crochet_class = CrochetClass.objects.get(slug=slug, is_active=True)
        except CrochetClass.DoesNotExist:
            return Response({'error': 'Class not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_enrolled = ClassBooking.objects.filter(
            session__crochet_class=crochet_class,
            student=request.user,
            booking_status=ClassBooking.BookingStatus.CONFIRMED
        ).exists()

        if not is_enrolled and not request.user.is_staff:
            return Response({'error': 'You must be enrolled in this class to access downloadable learning resources.'}, status=status.HTTP_403_FORBIDDEN)

        resources = crochet_class.resources.all()
        return Response(ClassResourceSerializer(resources, many=True).data)


# ADMIN / STAFF VIEWS
class AdminClassListView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        classes = CrochetClass.objects.all().prefetch_related('sessions__bookings')
        return Response(CrochetClassListSerializer(classes, many=True).data)

    def post(self, request):
        serializer = CrochetClassDetailSerializer(data=request.data)
        if serializer.is_valid():
            c = serializer.save()
            return Response(CrochetClassDetailSerializer(c).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminClassSessionManageView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request, class_id):
        try:
            crochet_class = CrochetClass.objects.get(id=class_id)
        except CrochetClass.DoesNotExist:
            return Response({'error': 'Class not found.'}, status=status.HTTP_404_NOT_FOUND)

        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        max_participants = int(request.data.get('max_participants', 15))
        google_meet_link = request.data.get('google_meet_link', '')

        if not start_time or not end_time:
            return Response({'error': 'start_time and end_time are required.'}, status=status.HTTP_400_BAD_REQUEST)

        session = ClassSession.objects.create(
            crochet_class=crochet_class,
            start_time=start_time,
            end_time=end_time,
            max_participants=max_participants,
            google_meet_link=google_meet_link
        )

        return Response(ClassSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    def put(self, request, class_id, session_id):
        try:
            session = ClassSession.objects.get(id=session_id, crochet_class_id=class_id)
        except ClassSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'google_meet_link' in request.data:
            session.google_meet_link = request.data['google_meet_link']
        if 'max_participants' in request.data:
            session.max_participants = int(request.data['max_participants'])
        if 'is_cancelled' in request.data:
            session.is_cancelled = bool(request.data['is_cancelled'])
        if 'cancellation_reason' in request.data:
            session.cancellation_reason = request.data['cancellation_reason']

        session.save()
        return Response(ClassSessionSerializer(session).data)
