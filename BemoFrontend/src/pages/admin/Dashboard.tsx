import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { DollarSign, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { getOverview, getRevenueChart, getStatusBreakdown } from '../../api/analytics'
import { getInvoices } from '../../api/invoices'
import { StatCard } from '../../components/ui/StatCard'
import { StatCardSkeleton, TableSkeleton, Skeleton, ChartSkeleton } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/dates'
import { useAuthStore } from '../../store/authStore'

const PIE_COLORS = ['#546B41', '#99AD7A', '#DCCCAC', '#2A2723', '#F0E6D2']

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: overview, isLoading: lo } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => getOverview().then((r) => r.data),
  })
  const { data: revenueChart, isLoading: lc } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => getRevenueChart().then((r) => r.data),
  })
  const { data: statusBreakdown } = useQuery({
    queryKey: ['status-breakdown'],
    queryFn: () => getStatusBreakdown().then((r) => r.data),
  })
  const { data: recent, isLoading: lr } = useQuery({
    queryKey: ['invoices', 'recent'],
    queryFn: () => getInvoices().then((r) => r.data.slice(0, 6)),
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = overview ? [
    { label: 'Total Revenue', value: formatCurrency(overview.total_revenue), icon: <DollarSign size={15} />, accent: 'green' as const, sub: `${formatCurrency(overview.revenue_this_month)} this month` },
    { label: 'Outstanding', value: formatCurrency(overview.outstanding), icon: <Clock size={15} />, accent: 'amber' as const, sub: `${overview.sent_count} awaiting payment` },
    { label: 'Overdue', value: String(overview.overdue_count), icon: <AlertTriangle size={15} />, accent: 'red' as const, sub: 'Require attention' },
    { label: 'Paid Invoices', value: String(overview.paid_count), icon: <CheckCircle size={15} />, accent: 'green' as const, sub: `of ${overview.total_invoices} total` },
  ] : []

  return (
    <div>
      <PageHeader
        title={`${greeting}${user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.`}
        description="Here's what's happening with your business today."
      />

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
        variants={stagger} initial="hidden" animate="show"
      >
        {lo
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s) => (
            <motion.div key={s.label} variants={item}>
              <StatCard {...s} />
            </motion.div>
          ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.12em] mb-1">
            Revenue
          </p>
          <p className="text-2xl font-['Lora'] font-medium text-[var(--text-primary)] mb-6 tracking-tight">
            Last 6 months
          </p>
          {lc ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#546B41" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#99AD7A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} tickFormatter={(v) => formatCurrency(Number(v)).replace(/\.00$/, '')} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-base)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#546B41" strokeWidth={2.5} fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: '#546B41', stroke: '#FFF8EC', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie */}
        <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.12em] mb-1">
            Breakdown
          </p>
          <p className="text-2xl font-['Lora'] font-medium text-[var(--text-primary)] mb-4 tracking-tight">
            By status
          </p>
          {statusBreakdown ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} strokeWidth={0}>
                    {statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-base)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12,
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {statusBreakdown.map((s, i) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-[var(--text-secondary)] capitalize">{s.status}</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Skeleton className="h-44" />
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Recent Invoices</p>
          <a href="/admin/invoices" className="text-xs text-[var(--accent-text)] hover:text-[var(--accent)] transition-colors font-medium">
            View all →
          </a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              {['Invoice', 'Client', 'Amount', 'Due', 'Status'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lr
              ? <TableSkeleton rows={6} cols={5} />
              : recent?.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-raised)] transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/admin/invoices/${inv.id}`}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)]">
                        <FileText size={13} />
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {inv.invoice_number}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-sm text-[var(--text-primary)]">{inv.client.display_name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{inv.client.email}</p>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-medium text-[var(--text-primary)]">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-[var(--text-tertiary)]">
                    {formatDate(inv.due_date)}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge status={inv.status} />
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}