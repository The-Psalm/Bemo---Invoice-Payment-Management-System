import api from './axios'
import type { User } from '../types'

export const login = (email: string, password: string) =>
  api.post<{ access: string; refresh: string; user: User }>('/auth/login/', {
    email,
    password,
  })

export const refreshToken = (refresh: string) =>
  api.post<{ access: string }>('/auth/refresh/', { refresh })

export const getMe = () => api.get<User>('/auth/me/')