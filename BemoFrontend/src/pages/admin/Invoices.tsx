import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, Send, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getInvoices, sendInvoice, deleteInvoice,
  markPaid, sendReminder
} from '../../api/invoices'
import { exportCSV } from '../../api/reports'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/dates'
import type { InvoiceStatus } from '../../types'

const STATUSES: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function Invoices() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', search, status, dateFrom, dateTo],
    queryFn: () =>
      getInvoices({
        search: search || undefined,
        status: status || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }).then((r) => r.data),
  })

  const sendMutation = useMutation({
    mutationFn: (id: number) => sendInvoice(id),
    onSuccess: () => {
      toast.success('Invoice sent successfully.')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'Failed to send invoice.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInvoice(id),
    onSuccess: () => {
      toast.success('Invoice deleted.')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'Failed to delete invoice.'),
  })

  const handleExport = async () => {
    try {
      const res = await exportCSV(dateFrom, dateTo)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'bemo-invoices.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[var(--text-primary)] font-['DM_Serif_Display']">
            Invoices
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {invoices?.length ?? 0} invoice(s) total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={14} />}
            onClick={handleExport}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />}
            onClick={() => navigate('/admin/invoices/new')}>
            New Invoice
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-52">
            <Input
              placeholder="Search invoices, clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                status === s.value
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : invoices?.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="Create your first invoice to get started."
            action={
              <Button variant="primary" size="sm" icon={<Plus size={14} />}
                onClick={() => navigate('/admin/invoices/new')}>
                New Invoice
              </Button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Invoice', 'Client', 'Amount', 'Issue Date', 'Due Date', 'Status', 'Actions'].map(
                  (h) => (
                    <th key={h}
                      className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {invoices?.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-amber-400">
                      {inv.invoice_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[var(--text-primary)]">
                      {inv.client.display_name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {inv.client.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {formatCurrency(inv.total)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {formatDate(inv.issue_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {formatDate(inv.due_date)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={inv.status as InvoiceStatus} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                        className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      {['draft', 'sent'].includes(inv.status) && (
                        <button
                          onClick={() => sendMutation.mutate(inv.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[var(--text-muted)] hover:text-blue-400 transition-colors"
                          title="Send"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this invoice?'))
                              deleteMutation.mutate(inv.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}