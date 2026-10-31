from django.urls import path
from .views import CreateRazorpayOrderView, VerifyRazorpayPaymentView, RazorpayWebhookView

urlpatterns = [
    path('razorpay/create-order/', CreateRazorpayOrderView.as_view(), name='razorpay-create-order'),
    path('razorpay/verify/', VerifyRazorpayPaymentView.as_view(), name='razorpay-verify'),
    path('razorpay/webhook/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),
]
