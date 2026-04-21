import { type InputHTMLAttributes, type TextareaHTMLAttributes,  forwardRef, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, prefix, suffix, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[var(--text-tertiary)] flex items-center">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface)]',
            'border text-[var(--text-primary)] text-sm',
            'placeholder:text-[var(--text-disabled)]',
            'transition-all duration-150 outline-none',
            'hover:border-[var(--border-strong)]',
            'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10',
            'shadow-[var(--shadow-xs)]',
            error
              ? 'border-[var(--red)] focus:ring-red-100'
              : 'border-[var(--border-base)]',
            prefix ? 'pl-9' : 'px-3',
            suffix ? 'pr-9' : 'px-3',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-[var(--text-tertiary)] flex items-center">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-[var(--red)] flex items-center gap-1">
          <span>↑</span>{error}
        </p>
      )}
      {helper && !error && (
        <p className="text-xs text-[var(--text-tertiary)]">{helper}</p>
      )}
    </div>
  )
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          'w-full rounded-[var(--radius-sm)] bg-[var(--bg-surface)] px-3 py-2.5',
          'border text-[var(--text-primary)] text-sm',
          'placeholder:text-[var(--text-disabled)]',
          'transition-all duration-150 outline-none resize-none',
          'hover:border-[var(--border-strong)]',
          'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10',
          'shadow-[var(--shadow-xs)]',
          error ? 'border-[var(--red)]' : 'border-[var(--border-base)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--red)]">{error}</p>}
      {helper && !error && <p className="text-xs text-[var(--text-tertiary)]">{helper}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'