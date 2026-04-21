import api from './axios'
import type { Invoice, InvoiceItem } from '../types'

export interface InvoiceFilters {
  status?: string
  client?: number
  date_from?: string
  date_to?: string
  search?: string
}

export interface CreateInvoicePayload {
  client_id: number
  issue_date: string
  due_date: string
  tax_rate: number
  notes: string
  items: Omit<InvoiceItem, 'id' | 'amount'>[]
}

export const getInvoices = (filters?: InvoiceFilters) =>
  api.get<Invoice[]>('/invoices/', { params: filters })

export const getInvoice = (id: number) =>
  api.get<Invoice>(`/invoices/${id}/`)

export const getPublicInvoice = (token: string) =>
  api.get<Invoice>(`/invoices/public/${token}/`)

export const createInvoice = (data: CreateInvoicePayload) =>
  api.post<Invoice>('/invoices/', data)

export const updateInvoice = (id: number, data: Partial<CreateInvoicePayload>) =>
  api.patch<Invoice>(`/invoices/${id}/`, data)

export const deleteInvoice = (id: number) =>
  api.delete(`/invoices/${id}/`)

export const sendInvoice = (id: number) =>
  api.post(`/invoices/${id}/send/`)

export const sendReminder = (id: number) =>
  api.post(`/invoices/${id}/remind/`)

export const markPaid = (id: number, reference?: string) =>
  api.post(`/invoices/${id}/mark-paid/`, { reference })

export const initializePayment = (token: string) =>
  api.post('/payments/initialize/', { token })