from rest_framework import serializers
from django.utils import timezone
from .models import Invoice, InvoiceItem
from clients.serializers import ClientSerializer


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'amount']
        read_only_fields = ['id', 'amount']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Quantity must be greater than zero.')
        return value

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Unit price cannot be negative.')
        return value


class InvoiceSerializer(serializers.ModelSerializer):
    items  = InvoiceItemSerializer(many=True)
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('clients.models', fromlist=['Client']).Client.objects.all(),
        write_only=True, source='client'
    )

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'client', 'client_id', 'issue_date',
            'due_date', 'status', 'items', 'subtotal', 'tax_rate',
            'tax_amount', 'total', 'notes', 'public_token',
            'payment_reference', 'paid_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'invoice_number', 'subtotal', 'tax_amount', 'total',
            'public_token', 'payment_reference', 'paid_at',
            'created_at', 'updated_at',
        ]

    def validate(self, data):
        if data.get('due_date') and data.get('issue_date'):
            if data['due_date'] < data['issue_date']:
                raise serializers.ValidationError(
                    {'due_date': 'Due date cannot be before issue date.'}
                )
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(
            invoice_number=Invoice.generate_invoice_number(),
            **validated_data
        )
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        invoice.recalculate_totals()
        invoice.save()
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        # Only allow editing drafts
        if instance.status not in ('draft',):
            raise serializers.ValidationError(
                'Only draft invoices can be edited.'
            )
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)

        instance.recalculate_totals()
        instance.save()
        return instance


class PublicInvoiceSerializer(serializers.ModelSerializer):
    """Safe serializer for public invoice page — no sensitive fields."""
    items  = InvoiceItemSerializer(many=True, read_only=True)
    client = ClientSerializer(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'invoice_number', 'client', 'issue_date', 'due_date',
            'status', 'items', 'subtotal', 'tax_rate', 'tax_amount',
            'total', 'notes', 'paid_at',
        ]