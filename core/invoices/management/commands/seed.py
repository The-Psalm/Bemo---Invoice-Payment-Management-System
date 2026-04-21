from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seeds the database with demo data.'

    def handle(self, *args, **kwargs):
        from business_profile.models import BusinessProfile
        from clients.models import Client
        from invoices.models import Invoice, InvoiceItem

        # ── Clear existing seed data ──────────────────────────────────────────
        self.stdout.write('Clearing existing data...')
        InvoiceItem.objects.all().delete()
        Invoice.objects.all().delete()
        Client.objects.all().delete()
        BusinessProfile.objects.all().delete()
        self.stdout.write('Done. Reseeding...')

        # ── Business ──────────────────────────────────────────────────────────
        BusinessProfile.objects.update_or_create(pk=1, defaults={
            'business_name': 'Crestline Digital Agency',
            'email': 'hello@crestline.dev',
            'phone': '+234 801 234 5678',
            'address': 'Victoria Island, Lagos, Nigeria',
            'invoice_prefix': 'CDA',
            'currency': 'NGN',
            'tax_rate': 7.5,
        })

        # ── Clients ───────────────────────────────────────────────────────────
        clients_data = [
            {'name': 'Amaka Obi', 'email': 'amaka@fashionhq.ng',
            'company': 'FashionHQ', 'phone': '+234 802 111 2222'},
            {'name': 'Emeka Nwosu', 'email': 'emeka@nwosuconsult.com',
            'company': 'Nwosu Consulting'},
            {'name': 'Zainab Musa', 'email': 'zainab@zainabstudio.com',
            'company': 'Zainab Studio'},
            {'name': 'Tunde Bakare', 'email': 'tunde@freshfarms.ng',
            'company': 'Fresh Farms Nigeria'},
            {'name': 'Grace Adeyemi', 'email': 'grace@gracebeauty.ng',
            'company': 'Grace Beauty'},
        ]
        clients = [
            Client.objects.create(**c) for c in clients_data
        ]

        # ── Services ──────────────────────────────────────────────────────────
        services = [
            ('Website Design', 250000), ('Web Development', 400000),
            ('SEO Audit', 80000), ('Monthly Retainer', 150000),
            ('Logo Design', 60000), ('Social Media Setup', 50000),
            ('Hosting (Annual)', 35000), ('Maintenance Plan', 45000),
        ]

        statuses = ['draft', 'sent', 'paid', 'paid', 'paid', 'overdue']
        from datetime import timedelta
        import random
        today = timezone.localdate()

        for i in range(25):
            client = random.choice(clients)
            issue = today - timedelta(days=random.randint(5, 90))
            due = issue + timedelta(days=random.choice([7, 14, 30]))
            inv_status = random.choice(statuses)

            invoice = Invoice.objects.create(
                client=client,
                invoice_number=f"CDA-{str(i + 1).zfill(4)}",
                issue_date=issue,
                due_date=due,
                status=inv_status,
                tax_rate=7.5,
                notes='Thank you for your business.',
                paid_at=timezone.now() if inv_status == 'paid' else None,
            )

            num_items = random.randint(1, 3)
            for _ in range(num_items):
                svc_name, svc_price = random.choice(services)
                qty = random.randint(1, 3)
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=svc_name,
                    quantity=qty,
                    unit_price=svc_price,
                )

            invoice.recalculate_totals()
            invoice.save()

        self.stdout.write(self.style.SUCCESS('Seed complete. 25 invoices created.'))