import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const base = [
    'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-sm)]',
    'transition-all duration-150 cursor-pointer select-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-2 focus-visible:outline-[var(--accent)]',
  ].join(' ')

  const variants = {
    primary: [
      'bg-[var(--accent)] text-white',
      'hover:bg-[var(--accent-hover)]',
      'shadow-[var(--shadow-xs)]',
      'active:scale-[0.98]',
    ].join(' '),
    secondary: [
      'bg-[var(--bg-surface)] text-[var(--text-primary)]',
      'border border-[var(--border-base)]',
      'hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]',
      'shadow-[var(--shadow-xs)]',
      'active:scale-[0.98]',
    ].join(' '),
    outline: [
      'bg-transparent text-[var(--text-secondary)]',
      'border border-[var(--border-subtle)]',
      'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
      'active:scale-[0.98]',
    ].join(' '),
    ghost: [
      'bg-transparent text-[var(--text-secondary)]',
      'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
      'active:scale-[0.98]',
    ].join(' '),
    danger: [
      'bg-[var(--red-subtle)] text-[var(--red)]',
      'border border-[var(--red-border)]',
      'hover:bg-red-100',
      'active:scale-[0.98]',
    ].join(' '),
  }

  const sizes = {
    xs: 'h-7  px-2.5 text-xs  gap-1.5',
    sm: 'h-8  px-3   text-sm  gap-1.5',
    md: 'h-9  px-4   text-sm  gap-2',
    lg: 'h-11 px-5   text-base gap-2',
  }

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !loading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  )
}