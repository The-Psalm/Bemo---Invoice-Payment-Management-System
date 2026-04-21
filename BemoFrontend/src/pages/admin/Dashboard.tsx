import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
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

const PIE_COLORS = ['#E3D4B3', '#164E2E', '#9C2B14', '#B47109', '#2B4257']

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] shadow-[var(--shadow-md)] rounded-lg p-3 min-w-[120px]">
        <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-xl font-medium text-[var(--text-primary)] font-['Lora'] tracking-tight leading-none">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [revenuePeriod, setRevenuePeriod] = useState('6M')

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => getOverview().then((r) => r.data),
  })

  const { data: revenueChartData, isLoading: chartLoading } = useQuery({
    queryKey: ['revenue-chart', revenuePeriod],
    queryFn: () => getRevenueChart(revenuePeriod).then((r) => r.data),
  })

  const revenueChart = useMemo(() => {
    if (!revenueChartData) return []
    if (revenuePeriod === '6M') return revenueChartData.slice(-6)
    if (revenuePeriod === '1Y') return revenueChartData.slice(-12)
    return revenueChartData
  }, [revenueChartData, revenuePeriod])

  const { data: statusBreakdown } = useQuery({
    queryKey: ['status-breakdown'],
    queryFn: () => getStatusBreakdown().then((r) => r.data),
  })

  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: () =>
      getInvoices({}).then((r) => r.data.slice(0, 6)),
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
        <h1 className="text-3xl font-medium text-[var(--text-primary)] font-['Lora'] tracking-tight">
          Good morning, {user?.full_name?.split(' ')[0]}.
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
          className="xl:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-base)] shadow-[var(--shadow-sm)] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-[var(--text-primary)] font-['Lora'] tracking-tight">
              Revenue Overview
            </h2>
            <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)]">
              {['6M', '1Y', 'ALL'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRevenuePeriod(tab)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    revenuePeriod === tab 
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          {chartLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'DM Sans', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'DM Sans', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`
                  }
                  dx={-10}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Status Pie Chart */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="bg-[var(--bg-surface)] border border-[var(--border-base)] shadow-[var(--shadow-sm)] rounded-xl p-6"
        >
          <h2 className="text-lg font-medium text-[var(--text-primary)] mb-6 font-['Lora'] tracking-tight">
            Status Breakdown
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
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    color: '#0f172a',
                    fontSize: '13px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
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
        className="bg-[var(--bg-surface)] border border-[var(--border-base)] shadow-[var(--shadow-sm)] rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-base)] bg-[var(--bg-raised)]">
          <h2 className="text-lg font-medium text-[var(--text-primary)] font-['Lora'] tracking-tight">
            Recent Activity
          </h2>
          <Link
            to="/admin/invoices"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            View ledger <ArrowRight size={14} />
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
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-raised)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/invoices/${inv.id}`}
                        className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
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