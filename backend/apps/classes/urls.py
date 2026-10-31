from django.urls import path
from .views import (
    CrochetClassListView, CrochetClassDetailView,
    BookClassSessionView, MyClassBookingsView,
    ClassResourcesView, AdminClassListView, AdminClassSessionManageView
)

urlpatterns = [
    path('classes/', CrochetClassListView.as_view(), name='classes-list'),
    path('classes/<slug:slug>/', CrochetClassDetailView.as_view(), name='classes-detail'),
    path('classes/<slug:slug>/resources/', ClassResourcesView.as_view(), name='classes-resources'),
    path('classes/book/session/', BookClassSessionView.as_view(), name='classes-book-session'),
    path('classes/user/my-bookings/', MyClassBookingsView.as_view(), name='classes-my-bookings'),
    path('admin/classes/', AdminClassListView.as_view(), name='admin-classes-list'),
    path('admin/classes/<int:class_id>/sessions/', AdminClassSessionManageView.as_view(), name='admin-classes-add-session'),
    path('admin/classes/<int:class_id>/sessions/<int:session_id>/', AdminClassSessionManageView.as_view(), name='admin-classes-edit-session'),
]
