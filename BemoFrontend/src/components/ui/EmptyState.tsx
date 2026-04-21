import {type ReactNode } from 'react'
import { FileX } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}

export const EmptyState = ({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] mb-4 text-[var(--text-muted)]">
      {icon || <FileX size={28} />}
    </div>
    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
      {title}
    </h3>
    <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
      {description}
    </p>
    {action}
  </div>
)