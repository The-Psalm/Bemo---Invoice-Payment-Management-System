from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Invoice
from .serializers import InvoiceSerializer, PublicInvoiceSerializer
from .utils import send_invoice_email, send_reminder_email


class InvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_number', 'client__name', 'client__email',
                     'client__company']
    ordering_fields = ['created_at', 'due_date', 'total', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Invoice.objects.select_related('client').prefetch_related('items')
        status_filter = self.request.query_params.get('status')
        client_id = self.request.query_params.get('client')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        if date_from:
            queryset = queryset.filter(issue_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(issue_date__lte=date_to)
        return queryset


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    queryset = Invoice.objects.select_related('client').prefetch_related('items')

    def destroy(self, request, *args, **kwargs):
        invoice = self.get_object()
        if invoice.status != 'draft':
            return Response(
                {'message': 'Only draft invoices can be deleted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class SendInvoiceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        invoice = get_object_or_404(Invoice, pk=pk)
        if invoice.status not in ('draft', 'sent'):
            return Response(
                {'message': f'Cannot send an invoice with status: {invoice.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not invoice.items.exists():
            return Response(
                {'message': 'Cannot send an invoice with no items.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        send_invoice_email(invoice)
        return Response({'message': 'Invoice sent successfully.'})


class SendReminderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        invoice = get_object_or_404(Invoice, pk=pk)
        if invoice.status not in ('sent', 'overdue'):
            return Response(
                {'message': 'Reminders can only be sent for unpaid invoices.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        send_reminder_email(invoice)
        return Response({'message': 'Reminder sent successfully.'})


class MarkPaidView(APIView):
    """Manual payment confirmation — bypasses Paystack."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        invoice = get_object_or_404(Invoice, pk=pk)
        if invoice.status == 'paid':
            return Response(
                {'message': 'Invoice is already marked as paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if invoice.status == 'cancelled':
            return Response(
                {'message': 'Cannot mark a cancelled invoice as paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        invoice.status = 'paid'
        invoice.paid_at = timezone.now()
        invoice.payment_reference = request.data.get('reference', 'MANUAL')
        invoice.save(update_fields=['status', 'paid_at', 'payment_reference'])
        return Response({'message': 'Invoice marked as paid.'})


class PublicInvoiceView(APIView):
    """
    Public endpoint — accessible without authentication.
    Uses UUID token instead of PK to prevent enumeration attacks.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, token):
        invoice = get_object_or_404(
            Invoice.objects.select_related('client').prefetch_related('items'),
            public_token=token
        )
        # Never return cancelled invoices publicly
        if invoice.status == 'cancelled':
            return Response(
                {'message': 'This invoice is no longer available.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PublicInvoiceSerializer(invoice)
        return Response(serializer.data)