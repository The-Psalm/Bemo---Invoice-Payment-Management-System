import { clsx } from 'clsx'

export const Skeleton = ({
  className,
}: {
  className?: string
}) => (
  <div
    className={clsx(
      'animate-pulse rounded-lg bg-[var(--bg-card-hover)]',
      className
    )}
  />
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 bg-[var(--bg-card)] rounded-xl">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
)