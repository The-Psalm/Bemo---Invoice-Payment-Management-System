import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Send, Download, CheckCircle,
  Bell, Copy, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getInvoice, sendInvoice, markPaid, sendReminder
} from '../../api/invoices'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../utils/currency'
import { formatDate, formatDateTime } from '../../utils/dates'
import { downloadPDF } from '../../utils/pdf'
import type { InvoiceStatus } from '../../types'

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const printRef = useRef<HTMLDivElement>(null)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(Number(id)).then((r) => r.data),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['invoice', id] })
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
  }

  const sendMutation = useMutation({
    mutationFn: () => sendInvoice(Number(id)),
    onSuccess: () => { toast.success('Invoice sent.'); invalidate() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Send failed.'),
  })

  const paidMutation = useMutation({
    mutationFn: () => markPaid(Number(id)),
    onSuccess: () => { toast.success('Marked as paid.'); invalidate() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed.'),
  })

  const reminderMutation = useMutation({
    mutationFn: () => sendReminder(Number(id)),
    onSuccess: () => toast.success('Reminder sent.'),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed.'),
  })

  const copyLink = () => {
    const url = `${window.location.origin}/invoice/${invoice?.public_token}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard.')
  }

  const handleDownloadPDF = async () => {
    if (!printRef.current) return
    await downloadPDF(printRef.current, `${invoice?.invoice_number}.pdf`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!invoice) return null

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/invoices')}
            className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl text-[var(--text-primary)] font-['DM_Serif_Display']">
                {invoice.invoice_number}
              </h1>
              <Badge status={invoice.status as InvoiceStatus} />
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Created {formatDateTime(invoice.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Copy size={13} />}
            onClick={copyLink}>
            Copy Link
          </Button>
          <Button variant="secondary" size="sm" icon={<Download size={13} />}
            onClick={handleDownloadPDF}>
            PDF
          </Button>
          {['draft', 'sent'].includes(invoice.status) && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Send size={13} />}
              loading={sendMutation.isPending}
              onClick={() => sendMutation.mutate()}
            >
              {invoice.status === 'sent' ? 'Resend' : 'Send'}
            </Button>
          )}
          {['sent', 'overdue'].includes(invoice.status) && (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={<Bell size={13} />}
                loading={reminderMutation.isPending}
                onClick={() => reminderMutation.mutate()}
              >
                Remind
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle size={13} />}
                loading={paidMutation.isPending}
                onClick={() => paidMutation.mutate()}
              >
                Mark Paid
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      <div
        ref={printRef}
        className="bg-white text-slate-800 rounded-2xl p-10 shadow-xl"
      >
        {/* Invoice top */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">INVOICE</h2>
            <p className="text-amber-600 font-semibold text-lg">
              {invoice.invoice_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Issued</p>
            <p className="text-sm font-medium text-slate-700">
              {formatDate(invoice.issue_date)}
            </p>
            <p className="text-xs text-slate-400 mt-2 mb-1">Due</p>
            <p className="text-sm font-medium text-slate-700">
              {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {/* Client */}
        <div className="mb-8 p-4 bg-slate-50 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Bill To
          </p>
          <p className="font-semibold text-slate-900 text-lg">
            {invoice.client.display_name}
          </p>
          <p className="text-slate-600 text-sm">{invoice.client.email}</p>
          {invoice.client.phone && (
            <p className="text-slate-500 text-sm">{invoice.client.phone}</p>
          )}
          {invoice.client.address && (
            <p className="text-slate-500 text-sm">{invoice.client.address}</p>
          )}
        </div>

        {/* Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th className="pb-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-3 text-sm text-slate-800">{item.description}</td>
                <td className="py-3 text-center text-sm text-slate-600">
                  {item.quantity}
                </td>
                <td className="py-3 text-right text-sm text-slate-600">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-3 text-right text-sm font-medium text-slate-800">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-800">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax ({invoice.tax_rate}%)</span>
              <span className="text-slate-800">{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-bold text-lg">
              <span className="text-slate-900">Total</span>
              <span className="text-amber-600">{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.status === 'paid' && invoice.paid_at && (
              <div className="mt-3 p-2 bg-emerald-50 rounded-lg text-center">
                <p className="text-xs text-emerald-700 font-semibold">
                  ✓ PAID — {formatDate(invoice.paid_at)}
                </p>
              </div>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Notes
            </p>
            <p className="text-sm text-slate-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}