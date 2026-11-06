// ═══════════════════════════════════════════════
// AFTERSHOW — Core Type Definitions
// ═══════════════════════════════════════════════

// ── TMDB ──────────────────────────────────────

export interface Genre {
  id: number
  name: string
}

export interface Network {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface Creator {
  id: number
  name: string
  profile_path: string | null
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
}

export interface TVShow {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  last_air_date: string | null
  genres: Genre[]
  status: string
  tagline: string | null
  vote_average: number
  vote_count: number
  popularity: number
  number_of_seasons: number
  number_of_episodes: number
  episode_run_time: number[]
  original_language: string
  origin_country: string[]
  networks: Network[]
  created_by: Creator[]
  in_production: boolean
  languages: string[]
  type: string
  seasons?: Season[]
  // Appended via append_to_response on the backend
  videos?: { results: Video[] }
  credits?: { cast: CastMember[]; crew: CrewMember[] }
  'watch/providers'?: { results: Record<string, WatchProviderRegion> }
}

export interface WatchProvider {
  provider_id: number
  provider_name: string
  logo_path: string | null
}

export interface WatchProviderRegion {
  link: string
  flatrate?: WatchProvider[]
  rent?: WatchProvider[]
  buy?: WatchProvider[]
}

export interface TVShowListItem {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  genre_ids: number[]
  vote_average: number
  vote_count: number
  popularity: number
  original_language: string
  origin_country: string[]
}

export interface Season {
  id: number
  season_number: number
  name: string
  overview: string
  poster_path: string | null
  air_date: string | null
  episode_count: number
  episodes?: Episode[]
}

export interface Episode {
  id: number
  episode_number: number
  season_number: number
  name: string
  overview: string
  still_path: string | null
  air_date: string | null
  runtime: number | null
  vote_average: number
  vote_count: number
  guest_stars?: CastMember[]
  crew?: CrewMember[]
}

export interface PersonDetails {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  popularity: number
  tv_credits?: {
    cast: TVShowListItem[]
    crew: TVShowListItem[]
  }
}

export interface GenreListResponse {
  genres: Genre[]
}

export interface PaginatedResponse<T> {
  results: T[]
  page: number
  total_pages: number
  total_results: number
}

// ── Watch Status ──────────────────────────────

export type WatchStatus = 'plan_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped'

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
}

// ── User Data ─────────────────────────────────

export interface WatchlistEntry {
  id: string
  userId: string
  tmdbTvId: number
  status: WatchStatus
  addedAt: string
  updatedAt: string
  // Populated from TMDB on the frontend
  show?: TVShowListItem
}

export interface WatchHistoryEntry {
  id: string
  userId: string
  tmdbTvId: number
  seasonNumber: number
  episodeNumber: number
  currentPosition: number
  duration: number | null
  completed: boolean
  lastWatchedAt: string
  createdAt: string
  updatedAt: string
}

export interface TVCollection {
  id: string
  userId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  shows?: CollectionShow[]
}

export interface CollectionShow {
  id: string
  collectionId: string
  tmdbTvId: number
  position: number
  addedAt: string
  show?: TVShowListItem
}

export interface UserProfile {
  id: string
  authUserId: string
  displayName: string | null
  avatarUrl: string | null
  preferredTheme: string
  preferredLanguage: string | null
  preferredRegion: string | null
  autoplayNext: boolean
  createdAt: string
  updatedAt: string
}

// ── Playback ──────────────────────────────────

export interface PlaybackProgress {
  tmdbTvId: number
  seasonNumber: number
  episodeNumber: number
  currentPosition: number
  duration: number | null
}

export interface NextEpisodeInfo {
  season: number
  episode: number
  name: string
  still: string | null
}

// ── API ───────────────────────────────────────

export interface ApiError {
  message: string
  status?: number
}
