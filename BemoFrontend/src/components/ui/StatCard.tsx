import type { ReactNode } from 'react';
import { clsx } from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  accent?: 'amber' | 'green' | 'red' | 'blue'
}

const accents = {
  amber: 'text-amber-400 bg-amber-500/10',
  green: 'text-emerald-400 bg-emerald-500/10',
  red:   'text-red-400 bg-red-500/10',
  blue:  'text-blue-400 bg-blue-500/10',
}

export const StatCard = ({
  label,
  value,
  sub,
  icon,
  accent = 'amber',
}: StatCardProps) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 flex items-start gap-4">
    {icon && (
      <div className={clsx('p-2.5 rounded-lg flex-shrink-0', accents[accent])}>
        {icon}
      </div>
    )}
    <div>
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[var(--text-primary)] font-['DM_Serif_Display']">
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  </div>
)