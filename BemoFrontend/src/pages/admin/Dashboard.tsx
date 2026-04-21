import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getOverview, getRevenueChart, getStatusBreakdown } from '../../api/analytics'
import { getInvoices } from '../../api/invoices'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Skeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/dates'
import { useAuthStore } from '../../store/authStore'

const PIE_COLORS = ['#64748b', '#3b82f6', '#10b981', '#ef4444', '#475569']

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => getOverview().then((r) => r.data),
  })

  const { data: revenueChart, isLoading: chartLoading } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => getRevenueChart().then((r) => r.data),
  })

  const { data: statusBreakdown } = useQuery({
    queryKey: ['status-breakdown'],
    queryFn: () => getStatusBreakdown().then((r) => r.data),
  })

  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: () =>
      getInvoices({ ordering: '-created_at' }).then((r) => r.data.slice(0, 6)),
  })

  const stats = [
    {
      label: 'Total Revenue',
      value: overviewLoading ? '—' : formatCurrency(overview?.total_revenue ?? 0),
      sub: 'All time',
      icon: <TrendingUp size={18} />,
      accent: 'green' as const,
    },
    {
      label: 'This Month',
      value: overviewLoading ? '—' : formatCurrency(overview?.revenue_this_month ?? 0),
      sub: 'Revenue collected',
      icon: <FileText size={18} />,
      accent: 'amber' as const,
    },
    {
      label: 'Outstanding',
      value: overviewLoading ? '—' : formatCurrency(overview?.outstanding ?? 0),
      sub: `${overview?.sent_count ?? 0} sent invoices`,
      icon: <Clock size={18} />,
      accent: 'blue' as const,
    },
    {
      label: 'Overdue',
      value: overviewLoading ? '—' : String(overview?.overdue_count ?? 0),
      sub: 'Require attention',
      icon: <AlertTriangle size={18} />,
      accent: 'red' as const,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] font-['DM_Serif_Display']">
          Good morning, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Here's what's happening with your business today.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {overviewLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <StatCard {...stat} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="xl:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
        >
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Revenue — Last 6 Months
          </h2>
          {chartLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChart} barSize={28}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                />
                <Bar
                  dataKey="revenue"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Status Pie Chart */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
        >
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Invoice Status
          </h2>
          {!statusBreakdown ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Recent Invoices */}
      <motion.div
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Recent Invoices
          </h2>
          <Link
            to="/admin/invoices"
            className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {invoicesLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Invoice', 'Client', 'Amount', 'Due', 'Status'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recentInvoices?.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/invoices/${inv.id}`}
                        className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                      {inv.client.display_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}