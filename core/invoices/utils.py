from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string


def send_invoice_email(invoice):
    """Send invoice link to client and notify the owner."""
    public_url = f"{settings.FRONTEND_URL}/invoice/{invoice.public_token}"

    # Email to client
    client_html = render_to_string('emails/invoice_sent.html', {
        'invoice': invoice,
        'public_url': public_url,
    })
    client_email = EmailMultiAlternatives(
        subject=f"Invoice {invoice.invoice_number}",
        body=f"Please view and pay your invoice: {public_url}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[invoice.client.email],
    )
    client_email.attach_alternative(client_html, "text/html")
    client_email.send(fail_silently=False)

    # Notification to owner
    owner_html = render_to_string('emails/invoice_sent_owner.html', {
        'invoice': invoice,
        'public_url': public_url,
    })
    owner_email = EmailMultiAlternatives(
        subject=f"Invoice {invoice.invoice_number} sent to {invoice.client.display_name}",
        body=f"Invoice sent successfully.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.EMAIL_HOST_USER],
    )
    owner_email.attach_alternative(owner_html, "text/html")
    owner_email.send(fail_silently=True)

    invoice.status = 'sent'
    invoice.save(update_fields=['status'])


def send_payment_receipt(invoice):
    """Send receipt to client after successful payment."""
    html = render_to_string('emails/payment_receipt.html', {
        'invoice': invoice,
    })
    email = EmailMultiAlternatives(
        subject=f"Payment Received — {invoice.invoice_number}",
        body=f"Your payment of {invoice.total} has been received.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[invoice.client.email],
    )
    email.attach_alternative(html, "text/html")
    email.send(fail_silently=False)


def send_payment_notification_owner(invoice):
    """Notify owner that a payment was received."""
    html = render_to_string('emails/payment_received_owner.html', {
        'invoice': invoice,
    })
    email = EmailMultiAlternatives(
        subject=f"Payment received for {invoice.invoice_number}",
        body=f"Payment received from {invoice.client.display_name}.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.EMAIL_HOST_USER],
    )
    email.attach_alternative(html, "text/html")
    email.send(fail_silently=True)


def send_reminder_email(invoice):
    """Send payment reminder for overdue invoice."""
    public_url = f"{settings.FRONTEND_URL}/invoice/{invoice.public_token}"
    html = render_to_string('emails/payment_reminder.html', {
        'invoice': invoice,
        'public_url': public_url,
    })
    email = EmailMultiAlternatives(
        subject=f"Payment Reminder — {invoice.invoice_number}",
        body=f"This is a reminder that invoice {invoice.invoice_number} is due.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[invoice.client.email],
    )
    email.attach_alternative(html, "text/html")
    email.send(fail_silently=False)