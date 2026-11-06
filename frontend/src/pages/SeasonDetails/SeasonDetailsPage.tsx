import { useParams, Link, useNavigate } from 'react-router-dom'
import { Play, ChevronLeft, CheckCircle2 } from 'lucide-react'
import Select from '@/components/ui/Select'
import ErrorState from '@/components/ui/ErrorState'
import { EpisodeCardSkeleton } from '@/components/ui/Skeleton'
import { useShowDetails, useSeasonDetails } from '@/hooks/useTV'
import { useHistory } from '@/hooks/useHistory'
import { useAuth } from '@/contexts/AuthContext'
import { getStillUrl } from '@/lib/tmdb-image'

export default function SeasonDetailsPage() {
  const { id, season } = useParams<{ id: string; season: string }>()
  const navigate = useNavigate()
  const showId = id ? parseInt(id, 10) : undefined
  const seasonNumber = season !== undefined ? parseInt(season, 10) : undefined

  const { user } = useAuth()
  const { data: show } = useShowDetails(showId)
  const { data: seasonData, isLoading, isError, refetch } = useSeasonDetails(showId, seasonNumber)
  const { data: history } = useHistory()

  const isWatched = (episodeNumber: number) =>
    Boolean(
      user &&
      history?.some(
        h => h.tmdbTvId === showId && h.seasonNumber === seasonNumber && h.episodeNumber === episodeNumber && h.completed
      )
    )

  const seasonOptions = (show?.seasons ?? [])
    .filter(s => s.season_number >= 0)
    .map(s => ({ value: String(s.season_number), label: s.name }))

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {show && (
        <Link to={`/tv/${show.id}`} className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-4">
          <ChevronLeft size={16} /> {show.name}
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            {seasonData?.name || `Season ${seasonNumber}`}
          </h1>
          {seasonData?.air_date && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {seasonData.air_date.slice(0, 4)} · {seasonData.episodes?.length ?? seasonData.episode_count} episodes
            </p>
          )}
        </div>
        {seasonOptions.length > 1 && showId && (
          <div className="w-48">
            <Select
              value={String(seasonNumber)}
              onChange={e => navigate(`/tv/${showId}/season/${e.target.value}`)}
              options={seasonOptions}
            />
          </div>
        )}
      </div>

      {seasonData?.overview && (
        <p className="text-[var(--color-text-secondary)] max-w-3xl leading-relaxed mb-8">{seasonData.overview}</p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <EpisodeCardSkeleton key={i} />)}
        </div>
      )}

      {isError && <ErrorState retry={() => refetch()} message="We couldn't load this season." />}

      {!isLoading && !isError && seasonData && (
        <div className="space-y-3">
          {(seasonData.episodes ?? []).map(ep => (
            <Link
              key={ep.id}
              to={`/tv/${showId}/season/${seasonNumber}/episode/${ep.episode_number}`}
              className="group flex gap-4 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-card)] transition-all"
            >
              <div className="relative flex-shrink-0 w-[140px] sm:w-[160px] aspect-video rounded-md overflow-hidden bg-[var(--color-bg-card)]">
                <img
                  src={getStillUrl(ep.still_path ?? seasonData.poster_path, 'w300')}
                  alt={ep.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <Play size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-semibold text-[var(--color-accent)]">{ep.episode_number}.</span>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">{ep.name}</h3>
                  {isWatched(ep.episode_number) && (
                    <CheckCircle2 size={14} className="text-[var(--color-success)] flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
                  {ep.air_date ? new Date(ep.air_date).toLocaleDateString() : 'Air date unknown'}
                  {ep.runtime ? ` · ${ep.runtime}m` : ''}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{ep.overview || 'No overview available.'}</p>
              </div>
            </Link>
          ))}
          {(!seasonData.episodes || seasonData.episodes.length === 0) && (
            <p className="text-sm text-[var(--color-text-muted)] py-10 text-center">No episode data available for this season yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
