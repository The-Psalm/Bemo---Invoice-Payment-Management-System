import hmac
import hashlib
import requests
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from invoices.models import Invoice
from invoices.utils import send_payment_receipt, send_payment_notification_owner


class PaystackWebhookView(APIView):
    """
    Receives and processes Paystack webhook events.
    No authentication — verified via HMAC SHA512 signature.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        # ── 1. Verify signature ────────────────────────────────────────────
        paystack_signature = request.headers.get('X-Paystack-Signature', '')
        computed_signature = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
            request.body,
            hashlib.sha512
        ).hexdigest()

        if not hmac.compare_digest(paystack_signature, computed_signature):
            # Silently reject — do not reveal why
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # ── 2. Parse event ─────────────────────────────────────────────────
        event = request.data
        event_type = event.get('event')

        if event_type != 'charge.success':
            # Acknowledge non-payment events without processing
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)

        # ── 3. Verify payment with Paystack API (double-check) ─────────────
        reference = event.get('data', {}).get('reference')
        if not reference:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        verified = self._verify_payment(reference)
        if not verified:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # ── 4. Find invoice and mark paid ──────────────────────────────────
        try:
            invoice = Invoice.objects.select_related('client').get(
                payment_reference=reference
            )
        except Invoice.DoesNotExist:
            # Could be a reference from another system — acknowledge and move on
            return Response({'status': 'ok'})

        if invoice.status == 'paid':
            # Already processed — idempotent response
            return Response({'status': 'ok'})

        invoice.status = 'paid'
        invoice.paid_at = timezone.now()
        invoice.save(update_fields=['status', 'paid_at'])

        # ── 5. Send emails ─────────────────────────────────────────────────
        try:
            send_payment_receipt(invoice)
            send_payment_notification_owner(invoice)
        except Exception:
            # Email failure must not affect payment confirmation
            pass

        return Response({'status': 'ok'})

    def _verify_payment(self, reference: str) -> bool:
        """Verify the payment directly with Paystack API."""
        try:
            response = requests.get(
                f"https://api.paystack.co/transaction/verify/{reference}",
                headers={
                    'Authorization': f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                },
                timeout=10,
            )
            data = response.json()
            return (
                data.get('status') is True and
                data.get('data', {}).get('status') == 'success'
            )
        except Exception:
            return False


class InitializePaymentView(APIView):
    """
    Called by the frontend before opening Paystack popup.
    Stores the reference against the invoice for webhook lookup.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        from invoices.models import Invoice
        import uuid

        token = request.data.get('token')
        if not token:
            return Response(
                {'message': 'Invoice token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            invoice = Invoice.objects.get(public_token=token)
        except Invoice.DoesNotExist:
            return Response(
                {'message': 'Invoice not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if invoice.status == 'paid':
            return Response(
                {'message': 'This invoice has already been paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invoice.status == 'cancelled':
            return Response(
                {'message': 'This invoice has been cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate a unique reference and store it
        reference = f"BEMO-{uuid.uuid4().hex[:12].upper()}"
        invoice.payment_reference = reference
        invoice.save(update_fields=['payment_reference'])

        return Response({
            'reference': reference,
            'amount': int(invoice.total * 100),  # Paystack uses kobo
            'email': invoice.client.email,
            'public_key': settings.PAYSTACK_PUBLIC_KEY,
        })