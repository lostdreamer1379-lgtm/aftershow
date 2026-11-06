import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as collectionsService from '@/services/collectionsService'
import { useAuth } from '@/contexts/AuthContext'

const COLLECTIONS_KEY = ['collections'] as const
const collectionKey = (id: string) => ['collections', id] as const

export function useCollections() {
  const { user } = useAuth()
  return useQuery({
    queryKey: COLLECTIONS_KEY,
    queryFn: collectionsService.getCollections,
    enabled: Boolean(user),
  })
}

export function useCollection(id: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: collectionKey(id ?? ''),
    queryFn: () => collectionsService.getCollection(id!),
    enabled: Boolean(user) && Boolean(id),
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      collectionsService.createCollection(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; description?: string } }) =>
      collectionsService.updateCollection(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY })
      queryClient.invalidateQueries({ queryKey: collectionKey(variables.id) })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => collectionsService.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY })
    },
  })
}

export function useAddShowToCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ collectionId, tmdbTvId }: { collectionId: string; tmdbTvId: number }) =>
      collectionsService.addShowToCollection(collectionId, tmdbTvId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY })
      queryClient.invalidateQueries({ queryKey: collectionKey(variables.collectionId) })
    },
  })
}

export function useRemoveShowFromCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ collectionId, showId }: { collectionId: string; showId: string }) =>
      collectionsService.removeShowFromCollection(collectionId, showId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY })
      queryClient.invalidateQueries({ queryKey: collectionKey(variables.collectionId) })
    },
  })
}
