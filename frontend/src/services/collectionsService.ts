import { apiClient } from '@/lib/api'
import { TVCollection } from '@/types'

export const getCollections = () =>
  apiClient.get<TVCollection[]>('/collections').then(r => r.data)

export const getCollection = (id: string) =>
  apiClient.get<TVCollection>(`/collections/${id}`).then(r => r.data)

export const createCollection = (name: string, description?: string) =>
  apiClient.post<TVCollection>('/collections', { name, description }).then(r => r.data)

export const updateCollection = (id: string, updates: { name?: string; description?: string }) =>
  apiClient.put<TVCollection>(`/collections/${id}`, updates).then(r => r.data)

export const deleteCollection = (id: string) =>
  apiClient.delete(`/collections/${id}`).then(r => r.data)

export const addShowToCollection = (collectionId: string, tmdbTvId: number) =>
  apiClient.post(`/collections/${collectionId}/shows`, { tmdbTvId }).then(r => r.data)

export const removeShowFromCollection = (collectionId: string, showId: string) =>
  apiClient.delete(`/collections/${collectionId}/shows/${showId}`).then(r => r.data)
