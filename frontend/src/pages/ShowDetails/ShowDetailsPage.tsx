import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, Layers, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import ErrorState from '@/components/ui/ErrorState'
import ShowRow from '@/components/shows/ShowRow'
import PersonCard from '@/components/shows/PersonCard'
import TrailerModal from '@/components/shows/TrailerModal'
import WatchlistStatusMenu from '@/components/shows/WatchlistStatusMenu'
import AddToCollectionModal from '@/components/shows/AddToCollectionModal'
import { useShowDetails, useShowRecommendations, useShowSimilar } from '@/hooks/useTV'
import { useWatchlistEntryFor, useUpdateWatchlistEntry, useAddToWatchlist } from '@/hooks/useWatchlist'
import { useHistory } from '@/hooks/useHistory'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { computeShowProgress } from '@/lib/showProgress'
import { getBackdropUrl, getPosterUrl } from '@/lib/tmdb-image'

function formatRuntime(minutes?: number[]) {
  if (!minutes || minutes.length === 0) return null
  const avg = Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length)
  return `${avg}m`
}

export default function ShowDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const showId = id ? parseInt(id, 10) : undefined
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [collectionModalOpen, setCollectionModalOpen] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  const { data: show, isLoading, isError, refetch } = useShowDetails(showId)
  const { data: recommendations } = useShowRecommendations(showId)
  const { data: similar } = useShowSimilar(showId)
  const { data: history } = useHistory()

  const watchlistEntry = useWatchlistEntryFor(showId)
  const addToWatchlist = useAddToWatchlist()
  const updateWatchlistEntry = useUpdateWatchlistEntry()

  const handleMarkCompleted = async () => {
    try {
      if (watchlistEntry) {
        await updateWatchlistEntry.mutateAsync({ id: watchlistEntry.id, status: 'completed' })
      } else if (showId) {
        await addToWatchlist.mutateAsync({ tmdbTvId: showId, status: 'completed' })
      }
      toast.success('Marked as completed')
    } catch {
      toast.error('Could not update watchlist')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <div className="skeleton h-[40vh] w-full rounded-lg" />
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
    )
  }

  if (isError || !show) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <ErrorState title="Series not found" message="We couldn't load this series. It may not exist or TMDB may be unreachable." retry={() => refetch()} />
      </div>
    )
  }

  const trailer = show.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
    ?? show.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')

  const topCast = show.credits?.cast?.slice(0, 12) ?? []
  const creators = show.created_by ?? []
  const providers = show['watch/providers']?.results?.US
  const progress = user && history ? computeShowProgress(show, history) : null

  return (
    <div>
      {/* Backdrop header */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[45vh] min-h-[340px]">
          <img
            src={getBackdropUrl(show.backdrop_path, 'original')}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 backdrop-gradient-bottom" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-bg-primary) 0%, transparent 60%)' }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-28 relative z-10 pb-10">
          <div className="flex flex-col sm:flex-row gap-6">
            <img
              src={getPosterUrl(show.poster_path, 'w342')}
              alt={show.name}
              className="w-[160px] sm:w-[200px] rounded-lg border border-[var(--color-border)] shadow-2xl flex-shrink-0 self-start"
            />

            <div className="flex-1 pt-2">
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-1">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="text-[var(--color-text-muted)] italic mb-3">{show.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-[var(--color-text-secondary)]">
                {show.first_air_date && <span>{show.first_air_date.slice(0, 4)}</span>}
                <span>·</span>
                <Badge variant={show.status === 'Ended' ? 'outline' : 'success'}>{show.status}</Badge>
                <span>·</span>
                <span>{show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                {show.number_of_episodes > 0 && (
                  <>
                    <span>·</span>
                    <span>{show.number_of_episodes} episodes</span>
                  </>
                )}
                {formatRuntime(show.episode_run_time) && (
                  <>
                    <span>·</span>
                    <span>{formatRuntime(show.episode_run_time)}/ep</span>
                  </>
                )}
                {show.vote_average > 0 && (
                  <>
                    <span>·</span>
                    <Rating value={show.vote_average} count={show.vote_count} />
                  </>
                )}
              </div>

              {show.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {show.genres.map(g => (
                    <span key={g.id} className="genre-pill">{g.name}</span>
                  ))}
                </div>
              )}

              <p className="text-[var(--color-text-secondary)] max-w-2xl leading-relaxed mb-5">
                {show.overview || 'No overview available.'}
              </p>

              {progress && progress.totalEpisodes > 0 && (
                <div className="max-w-md mb-6">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1.5">
                    <span>{progress.episodesWatched} of {progress.totalEpisodes} episodes watched</span>
                    <span>{progress.overallPercent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress.overallPercent}%` }} />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {show.number_of_seasons > 0 && (
                  <Link
                    to={
                      progress?.nextEpisode
                        ? `/watch/tv/${show.id}/${progress.nextEpisode.season}/${progress.nextEpisode.episode}`
                        : `/watch/tv/${show.id}/1/1`
                    }
                  >
                    <Button variant="primary" icon={<Play size={16} fill="currentColor" />}>
                      {progress?.lastWatched ? 'Continue Watching' : 'Watch Series'}
                    </Button>
                  </Link>
                )}
                {trailer && (
                  <Button variant="secondary" onClick={() => setTrailerKey(trailer.key)}>
                    Watch Trailer
                  </Button>
                )}
                {showId && <WatchlistStatusMenu tmdbTvId={showId} />}
                <Button
                  variant="ghost"
                  icon={<Layers size={16} />}
                  disabled={!user}
                  title={user ? undefined : 'Sign in to use collections'}
                  onClick={() => setCollectionModalOpen(true)}
                >
                  Collection
                </Button>
                <Button
                  variant="ghost"
                  icon={<CheckCircle2 size={16} />}
                  disabled={!user}
                  title={user ? undefined : 'Sign in to track completion'}
                  onClick={handleMarkCompleted}
                >
                  Mark Completed
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Seasons */}
        {show.seasons && show.seasons.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Seasons</h2>
            <div className="scroll-row">
              {show.seasons
                .filter(s => s.season_number >= 0)
                .map(season => (
                  <Link
                    key={season.id}
                    to={`/tv/${show.id}/season/${season.season_number}`}
                    className="flex-shrink-0 w-[140px] group"
                  >
                    <img
                      src={getPosterUrl(season.poster_path ?? show.poster_path, 'w342')}
                      alt={season.name}
                      className="w-full aspect-[2/3] object-cover rounded-lg border border-[var(--color-border)] mb-2 group-hover:border-[var(--color-accent)] transition-colors"
                      loading="lazy"
                    />
                    <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">{season.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{season.episode_count} episodes</p>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {topCast.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Cast</h2>
            <div className="scroll-row">
              {topCast.map(member => (
                <PersonCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  subtitle={member.character}
                  profilePath={member.profile_path}
                />
              ))}
            </div>
          </section>
        )}

        {/* Creators & networks */}
        {(creators.length > 0 || show.networks.length > 0) && (
          <section className="mb-10 grid sm:grid-cols-2 gap-6">
            {creators.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Created by</h3>
                <p className="text-[var(--color-text-primary)]">{creators.map(c => c.name).join(', ')}</p>
              </div>
            )}
            {show.networks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Networks</h3>
                <p className="text-[var(--color-text-primary)]">{show.networks.map(n => n.name).join(', ')}</p>
              </div>
            )}
          </section>
        )}

        {/* Watch providers */}
        {providers && (providers.flatrate?.length || providers.rent?.length || providers.buy?.length) && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Where to Watch (US)</h2>
            <div className="flex flex-wrap gap-3">
              {[...(providers.flatrate ?? []), ...(providers.rent ?? []), ...(providers.buy ?? [])]
                .filter((p, i, arr) => arr.findIndex(x => x.provider_id === p.provider_id) === i)
                .map(p => (
                  <div key={p.provider_id} className="flex items-center gap-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                    {p.logo_path && (
                      <img src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} alt={p.provider_name} className="w-6 h-6 rounded" />
                    )}
                    <span className="text-sm text-[var(--color-text-secondary)]">{p.provider_name}</span>
                  </div>
                ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">Regional availability data provided by TMDB / JustWatch.</p>
          </section>
        )}

        {/* Recommendations & similar */}
        <ShowRow title="Recommended" shows={recommendations?.results} />
        <ShowRow title="Similar Series" shows={similar?.results} />
      </div>

      <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
      {showId && (
        <AddToCollectionModal open={collectionModalOpen} onClose={() => setCollectionModalOpen(false)} tmdbTvId={showId} />
      )}
    </div>
  )
}
