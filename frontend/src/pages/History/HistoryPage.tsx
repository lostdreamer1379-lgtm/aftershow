import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon, Play, X } from 'lucide-react'
import { useHistory, useRemoveHistoryEntry } from '@/hooks/useHistory'
import { useShowsByIds } from '@/hooks/useShowsByIds'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { getPosterUrl } from '@/lib/tmdb-image'
import { useToast } from '@/hooks/useToast'
import { WatchHistoryEntry } from '@/types'

export default function HistoryPage() {
  const { data: history, isLoading, isError, refetch } = useHistory()
  const removeEntry = useRemoveHistoryEntry()
  const toast = useToast()

  const showIds = useMemo(() => Array.from(new Set((history ?? []).map(h => h.tmdbTvId))), [history])
  const { data: shows } = useShowsByIds(showIds)
  const showFor = (tmdbTvId: number) => shows.find(s => s.id === tmdbTvId)?.show

  const unfinished = useMemo(
    () => (history ?? []).filter(h => !h.completed).sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()),
    [history]
  )

  const completed = useMemo(
    () => (history ?? []).filter(h => h.completed).sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()),
    [history]
  )

  const handleRemove = async (id: string) => {
    try {
      await removeEntry.mutateAsync(id)
      toast.success('Removed from history')
    } catch {
      toast.error('Could not remove entry')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-3">
        <Skeleton className="h-8 w-1/3 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <ErrorState retry={() => refetch()} />
      </div>
    )
  }

  const isEmpty = (history ?? []).length === 0

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
        Viewing History
      </h1>

      {isEmpty && (
        <EmptyState
          icon={<HistoryIcon size={22} />}
          title="No viewing history yet"
          description="Episodes you watch will appear here, so you can always pick up where you left off."
        />
      )}

      {unfinished.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Continue Watching</h2>
          <div className="space-y-3">
            {unfinished.map(entry => (
              <HistoryRow
                key={entry.id}
                entry={entry}
                show={showFor(entry.tmdbTvId)}
                onRemove={() => handleRemove(entry.id)}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Completed Episodes</h2>
          <div className="space-y-3">
            {completed.map(entry => (
              <HistoryRow
                key={entry.id}
                entry={entry}
                show={showFor(entry.tmdbTvId)}
                onRemove={() => handleRemove(entry.id)}
                completed
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function HistoryRow({
  entry,
  show,
  onRemove,
  completed,
}: {
  entry: WatchHistoryEntry
  show?: { id: number; name: string; poster_path: string | null }
  onRemove: () => void
  completed?: boolean
}) {
  const percent = entry.duration ? Math.min(100, Math.round((entry.currentPosition / entry.duration) * 100)) : completed ? 100 : 0

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <Link to={show ? `/tv/${show.id}/season/${entry.seasonNumber}/episode/${entry.episodeNumber}` : '#'} className="flex-shrink-0">
        {show ? (
          <img src={getPosterUrl(show.poster_path, 'w92')} alt={show.name} className="w-12 h-[72px] object-cover rounded" />
        ) : (
          <div className="skeleton w-12 h-[72px] rounded" />
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={show ? `/tv/${show.id}` : '#'} className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors truncate block">
          {show?.name ?? 'Loading…'}
        </Link>
        <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
          Season {entry.seasonNumber}, Episode {entry.episodeNumber}
          {' · '}
          {new Date(entry.lastWatchedAt).toLocaleDateString()}
        </p>
        {!completed && (
          <div className="progress-bar max-w-[200px]">
            <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
      {!completed && show && (
        <Link
          to={`/watch/tv/${show.id}/${entry.seasonNumber}/${entry.episodeNumber}`}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-accent)] text-[var(--color-bg-primary)] flex items-center justify-center hover:bg-[var(--color-accent-hover)] transition-colors"
          aria-label="Resume"
        >
          <Play size={14} fill="currentColor" className="ml-0.5" />
        </Link>
      )}
      <button
        onClick={onRemove}
        className="flex-shrink-0 w-8 h-8 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-error)] flex items-center justify-center transition-colors"
        aria-label="Remove from history"
      >
        <X size={16} />
      </button>
    </div>
  )
}
