from django.db import models


class BusinessProfile(models.Model):
    """Singleton model — only one record should ever exist."""
    business_name  = models.CharField(max_length=200)
    logo           = models.ImageField(upload_to='profile/', blank=True)
    email          = models.EmailField(blank=True)
    phone          = models.CharField(max_length=20, blank=True)
    address        = models.TextField(blank=True)
    website        = models.URLField(blank=True)
    instagram      = models.CharField(max_length=100, blank=True)
    currency       = models.CharField(max_length=10, default='NGN')
    invoice_prefix = models.CharField(max_length=10, default='INV')
    tax_rate       = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    invoice_footer = models.TextField(blank=True)
    updated_at     = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.business_name

    def save(self, *args, **kwargs):
        # Enforce singleton
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj