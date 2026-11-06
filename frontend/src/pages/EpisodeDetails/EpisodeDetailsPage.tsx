import { useParams, Link, useNavigate } from 'react-router-dom'
import { Play, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState'
import PersonCard from '@/components/shows/PersonCard'
import { useShowDetails, useSeasonDetails, useEpisodeDetails } from '@/hooks/useTV'
import { getAdjacentEpisodes } from '@/lib/episodeNav'
import { getStillUrl } from '@/lib/tmdb-image'

export default function EpisodeDetailsPage() {
  const { id, season, episode } = useParams<{ id: string; season: string; episode: string }>()
  const navigate = useNavigate()
  const showId = id ? parseInt(id, 10) : undefined
  const seasonNumber = season !== undefined ? parseInt(season, 10) : undefined
  const episodeNumber = episode !== undefined ? parseInt(episode, 10) : undefined

  const { data: show } = useShowDetails(showId)
  const { data: seasonData } = useSeasonDetails(showId, seasonNumber)
  const { data: ep, isLoading, isError, refetch } = useEpisodeDetails(showId, seasonNumber, episodeNumber)

  // Determine previous/next episode using the ACTUAL loaded season data,
  // correctly handling season boundaries rather than assuming
  // episode + 1 always exists within the current season.
  const { prevTarget, nextTarget, hasPrevSeason, isSeriesFinale } = getAdjacentEpisodes(
    show,
    seasonData?.episodes,
    seasonNumber,
    episodeNumber
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <div className="skeleton h-64 w-full rounded-lg" />
        <div className="skeleton h-6 w-1/2" />
        <div className="skeleton h-4 w-full" />
      </div>
    )
  }

  if (isError || !ep) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <ErrorState title="Episode not found" message="We couldn't load this episode." retry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {show && (
        <Link
          to={`/tv/${show.id}/season/${seasonNumber}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {show.name} — Season {seasonNumber}
        </Link>
      )}

      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[var(--color-bg-card)] mb-6 group">
        <img src={getStillUrl(ep.still_path, 'original')} alt={ep.name} className="w-full h-full object-cover" />
        {showId && (
          <Link
            to={`/watch/tv/${showId}/${seasonNumber}/${episodeNumber}`}
            className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={26} className="text-black ml-1" fill="black" />
            </div>
          </Link>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[var(--color-accent)] font-semibold">S{seasonNumber}E{episodeNumber}</span>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">{ep.name}</h1>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        {ep.air_date ? new Date(ep.air_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Air date unknown'}
        {ep.runtime ? ` · ${ep.runtime} min` : ''}
        {ep.vote_average > 0 ? ` · ★ ${ep.vote_average.toFixed(1)}` : ''}
      </p>

      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">{ep.overview || 'No overview available.'}</p>

      {showId && (
        <Link to={`/watch/tv/${showId}/${seasonNumber}/${episodeNumber}`}>
          <Button variant="primary" icon={<Play size={16} fill="currentColor" />} className="mb-10">
            Watch Now
          </Button>
        </Link>
      )}

      {ep.guest_stars && ep.guest_stars.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Guest Stars</h2>
          <div className="scroll-row">
            {ep.guest_stars.map(g => (
              <PersonCard key={g.id} id={g.id} name={g.name} subtitle={g.character} profilePath={g.profile_path} />
            ))}
          </div>
        </section>
      )}

      {/* Episode navigation */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-6">
        {prevTarget ? (
          <button
            onClick={() => navigate(`/tv/${showId}/season/${prevTarget.season}/episode/${prevTarget.episode}`)}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ChevronLeft size={16} /> Previous Episode
          </button>
        ) : hasPrevSeason ? (
          <Link
            to={`/tv/${showId}/season/${seasonNumber! - 1}`}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ChevronLeft size={16} /> Season {seasonNumber! - 1}
          </Link>
        ) : <span />}

        {nextTarget ? (
          <button
            onClick={() => navigate(`/tv/${showId}/season/${nextTarget.season}/episode/${nextTarget.episode}`)}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Next Episode <ChevronRight size={16} />
          </button>
        ) : isSeriesFinale ? (
          <span className="text-sm text-[var(--color-text-muted)]">End of series</span>
        ) : <span />}
      </div>
    </div>
  )
}
