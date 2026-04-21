export interface User {
  id: number
  email: string
  full_name: string
}

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  address: string
  display_name: string
  created_at: string
}

export interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: number
  invoice_number: string
  client: Client
  issue_date: string
  due_date: string
  status: InvoiceStatus
  items: InvoiceItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string
  public_token: string
  payment_reference: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface BusinessProfile {
  id: number
  business_name: string
  logo: string
  email: string
  phone: string
  address: string
  website: string
  instagram: string
  currency: string
  invoice_prefix: string
  tax_rate: number
  invoice_footer: string
}

export interface AnalyticsOverview {
  total_revenue: number
  revenue_this_month: number
  outstanding: number
  overdue_count: number
  paid_count: number
  draft_count: number
  sent_count: number
  total_invoices: number
  cancellation_rate: number
}

export interface RevenueChartData {
  month: string
  revenue: number
}

export interface StatusBreakdownData {
  status: string
  count: number
}

export interface ReportData {
  gross_revenue: number
  tax_collected: number
  net_revenue: number
  invoice_count: number
  top_clients: {
    client__name: string
    client__company: string
    revenue: number
  }[]
}