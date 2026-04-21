import api from './axios'
import type { Client } from '../types'

export const getClients = (search?: string) =>
  api.get<Client[]>('/clients/', { params: { search } })

export const getClient = (id: number) =>
  api.get<Client>(`/clients/${id}/`)

export const createClient = (data: Partial<Client>) =>
  api.post<Client>('/clients/', data)

export const updateClient = (id: number, data: Partial<Client>) =>
  api.patch<Client>(`/clients/${id}/`, data)

export const deleteClient = (id: number) =>
  api.delete(`/clients/${id}/`)