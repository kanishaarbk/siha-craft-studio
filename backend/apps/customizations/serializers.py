from rest_framework import serializers
from .models import CustomizationRequest, CustomizationQuote


class CustomizationQuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomizationQuote
        fields = [
            'id', 'quote_amount', 'estimated_production_days', 'quote_details',
            'valid_until', 'is_accepted', 'accepted_at', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'is_accepted', 'accepted_at', 'order', 'created_at']


class CustomizationRequestSerializer(serializers.ModelSerializer):
    quote = CustomizationQuoteSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = CustomizationRequest
        fields = [
            'id', 'request_number', 'name', 'email', 'phone', 'category', 'category_display',
            'title', 'description', 'color_preferences', 'size_preferences', 'quantity',
            'budget_range_inr', 'required_by_date', 'reference_image', 'reference_image_url',
            'additional_notes', 'contact_consent', 'status', 'status_display', 'admin_notes',
            'quote', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'request_number', 'status', 'admin_notes', 'created_at', 'updated_at']
