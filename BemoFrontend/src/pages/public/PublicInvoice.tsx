import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, Zap } from 'lucide-react'
import { useRef } from 'react'
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-16 bg-slate-200" />
          <Skeleton className="h-96 bg-slate-200" />
        </div>
      </div>
    )

  if (isError || !invoice)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center">
        <div>
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Invoice not found</h1>
          <p className="text-slate-500">This invoice may have been cancelled or the link is invalid.</p>
        </div>
      </div>
    )

  const canPay = ['sent', 'overdue'].includes(invoice.status)

  return (
    <>
      {/* Load Paystack script */}
      <script src="https://js.paystack.co/v1/inline.js" async />

      <div className="min-h-screen bg-slate-100 py-10 px-4">
        {/* Actions bar */}
        <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Bemo</span>
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
        <div
          ref={printRef}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-10"
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
              <p className="text-amber-600 font-semibold text-lg mt-1">
                {invoice.invoice_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Issued</p>
              <p className="text-sm font-medium text-slate-700 mb-2">
                {formatDate(invoice.issue_date)}
              </p>
              <p className="text-xs text-slate-400">Due</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl mb-8">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Bill To
            </p>
            <p className="font-bold text-slate-900 text-lg">
              {invoice.client.display_name}
            </p>
            <p className="text-slate-500 text-sm">{invoice.client.email}</p>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="pb-2 text-left text-xs text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="pb-2 text-center text-xs text-slate-400 uppercase tracking-wider">
                  Qty
                </th>
                <th className="pb-2 text-right text-xs text-slate-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="pb-2 text-right text-xs text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 text-sm text-slate-800">{item.description}</td>
                  <td className="py-3 text-center text-sm text-slate-500">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-sm text-slate-500">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-3 text-right text-sm font-semibold text-slate-800">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-56 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax ({invoice.tax_rate}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-amber-600">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.status === 'paid' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center mb-6">
              <p className="text-emerald-700 font-semibold text-sm">
                ✓ This invoice has been paid — {formatDate(invoice.paid_at)}
              </p>
            </div>
          )}

          {invoice.notes && (
            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}