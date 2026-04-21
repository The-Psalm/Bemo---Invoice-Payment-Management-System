import csv
from django.http import HttpResponse
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from invoices.models import Invoice


class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        queryset = Invoice.objects.filter(status='paid').select_related('client')
        if start:
            queryset = queryset.filter(paid_at__date__gte=start)
        if end:
            queryset = queryset.filter(paid_at__date__lte=end)

        totals = queryset.aggregate(
            gross=Sum('total'),
            tax=Sum('tax_amount'),
        )
        gross = totals['gross'] or 0
        tax = totals['tax'] or 0
        net = gross - tax

        # Top 5 clients by revenue
        top_clients = (
            queryset
            .values('client__name', 'client__company')
            .annotate(revenue=Sum('total'))
            .order_by('-revenue')[:5]
        )

        return Response({
            'gross_revenue': gross,
            'tax_collected': tax,
            'net_revenue': net,
            'invoice_count': queryset.count(),
            'top_clients': list(top_clients),
        })


class ExportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        queryset = Invoice.objects.select_related('client').all()
        if start:
            queryset = queryset.filter(issue_date__gte=start)
        if end:
            queryset = queryset.filter(issue_date__lte=end)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="bemo-invoices.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Invoice Number', 'Client', 'Issue Date', 'Due Date',
            'Status', 'Subtotal', 'Tax', 'Total', 'Paid At'
        ])

        for inv in queryset:
            writer.writerow([
                inv.invoice_number,
                inv.client.display_name,
                inv.issue_date,
                inv.due_date,
                inv.status,
                inv.subtotal,
                inv.tax_amount,
                inv.total,
                inv.paid_at or '',
            ])

        return response