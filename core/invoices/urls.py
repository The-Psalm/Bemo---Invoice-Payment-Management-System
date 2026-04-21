from django.urls import path
from .views import (
    InvoiceListCreateView, InvoiceDetailView,
    SendInvoiceView, SendReminderView,
    MarkPaidView, PublicInvoiceView,
)

urlpatterns = [
    path('',                         InvoiceListCreateView.as_view(), name='invoice-list'),
    path('<int:pk>/',                 InvoiceDetailView.as_view(),     name='invoice-detail'),
    path('<int:pk>/send/',            SendInvoiceView.as_view(),       name='invoice-send'),
    path('<int:pk>/remind/',          SendReminderView.as_view(),      name='invoice-remind'),
    path('<int:pk>/mark-paid/',       MarkPaidView.as_view(),          name='invoice-mark-paid'),
    path('public/<uuid:token>/',      PublicInvoiceView.as_view(),     name='invoice-public'),
]