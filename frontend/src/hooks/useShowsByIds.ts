import { useQueries } from '@tanstack/react-query'
import * as tvService from '@/services/tvService'
import { tvKeys } from '@/hooks/useTV'

/**
 * Fetches full TMDB show details for a set of ids in parallel. Used wherever
 * we only have tmdbTvId on hand — watchlist entries, collection items, watch
 * history — and need the show's poster/name/rating to render a card. Shares
 * its cache with useShowDetails, so a show already open elsewhere in the app
 * won't be re-fetched.
 */
export function useShowsByIds(ids: number[]) {
  const results = useQueries({
    queries: ids.map(id => ({
      queryKey: tvKeys.details(id),
      queryFn: () => tvService.getShowDetails(id),
      staleTime: 1000 * 60 * 5,
    })),
  })

  return {
    data: results.map((r, i) => ({ id: ids[i], show: r.data, isLoading: r.isLoading, isError: r.isError })),
    isLoading: results.some(r => r.isLoading),
  }
}
