import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info } from 'lucide-react'
import Button from '@/components/ui/Button'
import ShowRow from '@/components/shows/ShowRow'
import ContinueWatchingRow from '@/components/shows/ContinueWatchingRow'
import WatchlistStatusMenu from '@/components/shows/WatchlistStatusMenu'
import { useTrending, usePopular, useTopRated, useAiringToday, useOnTheAir } from '@/hooks/useTV'
import { getBackdropUrl } from '@/lib/tmdb-image'

export default function HomePage() {
  const trending = useTrending()
  const popular = usePopular()
  const topRated = useTopRated()
  const airingToday = useAiringToday()
  const onTheAir = useOnTheAir()

  // Feature the top trending show in the hero. Falls back gracefully while
  // loading or if TMDB isn't configured yet.
  const featured = useMemo(() => trending.data?.results?.[0], [trending.data])

  return (
    <div>
      {/* Cinematic hero */}
      <section className="relative h-[64vh] min-h-[460px] w-full overflow-hidden flex items-end">
        {featured?.backdrop_path ? (
          <img
            src={getBackdropUrl(featured.backdrop_path, 'original')}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at top right, var(--color-bg-secondary) 0%, var(--color-bg-primary) 65%)' }}
          />
        )}
        <div className="absolute inset-0 backdrop-gradient-right" />
        <div className="absolute inset-0 backdrop-gradient-bottom" />

        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-12">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-medium mb-3">
            {featured ? 'Trending This Week' : 'Featured Series'}
          </p>

          {trending.isLoading && (
            <div className="space-y-3 max-w-2xl">
              <div className="skeleton h-10 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          )}

          {!trending.isLoading && featured && (
            <>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] max-w-2xl leading-tight mb-4">
                {featured.name}
              </h1>
              <p className="text-[var(--color-text-secondary)] max-w-xl mb-3 leading-relaxed line-clamp-3">
                {featured.overview}
              </p>
              <div className="flex items-center gap-3 mb-6 text-sm text-[var(--color-text-secondary)]">
                {featured.first_air_date && <span>{featured.first_air_date.slice(0, 4)}</span>}
                {featured.vote_average > 0 && (
                  <span className="rating-badge">★ {featured.vote_average.toFixed(1)}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to={`/watch/tv/${featured.id}/1/1`}>
                  <Button variant="primary" size="lg" icon={<Play size={18} fill="currentColor" />}>
                    Watch Now
                  </Button>
                </Link>
                <Link to={`/tv/${featured.id}`}>
                  <Button variant="secondary" size="lg" icon={<Info size={18} />}>
                    View Details
                  </Button>
                </Link>
                <WatchlistStatusMenu tmdbTvId={featured.id} size="lg" />
              </div>
            </>
          )}

          {!trending.isLoading && !featured && (
            <>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] max-w-2xl leading-tight mb-4">
                Your next favorite show is waiting.
              </h1>
              <p className="text-[var(--color-text-secondary)] max-w-xl mb-6 leading-relaxed">
                TMDB isn't configured yet — set <code className="text-[var(--color-accent)]">TMDB_API_READ_ACCESS_TOKEN</code> in
                the backend to populate this hero and the rows below.
              </p>
            </>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Continue Watching */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Continue Watching</h2>
          <ContinueWatchingRow />
        </section>

        <ShowRow
          title="Trending Now"
          shows={trending.data?.results}
          isLoading={trending.isLoading}
          isError={trending.isError}
          onRetry={() => trending.refetch()}
          viewAllHref="/explore"
        />
        <ShowRow
          title="Popular Series"
          shows={popular.data?.results}
          isLoading={popular.isLoading}
          isError={popular.isError}
          onRetry={() => popular.refetch()}
          viewAllHref="/explore"
        />
        <ShowRow
          title="Top Rated"
          shows={topRated.data?.results}
          isLoading={topRated.isLoading}
          isError={topRated.isError}
          onRetry={() => topRated.refetch()}
          viewAllHref="/explore"
        />
        <ShowRow
          title="Airing Today"
          shows={airingToday.data?.results}
          isLoading={airingToday.isLoading}
          isError={airingToday.isError}
          onRetry={() => airingToday.refetch()}
          viewAllHref="/explore"
        />
        <ShowRow
          title="Currently Airing"
          shows={onTheAir.data?.results}
          isLoading={onTheAir.isLoading}
          isError={onTheAir.isError}
          onRetry={() => onTheAir.refetch()}
          viewAllHref="/explore"
        />
      </div>
    </div>
  )
}
