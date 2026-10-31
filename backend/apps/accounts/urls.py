from django.urls import path
from .views import (
    RegisterView, LoginView, GoogleAuthView, LogoutView, ProfileView,
    PasswordResetRequestView, PasswordResetConfirmView,
    AddressListCreateView, AddressDetailView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('google/', GoogleAuthView.as_view(), name='auth-google'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='auth-password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('addresses/', AddressListCreateView.as_view(), name='auth-addresses'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='auth-address-detail'),
]
