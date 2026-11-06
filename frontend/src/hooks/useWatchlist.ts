import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as watchlistService from '@/services/watchlistService'
import { useAuth } from '@/contexts/AuthContext'
import { WatchStatus } from '@/types'

const WATCHLIST_KEY = ['watchlist'] as const

export function useWatchlist(status?: WatchStatus) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...WATCHLIST_KEY, status ?? 'all'],
    queryFn: () => watchlistService.getWatchlist(status),
    enabled: Boolean(user),
  })
}

/** Finds the watchlist entry for a given show from the full (unfiltered) list, if any. */
export function useWatchlistEntryFor(tmdbTvId: number | undefined) {
  const { data } = useWatchlist()
  return data?.find(e => e.tmdbTvId === tmdbTvId)
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tmdbTvId, status }: { tmdbTvId: number; status?: WatchStatus }) =>
      watchlistService.addToWatchlist(tmdbTvId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY })
    },
  })
}

export function useUpdateWatchlistEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WatchStatus }) =>
      watchlistService.updateWatchlistEntry(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY })
    },
  })
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => watchlistService.removeFromWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY })
    },
  })
}
