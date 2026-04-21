import api from './axios'
import type { BusinessProfile } from '../types'
export const getProfile = () =>
  api.get<BusinessProfile>('/profile/')

export const updateProfile = (data: FormData) =>
  api.patch<BusinessProfile>('/profile/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })