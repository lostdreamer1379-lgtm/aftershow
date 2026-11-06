import { useMemo, useState } from 'react'
import { Bookmark, Search as SearchIcon, X } from 'lucide-react'
import { WatchStatus, WATCH_STATUS_LABELS } from '@/types'
import { useWatchlist, useUpdateWatchlistEntry, useRemoveFromWatchlist } from '@/hooks/useWatchlist'
import { useShowsByIds } from '@/hooks/useShowsByIds'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { PosterSkeleton } from '@/components/ui/Skeleton'
import Skeleton from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { getPosterUrl } from '@/lib/tmdb-image'
import { useToast } from '@/hooks/useToast'

const TABS: { label: string; value: WatchStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Watching', value: 'watching' },
  { label: 'Plan to Watch', value: 'plan_to_watch' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Dropped', value: 'dropped' },
]

const SORT_OPTIONS = [
  { value: 'added_desc', label: 'Recently added' },
  { value: 'added_asc', label: 'Oldest added' },
  { value: 'rating_desc', label: 'Highest rated' },
  { value: 'name_asc', label: 'Name (A–Z)' },
]

export default function WatchlistPage() {
  const [tab, setTab] = useState<WatchStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('added_desc')
  const toast = useToast()

  const { data: entries, isLoading, isError, refetch } = useWatchlist(tab === 'all' ? undefined : tab)
  const updateEntry = useUpdateWatchlistEntry()
  const removeEntry = useRemoveFromWatchlist()

  const ids = useMemo(() => (entries ?? []).map(e => e.tmdbTvId), [entries])
  const { data: shows } = useShowsByIds(ids)

  const merged = useMemo(() => {
    return (entries ?? []).map(entry => {
      const match = shows.find(s => s.id === entry.tmdbTvId)
      return { entry, show: match?.show, isLoading: match?.isLoading ?? true }
    })
  }, [entries, shows])

  const filtered = useMemo(() => {
    let list = merged
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(m => m.show?.name.toLowerCase().includes(q))
    }
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case 'added_asc':
          return new Date(a.entry.addedAt).getTime() - new Date(b.entry.addedAt).getTime()
        case 'rating_desc':
          return (b.show?.vote_average ?? 0) - (a.show?.vote_average ?? 0)
        case 'name_asc':
          return (a.show?.name ?? '').localeCompare(b.show?.name ?? '')
        case 'added_desc':
        default:
          return new Date(b.entry.addedAt).getTime() - new Date(a.entry.addedAt).getTime()
      }
    })
    return sorted
  }, [merged, search, sort])

  const handleStatusChange = async (id: string, status: WatchStatus) => {
    try {
      await updateEntry.mutateAsync({ id, status })
    } catch {
      toast.error('Could not update status')
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeEntry.mutateAsync(id)
      toast.success('Removed from watchlist')
    } catch {
      toast.error('Could not remove')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-text-primary)] mb-6">
        Your Watchlist
      </h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              tab === t.value
                ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)] border-[var(--color-accent)] font-medium'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <Input
            icon={<SearchIcon size={16} />}
            iconRight={search ? (
              <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>
            ) : undefined}
            placeholder="Search your watchlist…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={sort} onChange={e => setSort(e.target.value)} options={SORT_OPTIONS} />
        </div>
      </div>

      {isError && <ErrorState retry={() => refetch()} />}

      {!isError && isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <PosterSkeleton />
              <Skeleton className="mt-2 h-3 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isError && !isLoading && filtered.length === 0 && (
        <EmptyState
          icon={<Bookmark size={22} />}
          title={search ? 'No matches' : 'Nothing here yet'}
          description={search ? `No shows in this list match "${search}".` : 'Shows you add to your watchlist will show up here.'}
        />
      )}

      {!isError && !isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
          {filtered.map(({ entry, show }) => (
            <div key={entry.id} className="group relative">
              <Link to={show ? `/tv/${show.id}` : '#'} className="block">
                <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                  {show ? (
                    <img
                      src={getPosterUrl(show.poster_path, 'w342')}
                      alt={show.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="skeleton w-full h-full" />
                  )}
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 mt-2 leading-tight group-hover:text-[var(--color-accent)] transition-colors">
                  {show?.name ?? 'Loading…'}
                </p>
              </Link>

              <div className="flex items-center justify-between mt-1.5">
                <select
                  value={entry.status}
                  onChange={e => handleStatusChange(entry.id, e.target.value as WatchStatus)}
                  className="text-[11px] bg-transparent border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[var(--color-text-secondary)] outline-none cursor-pointer"
                  onClick={e => e.stopPropagation()}
                >
                  {(['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'] as WatchStatus[]).map(s => (
                    <option key={s} value={s}>{WATCH_STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                  aria-label="Remove from watchlist"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
