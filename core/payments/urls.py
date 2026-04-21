from django.urls import path
from .views import PaystackWebhookView, InitializePaymentView

urlpatterns = [
    path('webhook/',    PaystackWebhookView.as_view(),    name='paystack-webhook'),
    path('initialize/', InitializePaymentView.as_view(),  name='payment-initialize'),
]