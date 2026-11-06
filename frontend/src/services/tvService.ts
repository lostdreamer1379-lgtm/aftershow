import { apiClient } from '@/lib/api'
import {
  TVShow,
  TVShowListItem,
  Season,
  Episode,
  PaginatedResponse,
  PersonDetails,
  GenreListResponse,
} from '@/types'

// ── Discovery ─────────────────────────────────

export const getTrending = (page = 1) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>('/tv/trending', { params: { page } }).then(r => r.data)

export const getPopular = (page = 1) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>('/tv/popular', { params: { page } }).then(r => r.data)

export const getTopRated = (page = 1) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>('/tv/top-rated', { params: { page } }).then(r => r.data)

export const getAiringToday = (page = 1) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>('/tv/airing-today', { params: { page } }).then(r => r.data)

export const getOnTheAir = (page = 1) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>('/tv/on-the-air', { params: { page } }).then(r => r.data)

export const searchShows = (query: string, page = 1) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>('/tv/search', { params: { query, page } }).then(r => r.data)

export const discoverShows = (params: Record<string, string | number>) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>('/tv/discover', { params }).then(r => r.data)

export const getGenres = () =>
  apiClient.get<GenreListResponse>('/tv/genres').then(r => r.data.genres)

// ── Show Details ──────────────────────────────

export const getShowDetails = (id: number) =>
  apiClient.get<TVShow>(`/tv/${id}`).then(r => r.data)

export const getShowRecommendations = (id: number, page = 1) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>(`/tv/${id}/recommendations`, { params: { page } }).then(r => r.data)

export const getShowSimilar = (id: number, page = 1) =>
  apiClient.get<PaginatedResponse<TVShowListItem>>(`/tv/${id}/similar`, { params: { page } }).then(r => r.data)

// ── Seasons & Episodes ────────────────────────

export const getSeasonDetails = (showId: number, seasonNumber: number) =>
  apiClient.get<Season>(`/tv/${showId}/seasons/${seasonNumber}`).then(r => r.data)

export const getEpisodeDetails = (showId: number, seasonNumber: number, episodeNumber: number) =>
  apiClient.get<Episode>(`/tv/${showId}/seasons/${seasonNumber}/episodes/${episodeNumber}`).then(r => r.data)

// ── People ────────────────────────────────────

export const getPersonDetails = (id: number) =>
  apiClient.get<PersonDetails>(`/people/${id}`).then(r => r.data)
