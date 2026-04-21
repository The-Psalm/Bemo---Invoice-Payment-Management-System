import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, TrendingUp, Receipt, Landmark } from 'lucide-react'
import toast from 'react-hot-toast'
import { getReport, exportCSV } from '../../api/reports'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../utils/currency'

export default function Reports() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', start, end],
    queryFn: () =>
      getReport(start || undefined, end || undefined).then((r) => r.data),
  })

  const handleExport = async () => {
    try {
      const res = await exportCSV(start, end)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'bemo-report.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-[var(--text-primary)] font-['Lora'] tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Revenue and financial summary
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={<Download size={14} />}
          onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] shadow-[var(--shadow-sm)] rounded-xl p-4 flex gap-4 items-end">
        <Input
          label="From"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-44"
        />
        <Input
          label="To"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-44"
        />
        {(start || end) && (
          <Button variant="ghost" size="md"
            onClick={() => { setStart(''); setEnd('') }}>
            Clear
          </Button>
        )}
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Gross Revenue"
            value={formatCurrency(report?.gross_revenue ?? 0)}
            icon={<TrendingUp size={18} />}
            accent="amber"
            sub={`${report?.invoice_count ?? 0} paid invoice(s)`}
          />
          <StatCard
            label="Tax Collected"
            value={formatCurrency(report?.tax_collected ?? 0)}
            icon={<Receipt size={18} />}
            accent="blue"
          />
          <StatCard
            label="Net Revenue"
            value={formatCurrency(report?.net_revenue ?? 0)}
            icon={<Landmark size={18} />}
            accent="green"
            sub="After tax deductions"
          />
        </div>
      )}

      {/* Top Clients */}
      {report?.top_clients && report.top_clients.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] shadow-[var(--shadow-sm)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-base)] bg-[var(--bg-raised)]">
            <h2 className="text-lg font-medium text-[var(--text-primary)] font-['Lora'] tracking-tight">
              Top Clients by Revenue
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['#', 'Client', 'Revenue'].map((h) => (
                  <th key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {report.top_clients.map((c, i) => (
                <tr key={i}
                  className="hover:bg-[var(--bg-raised)] transition-colors">
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    #{i + 1}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {c.client__company || c.client__name}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[var(--accent)]">
                    {formatCurrency(c.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}