import { format, parseISO, isValid } from 'date-fns'

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '—'
  const parsed = parseISO(date)
  return isValid(parsed) ? format(parsed, 'dd MMM yyyy') : '—'
}

export const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return '—'
  const parsed = parseISO(date)
  return isValid(parsed) ? format(parsed, 'dd MMM yyyy, h:mm a') : '—'
}

export const today = (): string => format(new Date(), 'yyyy-MM-dd')