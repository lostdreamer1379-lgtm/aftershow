import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as historyService from '@/services/historyService'
import { useAuth } from '@/contexts/AuthContext'

const HISTORY_KEY = ['history'] as const
const CONTINUE_WATCHING_KEY = ['history', 'continue-watching'] as const

export function useHistory() {
  const { user } = useAuth()
  return useQuery({
    queryKey: HISTORY_KEY,
    queryFn: historyService.getHistory,
    enabled: Boolean(user),
  })
}

export function useContinueWatching() {
  const { user } = useAuth()
  return useQuery({
    queryKey: CONTINUE_WATCHING_KEY,
    queryFn: historyService.getContinueWatching,
    enabled: Boolean(user),
  })
}

export function useUpsertProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: historyService.upsertProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY })
      queryClient.invalidateQueries({ queryKey: CONTINUE_WATCHING_KEY })
    },
  })
}

export function useRemoveHistoryEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => historyService.removeHistoryEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY })
      queryClient.invalidateQueries({ queryKey: CONTINUE_WATCHING_KEY })
    },
  })
}
