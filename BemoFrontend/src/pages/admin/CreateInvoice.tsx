import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createInvoice } from '../../api/invoices'
import { getClients } from '../../api/clients'
import { useInvoiceFormStore } from '../../store/invoiceFormStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { formatCurrency } from '../../utils/currency'

export default function CreateInvoice() {
  const navigate = useNavigate()
  const store = useInvoiceFormStore()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getClients().then((r) => r.data),
  })

  const mutation = useMutation({
    mutationFn: (_action: 'draft' | 'send') =>
      createInvoice({
        client_id: store.clientId!,
        issue_date: store.issueDate,
        due_date: store.dueDate,
        tax_rate: store.taxRate,
        notes: store.notes,
        items: store.items.map(({ description, quantity, unit_price }) => ({
          description,
          quantity,
          unit_price,
        })),
      }),
    onSuccess: (res) => {
      store.reset()
      toast.success('Invoice created successfully.')
      navigate(`/admin/invoices/${res.data.id}`)
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'Failed to create invoice.'),
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!store.clientId) e.client = 'Please select a client.'
    if (!store.dueDate) e.dueDate = 'Due date is required.'
    if (store.items.some((i) => !i.description))
      e.items = 'All items need a description.'
    if (store.items.some((i) => i.unit_price <= 0))
      e.items = 'All items need a valid price.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    mutation.mutate('draft')
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/invoices')}
          className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-3xl font-medium text-[var(--text-primary)] font-['Lora'] tracking-tight">
            New Invoice
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Fill in the details below
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client & Dates */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Invoice Details
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Client
              </label>
              <select
                value={store.clientId ?? ''}
                onChange={(e) => store.setClientId(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-base)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)]"
              >
                <option value="">Select a client</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name} — {c.email}
                  </option>
                ))}
              </select>
              {errors.client && (
                <p className="text-xs text-red-400">{errors.client}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Issue Date"
                type="date"
                value={store.issueDate}
                onChange={(e) => store.setField('issueDate', e.target.value)}
              />
              <Input
                label="Due Date"
                type="date"
                value={store.dueDate}
                onChange={(e) => store.setField('dueDate', e.target.value)}
                error={errors.dueDate}
              />
            </div>

            <Input
              label="Tax Rate (%)"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={store.taxRate}
              onChange={(e) => store.setField('taxRate', Number(e.target.value))}
              helper="Set to 0 for tax-exempt invoices"
            />
          </div>

          {/* Line Items */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Line Items
              </h2>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus size={13} />}
                onClick={store.addItem}
              >
                Add Item
              </Button>
            </div>

            {errors.items && (
              <p className="text-xs text-red-400">{errors.items}</p>
            )}

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider px-1">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Unit Price</span>
              <span className="col-span-1 text-right">Amount</span>
              <span className="col-span-1" />
            </div>

            <div className="space-y-2">
              {store.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <input
                    className="col-span-6 h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-base)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)]"
                    placeholder="e.g. Website Design"
                    value={item.description}
                    onChange={(e) =>
                      store.updateItem(index, 'description', e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min={1}
                    className="col-span-2 h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-base)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all text-center shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)]"
                    value={item.quantity}
                    onChange={(e) =>
                      store.updateItem(index, 'quantity', Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    className="col-span-2 h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-base)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all text-right shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)]"
                    value={item.unit_price}
                    onChange={(e) =>
                      store.updateItem(index, 'unit_price', Number(e.target.value))
                    }
                  />
                  <span className="col-span-1 text-sm text-[var(--text-muted)] text-right">
                    {formatCurrency(item.amount)}
                  </span>
                  <button
                    onClick={() => store.removeItem(index)}
                    disabled={store.items.length === 1}
                    className="col-span-1 flex justify-center p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">
              Notes / Payment Terms
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Payment due within 30 days. Thank you for your business."
              value={store.notes}
              onChange={(e) => store.setField('notes', e.target.value)}
              className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-base)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all resize-none placeholder:text-[var(--text-disabled)] shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)]"
            />
          </div>
        </div>

        {/* Right — Summary */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 sticky top-8">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-5">
              Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Subtotal</span>
                <span className="text-[var(--text-primary)]">
                  {formatCurrency(store.subtotal())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">
                  Tax ({store.taxRate}%)
                </span>
                <span className="text-[var(--text-primary)]">
                  {formatCurrency(store.taxAmount())}
                </span>
              </div>
              <div className="border-t border-[var(--border-strong)] pt-3 flex justify-between font-medium items-center">
                <span className="text-[var(--text-primary)] uppercase tracking-widest text-sm">Total</span>
                <span className="text-[var(--text-primary)] text-2xl font-['Lora']">
                  {formatCurrency(store.total())}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Button
                variant="primary"
                size="md"
                loading={mutation.isPending}
                onClick={handleSubmit}
                className="w-full justify-center"
              >
                Save as Draft
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/admin/invoices')}
                className="w-full justify-center"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}