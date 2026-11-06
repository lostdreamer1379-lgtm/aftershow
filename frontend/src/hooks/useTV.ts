import { useQuery, keepPreviousData } from '@tanstack/react-query'
import * as tvService from '@/services/tvService'

export const tvKeys = {
  trending: (page: number) => ['tv', 'trending', page] as const,
  popular: (page: number) => ['tv', 'popular', page] as const,
  topRated: (page: number) => ['tv', 'top-rated', page] as const,
  airingToday: (page: number) => ['tv', 'airing-today', page] as const,
  onTheAir: (page: number) => ['tv', 'on-the-air', page] as const,
  search: (query: string, page: number) => ['tv', 'search', query, page] as const,
  discover: (params: Record<string, string | number>) => ['tv', 'discover', params] as const,
  genres: () => ['tv', 'genres'] as const,
  details: (id: number) => ['tv', 'details', id] as const,
  recommendations: (id: number, page: number) => ['tv', 'recommendations', id, page] as const,
  similar: (id: number, page: number) => ['tv', 'similar', id, page] as const,
  season: (id: number, season: number) => ['tv', 'season', id, season] as const,
  episode: (id: number, season: number, episode: number) => ['tv', 'episode', id, season, episode] as const,
  person: (id: number) => ['person', id] as const,
}

export function useTrending(page = 1) {
  return useQuery({ queryKey: tvKeys.trending(page), queryFn: () => tvService.getTrending(page) })
}

export function usePopular(page = 1, enabled = true) {
  return useQuery({ queryKey: tvKeys.popular(page), queryFn: () => tvService.getPopular(page), enabled })
}

export function useTopRated(page = 1, enabled = true) {
  return useQuery({ queryKey: tvKeys.topRated(page), queryFn: () => tvService.getTopRated(page), enabled })
}

export function useAiringToday(page = 1, enabled = true) {
  return useQuery({ queryKey: tvKeys.airingToday(page), queryFn: () => tvService.getAiringToday(page), enabled })
}

export function useOnTheAir(page = 1, enabled = true) {
  return useQuery({ queryKey: tvKeys.onTheAir(page), queryFn: () => tvService.getOnTheAir(page), enabled })
}

export function useSearchShows(query: string, page = 1) {
  return useQuery({
    queryKey: tvKeys.search(query, page),
    queryFn: () => tvService.searchShows(query, page),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
  })
}

export function useDiscoverShows(params: Record<string, string | number>, enabled = true) {
  return useQuery({
    queryKey: tvKeys.discover(params),
    queryFn: () => tvService.discoverShows(params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useGenres() {
  return useQuery({ queryKey: tvKeys.genres(), queryFn: tvService.getGenres, staleTime: 1000 * 60 * 60 })
}

export function useShowDetails(id: number | undefined) {
  return useQuery({
    queryKey: tvKeys.details(id ?? 0),
    queryFn: () => tvService.getShowDetails(id!),
    enabled: Boolean(id),
  })
}

export function useShowRecommendations(id: number | undefined, page = 1) {
  return useQuery({
    queryKey: tvKeys.recommendations(id ?? 0, page),
    queryFn: () => tvService.getShowRecommendations(id!, page),
    enabled: Boolean(id),
  })
}

export function useShowSimilar(id: number | undefined, page = 1) {
  return useQuery({
    queryKey: tvKeys.similar(id ?? 0, page),
    queryFn: () => tvService.getShowSimilar(id!, page),
    enabled: Boolean(id),
  })
}

export function useSeasonDetails(showId: number | undefined, seasonNumber: number | undefined) {
  return useQuery({
    queryKey: tvKeys.season(showId ?? 0, seasonNumber ?? 0),
    queryFn: () => tvService.getSeasonDetails(showId!, seasonNumber!),
    enabled: Boolean(showId) && seasonNumber !== undefined,
  })
}

export function useEpisodeDetails(
  showId: number | undefined,
  seasonNumber: number | undefined,
  episodeNumber: number | undefined
) {
  return useQuery({
    queryKey: tvKeys.episode(showId ?? 0, seasonNumber ?? 0, episodeNumber ?? 0),
    queryFn: () => tvService.getEpisodeDetails(showId!, seasonNumber!, episodeNumber!),
    enabled: Boolean(showId) && seasonNumber !== undefined && episodeNumber !== undefined,
  })
}

export function usePersonDetails(id: number | undefined) {
  return useQuery({
    queryKey: tvKeys.person(id ?? 0),
    queryFn: () => tvService.getPersonDetails(id!),
    enabled: Boolean(id),
  })
}
