from django.core.management.base import BaseCommand
from django.utils import timezone
from invoices.models import Invoice


class Command(BaseCommand):
    help = 'Marks sent invoices past their due date as overdue.'

    def handle(self, *args, **kwargs):
        today = timezone.localdate()
        updated = Invoice.objects.filter(
            status='sent',
            due_date__lt=today,
        ).update(status='overdue')
        self.stdout.write(
            self.style.SUCCESS(f'{updated} invoice(s) marked as overdue.')
        )