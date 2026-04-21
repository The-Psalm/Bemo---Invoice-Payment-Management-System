import { clsx } from 'clsx'
import type { InvoiceStatus } from '../../types'

const config: Record<InvoiceStatus, { label: string; className: string; dot: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-base)]',
    dot: 'bg-[var(--text-tertiary)]',
  },
  sent: {
    label: 'Sent',
    className: 'bg-[var(--blue-subtle)] text-[var(--blue)] border-[var(--blue-border)]',
    dot: 'bg-[var(--blue)]',
  },
  paid: {
    label: 'Paid',
    className: 'bg-[var(--green-subtle)] text-[var(--green)] border-[var(--green-border)]',
    dot: 'bg-[var(--green)]',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-[var(--red-subtle)] text-[var(--red)] border-[var(--red-border)]',
    dot: 'bg-[var(--red)]',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border-[var(--border-subtle)]',
    dot: 'bg-[var(--text-disabled)]',
  },
}

interface BadgeProps {
  status: InvoiceStatus
  className?: string
}

export const Badge = ({ status, className }: BadgeProps) => {
  const { label, className: sc, dot } = config[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5',
        'rounded-full text-xs font-medium border',
        'whitespace-nowrap',
        sc,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
      {label}
    </span>
  )
}