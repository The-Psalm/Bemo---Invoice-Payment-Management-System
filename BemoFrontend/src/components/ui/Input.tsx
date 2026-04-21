import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border text-[var(--text-primary)]',
          'placeholder:text-[var(--text-muted)] text-sm outline-none transition-all duration-200',
          'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
          error ? 'border-red-500/50' : 'border-[var(--border)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helper && !error && (
        <p className="text-xs text-[var(--text-muted)]">{helper}</p>
      )}
    </div>
  )
)
Input.displayName = 'Input'