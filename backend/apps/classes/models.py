import secrets
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone


class CrochetClass(models.Model):
    class SkillLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner Friendly'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate Craft'
        ADVANCED = 'ADVANCED', 'Advanced Mastery'
        ALL_LEVELS = 'ALL_LEVELS', 'All Skill Levels'

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    skill_level = models.CharField(max_length=30, choices=SkillLevel.choices, default=SkillLevel.BEGINNER)
    instructor_name = models.CharField(max_length=150, default='SiHA Master Artisan')
    instructor_bio = models.TextField(blank=True, default='Passionate crochet artist dedicated to teaching mindful stitch craft and heirloom techniques.')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), help_text='Set to 0.00 for free workshop')
    duration_minutes = models.PositiveIntegerField(default=90, help_text='Class duration in minutes')
    cover_image = models.ImageField(upload_to='classes/', blank=True, null=True)
    cover_image_url = models.CharField(max_length=500, blank=True, null=True)
    required_materials = models.TextField(default='- 4.0mm Crochet Hook\n- 100g Cotton Yarn (Worsted Weight)\n- Stitch Markers & Tapestry Needle\n- Scissors')
    learning_outcomes = models.TextField(default='- Master foundation chains and single/double crochet\n- Seamless row transitions\n- Reading crochet charts and written patterns\n- Blocking and finishing your piece')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Crochet Classes'
        ordering = ['title']

    def __str__(self):
        return f"{self.title} ({self.get_skill_level_display()})"


class ClassSession(models.Model):
    crochet_class = models.ForeignKey(CrochetClass, on_delete=models.CASCADE, related_name='sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    max_participants = models.PositiveIntegerField(default=12)
    google_meet_link = models.URLField(max_length=500, blank=True, null=True, help_text='Google Meet link for enrolled students')
    is_cancelled = models.BooleanField(default=False)
    cancellation_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_time']

    @property
    def confirmed_bookings_count(self):
        return self.bookings.filter(booking_status='CONFIRMED').count()

    @property
    def available_seats(self):
        return max(0, self.max_participants - self.confirmed_bookings_count)

    @property
    def is_fully_booked(self):
        return self.available_seats <= 0

    @property
    def is_past(self):
        return timezone.now() > self.end_time

    def __str__(self):
        return f"{self.crochet_class.title} on {self.start_time.strftime('%b %d, %Y %I:%M %p')}"


class ClassBooking(models.Model):
    class BookingStatus(models.TextChoices):
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        PENDING_PAYMENT = 'PENDING_PAYMENT', 'Pending Payment'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    class PaymentStatus(models.TextChoices):
        PAID = 'PAID', 'Paid'
        PENDING = 'PENDING', 'Pending'
        FREE = 'FREE', 'Free Class'
        REFUNDED = 'REFUNDED', 'Refunded'

    booking_reference = models.CharField(max_length=40, unique=True, db_index=True)
    session = models.ForeignKey(ClassSession, on_delete=models.PROTECT, related_name='bookings')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='class_bookings')
    student_name = models.CharField(max_length=150)
    student_email = models.EmailField()
    student_phone = models.CharField(max_length=20, blank=True, null=True)
    booking_status = models.CharField(max_length=30, choices=BookingStatus.choices, default=BookingStatus.CONFIRMED)
    payment_status = models.CharField(max_length=30, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def generate_booking_reference(cls):
        date_str = timezone.now().strftime('%Y%m%d')
        suffix = secrets.token_hex(3).upper()
        return f"BOOK-{date_str}-{suffix}"

    def __str__(self):
        return f"{self.booking_reference} - {self.student_name} ({self.session})"


class ClassResource(models.Model):
    crochet_class = models.ForeignKey(CrochetClass, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='class_resources/', blank=True, null=True)
    external_link = models.URLField(max_length=500, blank=True, null=True)
    is_public = models.BooleanField(default=False, help_text='If false, only visible to enrolled students')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.crochet_class.title})"


class Workshop(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    google_meet_url = models.URLField(max_length=500, help_text='Google Meet link for attending the workshop')
    date = models.DateField(help_text='Workshop date')
    time = models.TimeField(help_text='Workshop time')
    registration_link = models.URLField(max_length=500, blank=True, null=True, help_text='Optional registration link')
    is_published = models.BooleanField(default=True, help_text='Only published workshops are visible to visitors')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.title} on {self.date} at {self.time}"

