from rest_framework import serializers
from .models import CrochetClass, ClassSession, ClassBooking, ClassResource, Workshop


class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = [
            'id', 'title', 'description', 'google_meet_url',
            'date', 'time', 'registration_link', 'is_published',
            'created_at', 'updated_at'
        ]


class ClassResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassResource
        fields = ['id', 'title', 'description', 'file', 'external_link', 'is_public', 'created_at']


class ClassSessionSerializer(serializers.ModelSerializer):
    available_seats = serializers.IntegerField(read_only=True)
    is_fully_booked = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    confirmed_bookings_count = serializers.IntegerField(read_only=True)
    # google_meet_link is hidden in public session listings for privacy/security!

    class Meta:
        model = ClassSession
        fields = [
            'id', 'start_time', 'end_time', 'max_participants',
            'available_seats', 'is_fully_booked', 'is_past', 'is_cancelled',
            'confirmed_bookings_count'
        ]


class CrochetClassListSerializer(serializers.ModelSerializer):
    sessions = ClassSessionSerializer(many=True, read_only=True)
    skill_level_display = serializers.CharField(source='get_skill_level_display', read_only=True)

    class Meta:
        model = CrochetClass
        fields = [
            'id', 'title', 'slug', 'description', 'skill_level', 'skill_level_display',
            'instructor_name', 'price', 'duration_minutes', 'cover_image',
            'cover_image_url', 'sessions', 'created_at'
        ]


class CrochetClassDetailSerializer(serializers.ModelSerializer):
    sessions = ClassSessionSerializer(many=True, read_only=True)
    skill_level_display = serializers.CharField(source='get_skill_level_display', read_only=True)
    resources = serializers.SerializerMethodField()

    class Meta:
        model = CrochetClass
        fields = [
            'id', 'title', 'slug', 'description', 'skill_level', 'skill_level_display',
            'instructor_name', 'instructor_bio', 'price', 'duration_minutes',
            'cover_image', 'cover_image_url', 'required_materials', 'learning_outcomes',
            'sessions', 'resources', 'created_at'
        ]

    def get_resources(self, obj):
        # Public resources or all resources if requesting user is enrolled/staff
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            is_enrolled = ClassBooking.objects.filter(
                session__crochet_class=obj,
                student=request.user,
                booking_status=ClassBooking.BookingStatus.CONFIRMED
            ).exists()
            if is_enrolled or request.user.is_staff:
                return ClassResourceSerializer(obj.resources.all(), many=True).data
        return ClassResourceSerializer(obj.resources.filter(is_public=True), many=True).data


class ClassBookingSerializer(serializers.ModelSerializer):
    class_title = serializers.CharField(source='session.crochet_class.title', read_only=True)
    class_slug = serializers.CharField(source='session.crochet_class.slug', read_only=True)
    instructor_name = serializers.CharField(source='session.crochet_class.instructor_name', read_only=True)
    start_time = serializers.DateTimeField(source='session.start_time', read_only=True)
    end_time = serializers.DateTimeField(source='session.end_time', read_only=True)
    google_meet_link = serializers.SerializerMethodField()

    class Meta:
        model = ClassBooking
        fields = [
            'id', 'booking_reference', 'session', 'class_title', 'class_slug',
            'instructor_name', 'start_time', 'end_time', 'google_meet_link',
            'student_name', 'student_email', 'student_phone', 'booking_status',
            'payment_status', 'amount_paid', 'created_at'
        ]

    def get_google_meet_link(self, obj):
        # Reveal Google Meet link ONLY for confirmed bookings!
        if obj.booking_status == ClassBooking.BookingStatus.CONFIRMED:
            return obj.session.google_meet_link
        return None
