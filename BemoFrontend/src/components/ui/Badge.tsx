import { clsx } from 'clsx'
import type { InvoiceStatus } from '../../types'

const config: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
  sent:      { label: 'Sent',      className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  paid:      { label: 'Paid',      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  overdue:   { label: 'Overdue',   className: 'bg-red-500/15 text-red-400 border-red-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-700/30 text-slate-500 border-slate-700/30' },
}

interface BadgeProps {
  status: InvoiceStatus
  className?: string
}

export const Badge = ({ status, className }: BadgeProps) => {
  const { label, className: statusClass } = config[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusClass,
        className
      )}
    >
      {label}
    </span>
  )
}