import { clsx } from 'clsx'

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={clsx('skeleton-shimmer rounded-[var(--radius-md)]', className)} />
)

export const StatCardSkeleton = () => (
  <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] border-t-2 border-t-[var(--border-base)] p-5 flex items-start gap-4 shadow-[var(--shadow-sm)]">
    <Skeleton className="w-9 h-9 rounded-[var(--radius-sm)] flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-2 w-28" />
    </div>
  </div>
)

export const TableRowSkeleton = ({ cols = 6 }: { cols?: number }) => (
  <tr className="border-b border-[var(--border-subtle)]">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className={clsx('h-3.5', i === 0 ? 'w-24' : i === cols - 1 ? 'w-16' : 'w-full max-w-32')} />
      </td>
    ))}
  </tr>
)

export const TableSkeleton = ({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} cols={cols} />
    ))}
  </>
)

export const CardSkeleton = () => (
  <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-sm)] space-y-4">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-48" />
  </div>
)

export const ChartSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-3 w-28" />
    <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
    <div className="grid grid-cols-3 gap-2">
      <Skeleton className="h-2.5" />
      <Skeleton className="h-2.5" />
      <Skeleton className="h-2.5" />
    </div>
  </div>
)