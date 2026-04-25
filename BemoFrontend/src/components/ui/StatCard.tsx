import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  trend?: { value: string; up: boolean }
  accent?: 'green' | 'amber' | 'red' | 'blue' | 'neutral'
}

const accents = {
  green: { icon: 'text-[var(--green)] bg-[var(--green-subtle)]', border: 'border-t-[var(--green)]' },
  amber: { icon: 'text-[var(--amber)] bg-[var(--amber-subtle)]', border: 'border-t-[var(--amber)]' },
  red: { icon: 'text-[var(--red)] bg-[var(--red-subtle)]', border: 'border-t-[var(--red)]' },
  blue: { icon: 'text-[var(--blue)] bg-[var(--blue-subtle)]', border: 'border-t-[var(--blue)]' },
  neutral: { icon: 'text-[var(--text-secondary)] bg-[var(--bg-subtle)]', border: 'border-t-[var(--border-strong)]' },
}

export const StatCard = ({
  label,
  value,
  sub,
  icon,
  trend,
  accent = 'neutral',
}: StatCardProps) => {
  const { icon: iconClass, border } = accents[accent]

  return (
    <div
      className={clsx(
        'bg-[var(--bg-surface)] rounded-[var(--radius-lg)]',
        'border border-[var(--border-subtle)] border-t-2',
        'p-5 flex items-start gap-4',
        'shadow-[var(--shadow-sm)]',
        'hover:shadow-[var(--shadow-md)] hover:-translate-y-1',
        'transition-all duration-300',
        border
      )}
    >
      {icon && (
        <div className={clsx('p-2 rounded-[var(--radius-sm)] flex-shrink-0', iconClass)}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5">
          {label}
        </p>
        <p className="text-3xl font-['Lora'] font-medium text-[var(--text-primary)] tracking-tight leading-none mt-1">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-[var(--text-tertiary)] mt-1.5">{sub}</p>
        )}
        {trend && (
          <p className={clsx(
            'text-xs font-medium mt-1.5',
            trend.up ? 'text-[var(--green)]' : 'text-[var(--red)]'
          )}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}