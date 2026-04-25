import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Send, Download, CheckCircle,
  Bell, Copy
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
import { downloadInvoicePDF } from '../../utils/pdf'
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

const handleDownloadPDF = () => {
  if (!invoice) return
  downloadInvoicePDF(invoice)
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
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] font-['Sora'] tracking-tight">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div
          ref={printRef}
          className="bg-[#FFFFFF] text-[var(--text-primary)] rounded-[var(--radius-lg)] p-8 md:p-12 shadow-[var(--shadow-lg)] border border-[var(--border-subtle)]"
        >
          {/* Invoice top */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-4xl font-semibold text-[var(--text-primary)] mb-2 font-['Sora'] tracking-tight uppercase">
                Invoice
              </h2>
              <p className="text-[var(--text-secondary)] font-medium text-lg">
                {invoice.invoice_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Issued</p>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-4">
                {formatDate(invoice.issue_date)}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Due</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>

          {/* Client */}
          <div className="mb-10 p-5 border border-[var(--border-strong)] bg-transparent">
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
              Bill To
            </p>
            <p className="font-semibold text-[var(--text-primary)] text-lg font-['Sora'] mb-1">
              {invoice.client.display_name}
            </p>
            <p className="text-[var(--text-secondary)] text-sm">{invoice.client.email}</p>
            {invoice.client.phone && (
              <p className="text-[var(--text-secondary)] text-sm mt-0.5">{invoice.client.phone}</p>
            )}
            {invoice.client.address && (
              <p className="text-[var(--text-secondary)] text-sm mt-0.5">{invoice.client.address}</p>
            )}
          </div>

          {/* Items */}
          <table className="w-full mb-10">
            <thead>
              <tr className="border-y-2 border-[var(--text-primary)]">
                <th className="py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                  Description
                </th>
                <th className="py-3 text-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                  Qty
                </th>
                <th className="py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                  Unit Price
                </th>
                <th className="py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--border-base)]">
                  <td className="py-4 text-sm text-[var(--text-primary)] font-medium">{item.description}</td>
                  <td className="py-4 text-center text-sm text-[var(--text-secondary)]">
                    {item.quantity}
                  </td>
                  <td className="py-4 text-right text-sm text-[var(--text-secondary)]">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[var(--text-primary)]">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)] uppercase tracking-wider text-xs">Subtotal</span>
                <span className="text-[var(--text-primary)] font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)] uppercase tracking-wider text-xs">Tax ({invoice.tax_rate}%)</span>
                <span className="text-[var(--text-primary)] font-medium">{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="border-t-2 border-[var(--text-primary)] pt-3 mt-2 flex justify-between items-center">
                <span className="text-[var(--text-primary)] font-semibold uppercase tracking-widest text-sm">Total</span>
                <span className="text-2xl font-['Sora'] font-semibold text-[var(--text-primary)]">{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.status === 'paid' && invoice.paid_at && (
                <div className="mt-6 p-3 border-2 border-[var(--accent)] text-center transform -rotate-2 w-max ml-auto opacity-80">
                  <p className="text-sm text-[var(--accent)] font-bold uppercase tracking-widest font-['Sora']">
                    Paid In Full
                  </p>
                  <p className="text-[10px] text-[var(--accent)] mt-0.5">
                    {formatDate(invoice.paid_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-12 pt-8 border-t border-[var(--border-base)]">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                Notes
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">{invoice.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}