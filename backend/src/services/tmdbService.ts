import axios, { AxiosError } from 'axios'
import { env } from '@/config/env.js'
import { ApiError } from '@/middleware/errorHandler.js'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${env.tmdbReadAccessToken || ''}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// ── Simple in-memory TTL cache ─────────────────
// TMDB discovery/detail data changes infrequently enough that a short-lived
// in-process cache meaningfully cuts redundant upstream calls and smooths
// over brief TMDB rate-limit pressure. This is intentionally simple —
// swap for Redis if the backend scales to multiple instances.
interface CacheEntry {
  data: unknown
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

function cacheKey(path: string, params?: Record<string, unknown>): string {
  return `${path}?${JSON.stringify(params ?? {})}`
}

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.data as T
}

function setCached(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
  // Opportunistic cleanup so the map doesn't grow unbounded in a long-lived process.
  if (cache.size > 500) {
    const now = Date.now()
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k)
    }
  }
}

/**
 * Centralized TMDB service layer. All TMDB calls for TV discovery, details,
 * seasons, episodes and people route through here rather than being
 * scattered across controllers.
 */
export const tmdbService = {
  isConfigured(): boolean {
    return Boolean(env.tmdbReadAccessToken)
  },

  async get<T>(path: string, params?: Record<string, unknown>, ttlMs: number = DEFAULT_TTL_MS): Promise<T> {
    const key = cacheKey(path, params)
    const cached = getCached<T>(key)
    if (cached !== undefined) return cached

    try {
      const response = await tmdbClient.get<T>(path, { params })
      setCached(key, response.data, ttlMs)
      return response.data
    } catch (err) {
      throw translateTmdbError(err)
    }
  },
}

function translateTmdbError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    const status = err.response?.status
    const tmdbMessage = (err.response?.data as { status_message?: string } | undefined)?.status_message

    if (status === 404) {
      return new ApiError(404, tmdbMessage || 'The requested TV resource could not be found.')
    }
    if (status === 401) {
      return new ApiError(502, 'TMDB rejected the configured API credentials.')
    }
    if (status === 429) {
      return new ApiError(429, 'TMDB rate limit reached. Please try again shortly.')
    }
    if (status && status >= 500) {
      return new ApiError(502, 'TMDB is currently unavailable. Please try again shortly.')
    }
    return new ApiError(status || 502, tmdbMessage || 'Failed to reach TMDB.')
  }
  return new ApiError(502, 'Failed to reach TMDB.')
}
