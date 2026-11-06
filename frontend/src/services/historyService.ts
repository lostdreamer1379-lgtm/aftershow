import { apiClient } from '@/lib/api'
import { WatchHistoryEntry } from '@/types'

export const getHistory = () =>
  apiClient.get<WatchHistoryEntry[]>('/history').then(r => r.data)

export const getContinueWatching = () =>
  apiClient.get<WatchHistoryEntry[]>('/history', { params: { unfinished: true } }).then(r => r.data)

export interface UpsertProgressPayload {
  tmdbTvId: number
  seasonNumber: number
  episodeNumber: number
  currentPosition: number
  duration?: number | null
  completed?: boolean
}

export const upsertProgress = (payload: UpsertProgressPayload) =>
  apiClient.post<WatchHistoryEntry>('/history', payload).then(r => r.data)

export const updateHistoryEntry = (id: string, updates: Partial<UpsertProgressPayload>) =>
  apiClient.put<WatchHistoryEntry>(`/history/${id}`, updates).then(r => r.data)

export const removeHistoryEntry = (id: string) =>
  apiClient.delete(`/history/${id}`).then(r => r.data)
