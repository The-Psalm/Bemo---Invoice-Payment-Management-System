import api from './axios'
import type { ReportData } from '../types'
export const getReport = (start?: string, end?: string) =>
  api.get<ReportData>('/reports/', { params: { start, end } })

export const exportCSV = (start?: string, end?: string) =>
  api.get('/reports/export/', {
    params: { start, end },
    responseType: 'blob',
  })