import { type InputHTMLAttributes, type TextareaHTMLAttributes,  forwardRef, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { Calendar } from 'lucide-react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  helper?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, prefix, suffix, className, type, ...props }, ref) => {
    const isDate = type === 'date'
    const activeSuffix = isDate ? <Calendar size={14} className="pointer-events-none" /> : suffix

    return (
      <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold text-[var(--text-secondary)] tracking-[0.08em] uppercase">
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
            type={type}
            className={clsx(
              'w-full h-10 rounded-[var(--radius-md)] bg-[var(--bg-surface)]',
              'border text-[var(--text-primary)] text-sm',
              'placeholder:text-[var(--text-disabled)]',
              'transition-all duration-200 outline-none',
              'hover:border-[var(--border-strong)] hover:bg-[var(--bg-raised)]',
              'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10',
              'shadow-[var(--shadow-xs)]',
              error
                ? 'border-[var(--red)] focus:ring-red-100'
                : 'border-[var(--border-base)]',
              prefix ? 'pl-9' : 'px-3',
              activeSuffix ? 'pr-9' : 'px-3',
              isDate && '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-datetime-edit]:text-[var(--text-primary)]',
              className
            )}
            onClick={(e) => {
              if (isDate) {
                try {
                  // @ts-ignore
                  e.target.showPicker()
                } catch (err) {}
              }
            }}
            {...props}
          />
          {activeSuffix && (
            <span className="absolute right-3 text-[var(--text-tertiary)] flex items-center pointer-events-none">
              {activeSuffix}
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
  }
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold text-[var(--text-secondary)] tracking-[0.08em] uppercase">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          'w-full rounded-[var(--radius-md)] bg-[var(--bg-surface)] px-3 py-2.5',
          'border text-[var(--text-primary)] text-sm',
          'placeholder:text-[var(--text-disabled)]',
          'transition-all duration-200 outline-none resize-none',
          'hover:border-[var(--border-strong)] hover:bg-[var(--bg-raised)]',
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