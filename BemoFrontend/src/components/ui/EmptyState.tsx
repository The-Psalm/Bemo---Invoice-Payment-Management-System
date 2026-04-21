import { type ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}

export const EmptyState = ({ title, description, action, icon }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    {icon && (
      <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-base font-['Instrument_Serif'] text-[var(--text-primary)] mb-1">
      {title}
    </h3>
    <p className="text-sm text-[var(--text-tertiary)] max-w-xs leading-relaxed mb-6">
      {description}
    </p>
    {action}
  </div>
)