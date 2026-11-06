import axios from 'axios'
import { supabase } from './supabase'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Only user-owned endpoints need a Supabase token. Keeping public catalog
// requests anonymous avoids an unnecessary session lookup and allows the
// backend/CDN to cache them effectively.
const protectedApiPrefixes = ['/profile', '/history', '/watchlist', '/collections']

apiClient.interceptors.request.use(async (config) => {
  const requestUrl = config.url ?? ''
  const needsAuth = protectedApiPrefixes.some(prefix => requestUrl.startsWith(prefix))
  if (!needsAuth) return config

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Global error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — trigger re-auth
      supabase.auth.signOut()
    }
    return Promise.reject(error)
  }
)
