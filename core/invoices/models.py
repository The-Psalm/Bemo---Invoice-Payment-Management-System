import uuid
from django.db import models
from clients.models import Client


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('sent',      'Sent'),
        ('paid',      'Paid'),
        ('overdue',   'Overdue'),
        ('cancelled', 'Cancelled'),
    ]

    client            = models.ForeignKey(Client, on_delete=models.PROTECT,
                                          related_name='invoices')
    invoice_number    = models.CharField(max_length=30, unique=True, blank=True)
    issue_date        = models.DateField()
    due_date          = models.DateField()
    status            = models.CharField(max_length=20, choices=STATUS_CHOICES,
                                         default='draft')
    subtotal          = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_rate          = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_amount        = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total             = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes             = models.TextField(blank=True)
    # UUID used as public shareable token — never expose the PK in public URLs
    public_token      = models.UUIDField(default=uuid.uuid4, unique=True,
                                         editable=False, db_index=True)
    payment_reference = models.CharField(max_length=200, blank=True)
    paid_at           = models.DateTimeField(null=True, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.invoice_number

    def recalculate_totals(self):
        from decimal import Decimal
        items = self.items.all()
        self.subtotal = sum(item.amount for item in items) or Decimal('0')
        self.tax_amount = self.subtotal * (Decimal(str(self.tax_rate)) / Decimal('100'))
        self.total = self.subtotal + self.tax_amount

    @classmethod
    def generate_invoice_number(cls):
        from business_profile.models import BusinessProfile
        profile = BusinessProfile.objects.first()
        prefix = profile.invoice_prefix if profile else 'INV'
        last = cls.objects.count()
        return f"{prefix}-{str(last + 1).zfill(4)}"


class InvoiceItem(models.Model):
    invoice     = models.ForeignKey(Invoice, on_delete=models.CASCADE,
                                    related_name='items')
    description = models.CharField(max_length=500)
    quantity    = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price  = models.DecimalField(max_digits=14, decimal_places=2)
    amount      = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} ({self.invoice.invoice_number})"