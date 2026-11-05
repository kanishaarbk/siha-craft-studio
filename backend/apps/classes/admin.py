from django.contrib import admin
from .models import CrochetClass, ClassSession, ClassBooking, ClassResource, Workshop


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'time', 'is_published', 'google_meet_url', 'created_at')
    list_filter = ('is_published', 'date')
    search_fields = ('title', 'description')
    ordering = ('-date', '-time')


@admin.register(CrochetClass)
class CrochetClassAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill_level', 'price', 'duration_minutes', 'is_active')
    list_filter = ('skill_level', 'is_active')
    search_fields = ('title', 'description')


@admin.register(ClassSession)
class ClassSessionAdmin(admin.ModelAdmin):
    list_display = ('crochet_class', 'start_time', 'end_time', 'max_participants', 'is_cancelled')
    list_filter = ('is_cancelled', 'start_time')


@admin.register(ClassBooking)
class ClassBookingAdmin(admin.ModelAdmin):
    list_display = ('booking_reference', 'session', 'student_name', 'student_email', 'booking_status', 'payment_status')
    list_filter = ('booking_status', 'payment_status')
    search_fields = ('booking_reference', 'student_name', 'student_email')


@admin.register(ClassResource)
class ClassResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'crochet_class', 'is_public', 'created_at')
    list_filter = ('is_public', 'crochet_class')

