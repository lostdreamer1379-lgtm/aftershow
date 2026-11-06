import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Plus, X, Search } from 'lucide-react'
import { useCollection, useRemoveShowFromCollection, useAddShowToCollection } from '@/hooks/useCollections'
import { useShowsByIds } from '@/hooks/useShowsByIds'
import { useSearchShows } from '@/hooks/useTV'
import { useDebounce } from '@/hooks/useDebounce'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { getPosterUrl } from '@/lib/tmdb-image'
import { useToast } from '@/hooks/useToast'

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const { data: collection, isLoading, isError, refetch } = useCollection(id)
  const removeShow = useRemoveShowFromCollection()
  const addShow = useAddShowToCollection()

  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)
  const searchResult = useSearchShows(debouncedQuery)

  const showIds = (collection?.shows ?? []).map(s => s.tmdbTvId)
  const { data: shows } = useShowsByIds(showIds)

  const existingIds = new Set(showIds)

  const handleRemove = async (showEntryId: string) => {
    if (!id) return
    try {
      await removeShow.mutateAsync({ collectionId: id, showId: showEntryId })
      toast.success('Removed from collection')
    } catch {
      toast.error('Could not remove show')
    }
  }

  const handleAdd = async (tmdbTvId: number) => {
    if (!id) return
    try {
      await addShow.mutateAsync({ collectionId: id, tmdbTvId })
      toast.success('Added to collection')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Could not add show')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
        </div>
      </div>
    )
  }

  if (isError || !collection) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <ErrorState title="Collection not found" retry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/collections" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-4">
        <ChevronLeft size={16} /> Collections
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-text-primary)]">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-[var(--color-text-muted)] mt-1">{collection.description}</p>
          )}
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {collection.shows?.length ?? 0} show{(collection.shows?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add Shows
        </Button>
      </div>

      {(!collection.shows || collection.shows.length === 0) ? (
        <EmptyState
          title="No shows in this collection yet"
          description="Search and add shows to build out this list."
          action={{ label: 'Add shows', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
          {collection.shows.map(entry => {
            const match = shows.find(s => s.id === entry.tmdbTvId)
            return (
              <div key={entry.id} className="group relative">
                <Link to={match?.show ? `/tv/${match.show.id}` : '#'}>
                  <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                    {match?.show ? (
                      <img
                        src={getPosterUrl(match.show.poster_path, 'w342')}
                        alt={match.show.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="skeleton w-full h-full" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 mt-2 leading-tight group-hover:text-[var(--color-accent)] transition-colors">
                    {match?.show?.name ?? 'Loading…'}
                  </p>
                </Link>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/60 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove from collection"
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Shows" size="md">
        <div className="space-y-4">
          <Input
            icon={<Search size={16} />}
            placeholder="Search for a series…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <div className="max-h-80 overflow-y-auto space-y-1">
            {searchResult.isLoading && debouncedQuery && (
              <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">Searching…</p>
            )}
            {!searchResult.isLoading && debouncedQuery && (searchResult.data?.results?.length ?? 0) === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No results for "{debouncedQuery}".</p>
            )}
            {(searchResult.data?.results ?? []).map(result => {
              const alreadyIn = existingIds.has(result.id)
              return (
                <button
                  key={result.id}
                  onClick={() => !alreadyIn && handleAdd(result.id)}
                  disabled={alreadyIn}
                  className="w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-[var(--color-bg-card)] transition-colors disabled:opacity-50 disabled:cursor-default"
                >
                  <img
                    src={getPosterUrl(result.poster_path, 'w92')}
                    alt={result.name}
                    className="w-10 h-14 object-cover rounded flex-shrink-0 bg-[var(--color-bg-card)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{result.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {result.first_air_date ? result.first_air_date.slice(0, 4) : 'TBA'}
                    </p>
                  </div>
                  {alreadyIn && <span className="text-xs text-[var(--color-accent)] flex-shrink-0">Added</span>}
                </button>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}
