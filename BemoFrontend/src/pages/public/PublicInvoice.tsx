import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, Zap } from 'lucide-react'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { getPublicInvoice, initializePayment } from '../../api/invoices'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/dates'
import { downloadInvoicePDF } from '../../utils/pdf'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function PublicInvoice() {
  const { token } = useParams<{ token: string }>()
  const printRef = useRef<HTMLDivElement>(null)

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['public-invoice', token],
    queryFn: () => getPublicInvoice(token!).then((r) => r.data),
    retry: false,
  })

  const handlePay = async () => {
    try {
      const { data } = await initializePayment(token!)
      const handler = window.PaystackPop.setup({
        key: data.public_key,
        email: data.email,
        amount: data.amount,
        ref: data.reference,
        currency: 'NGN',
        callback: () => {
          window.location.href = '/payment/success'
        },
        onClose: () => toast('Payment cancelled.'),
      })
      handler.openIframe()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Payment initialization failed.')
    }
  }

const handleDownload = () => {
  if (!invoice) return
  downloadInvoicePDF(invoice)
}
  if (isLoading)
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )

  if (isError || !invoice)
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center text-center">
        <div>
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] font-['Sora'] mb-2">Invoice not found</h1>
          <p className="text-[var(--text-secondary)]">This invoice may have been cancelled or the link is invalid.</p>
        </div>
      </div>
    )

  const canPay = ['draft', 'sent', 'overdue'].includes(invoice.status)

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-app)] py-10 px-4">
        {/* Actions bar */}
        <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shadow-sm">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight font-['Sora']">Bemo</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Download size={13} />}
              onClick={handleDownload}>
              Download PDF
            </Button>
            {canPay && (
              <Button variant="primary" size="sm" onClick={handlePay}>
                Pay {formatCurrency(invoice.total)}
              </Button>
            )}
          </div>
        </div>

        {/* Invoice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div
            ref={printRef}
            className="max-w-3xl mx-auto bg-[#FFFFFF] text-[var(--text-primary)] rounded-[var(--radius-lg)] p-8 md:p-12 shadow-[var(--shadow-lg)] border border-[var(--border-subtle)]"
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
    </>
  )
}