import { apiClient } from '@/lib/api'
import { WatchlistEntry, WatchStatus } from '@/types'

export const getWatchlist = (status?: WatchStatus) =>
  apiClient
    .get<WatchlistEntry[]>('/watchlist', { params: status ? { status } : undefined })
    .then(r => r.data)

export const addToWatchlist = (tmdbTvId: number, status: WatchStatus = 'plan_to_watch') =>
  apiClient.post<WatchlistEntry>('/watchlist', { tmdbTvId, status }).then(r => r.data)

export const updateWatchlistEntry = (id: string, updates: Partial<Pick<WatchlistEntry, 'status'>>) =>
  apiClient.put<WatchlistEntry>(`/watchlist/${id}`, updates).then(r => r.data)

export const removeFromWatchlist = (id: string) =>
  apiClient.delete(`/watchlist/${id}`).then(r => r.data)
