import { Link } from 'react-router-dom'
import { Bookmark, Play, X } from 'lucide-react'
import { useContinueWatching, useRemoveHistoryEntry } from '@/hooks/useHistory'
import { useShowsByIds } from '@/hooks/useShowsByIds'
import { useAuth } from '@/contexts/AuthContext'
import EmptyState from '@/components/ui/EmptyState'
import { CardRowSkeleton } from '@/components/ui/Skeleton'
import { getPosterUrl } from '@/lib/tmdb-image'
import { useToast } from '@/hooks/useToast'

export default function ContinueWatchingRow() {
  const { user } = useAuth()
  const { data: entries, isLoading } = useContinueWatching()
  const removeEntry = useRemoveHistoryEntry()
  const toast = useToast()
  const showIds = (entries ?? []).map(e => e.tmdbTvId)
  const { data: shows } = useShowsByIds(showIds)

  if (!user) {
    return (
      <EmptyState
        icon={<Bookmark size={20} />}
        title="Sign in to track your progress"
        description="Once you're signed in, episodes you start show up here so you can jump back in."
        className="py-10 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg"
      />
    )
  }

  if (isLoading) return <CardRowSkeleton count={5} />

  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark size={20} />}
        title="Nothing in progress yet"
        description="Episodes you start will show up here so you can jump back in exactly where you left off."
        className="py-10 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg"
      />
    )
  }

  const handleRemove = async (id: string) => {
    try {
      await removeEntry.mutateAsync(id)
      toast.success('Removed from Continue Watching')
    } catch {
      toast.error('Could not remove from Continue Watching')
    }
  }

  return (
    <div className="scroll-row">
      {entries.map(entry => {
        const show = shows.find(s => s.id === entry.tmdbTvId)?.show
        const percent = entry.duration ? Math.min(100, Math.round((entry.currentPosition / entry.duration) * 100)) : 0
        return (
          <Link
            key={entry.id}
            to={`/watch/tv/${entry.tmdbTvId}/${entry.seasonNumber}/${entry.episodeNumber}`}
            className="group flex-shrink-0 w-[200px]"
          >
            <div className="relative overflow-hidden rounded-lg aspect-video bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              {show ? (
                <img src={getPosterUrl(show.poster_path, 'w342')} alt={show.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="skeleton w-full h-full" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <Play size={16} className="text-black ml-0.5" fill="black" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'var(--color-border)' }}>
                <div className="h-full" style={{ width: `${percent}%`, background: 'var(--color-accent)' }} />
              </div>
              <button
                type="button"
                onClick={event => {
                  event.preventDefault()
                  event.stopPropagation()
                  void handleRemove(entry.id)
                }}
                disabled={removeEntry.isPending}
                aria-label={`Remove ${show?.name ?? 'series'} from Continue Watching`}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-[var(--color-error)] disabled:cursor-wait disabled:opacity-60"
              >
                <X size={15} />
              </button>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1 mt-2">{show?.name ?? 'Loading…'}</p>
            <p className="text-xs text-[var(--color-text-muted)]">S{entry.seasonNumber} · E{entry.episodeNumber}</p>
          </Link>
        )
      })}
    </div>
  )
}
