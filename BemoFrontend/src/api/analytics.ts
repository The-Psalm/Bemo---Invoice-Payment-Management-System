import api from './axios'
import type { AnalyticsOverview, RevenueChartData, StatusBreakdownData } from '../types'

export const getOverview = () =>
  api.get<AnalyticsOverview>('/analytics/overview/')

export const getRevenueChart = (period?: string) =>
  api.get<RevenueChartData[]>('/analytics/revenue-chart/', { params: { period } })

export const getStatusBreakdown = () =>
  api.get<StatusBreakdownData[]>('/analytics/status-breakdown/')