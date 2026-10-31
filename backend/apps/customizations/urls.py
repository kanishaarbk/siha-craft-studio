from django.urls import path
from .views import (
    CreateCustomizationRequestView, MyCustomizationRequestsView,
    AcceptQuoteAndCheckoutView, AdminCustomizationListView,
    AdminCustomizationStatusView, AdminCustomizationQuoteView
)

urlpatterns = [
    path('request/', CreateCustomizationRequestView.as_view(), name='customization-request'),
    path('my-requests/', MyCustomizationRequestsView.as_view(), name='customization-my-requests'),
    path('<int:request_id>/accept-quote/', AcceptQuoteAndCheckoutView.as_view(), name='customization-accept-quote'),
    path('admin/requests/', AdminCustomizationListView.as_view(), name='admin-customization-list'),
    path('admin/requests/<int:request_id>/status/', AdminCustomizationStatusView.as_view(), name='admin-customization-status'),
    path('admin/requests/<int:request_id>/quote/', AdminCustomizationQuoteView.as_view(), name='admin-customization-quote'),
]
