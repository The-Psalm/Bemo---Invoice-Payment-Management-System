from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, date
from invoices.models import Invoice


class OverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        month_start = today.replace(day=1)

        invoices = Invoice.objects.all()
        paid = invoices.filter(status='paid')
        unpaid = invoices.filter(status__in=['sent', 'overdue'])

        total_revenue = paid.aggregate(t=Sum('total'))['t'] or 0
        revenue_this_month = paid.filter(
            paid_at__date__gte=month_start
        ).aggregate(t=Sum('total'))['t'] or 0

        outstanding = unpaid.aggregate(t=Sum('total'))['t'] or 0
        overdue_count = invoices.filter(status='overdue').count()

        total = invoices.count()
        cancelled_count = invoices.filter(status='cancelled').count()

        return Response({
            'total_revenue': total_revenue,
            'revenue_this_month': revenue_this_month,
            'outstanding': outstanding,
            'overdue_count': overdue_count,
            'paid_count': paid.count(),
            'draft_count': invoices.filter(status='draft').count(),
            'sent_count': invoices.filter(status='sent').count(),
            'total_invoices': total,
            'cancellation_rate': round(
                (cancelled_count / total * 100) if total > 0 else 0, 1
            ),
        })


class RevenueChartView(APIView):
    """Monthly revenue for the last 6 months."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        data = []

        for i in range(5, -1, -1):
            # Go back i months from today
            month_date = (today.replace(day=1) - timedelta(days=1)) if i == 0 else \
                         today.replace(day=1)
            target = date(today.year, today.month, 1)
            # Subtract i months properly
            month = today.month - i
            year = today.year
            while month <= 0:
                month += 12
                year -= 1
            target = date(year, month, 1)

            revenue = Invoice.objects.filter(
                status='paid',
                paid_at__year=target.year,
                paid_at__month=target.month,
            ).aggregate(t=Sum('total'))['t'] or 0

            data.append({
                'month': target.strftime('%b %Y'),
                'revenue': float(revenue),
            })

        return Response(data)


class StatusBreakdownView(APIView):
    """Invoice count per status for chart."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled']
        data = []
        for s in statuses:
            count = Invoice.objects.filter(status=s).count()
            data.append({'status': s.capitalize(), 'count': count})
        return Response(data)