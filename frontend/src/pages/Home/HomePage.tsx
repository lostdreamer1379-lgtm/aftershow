import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [secondaryRowsReady, setSecondaryRowsReady] = useState(false)

  // Let the hero and first row become interactive before competing for the
  // connection with four more TMDB requests.
  useEffect(() => {
    const timer = window.setTimeout(() => setSecondaryRowsReady(true), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const popular = usePopular(1, secondaryRowsReady)
  const topRated = useTopRated(1, secondaryRowsReady)
  const airingToday = useAiringToday(1, secondaryRowsReady)
  const onTheAir = useOnTheAir(1, secondaryRowsReady)

  const heroShows = trending.data?.results ?? []
  const [heroIndex, setHeroIndex] = useState(0)
  const [isManualSpinning, setIsManualSpinning] = useState(false)
  const autoResumeAtRef = useRef(0)
  const spinTimerRef = useRef<number | null>(null)
  const swipeRef = useRef({ startX: 0, lastX: 0, lastTime: 0, velocity: 0 })

  // Keep the selected hero inside the current result set when fresh TMDB data
  // arrives or the result count changes.
  useEffect(() => {
    setHeroIndex(index => heroShows.length ? index % heroShows.length : 0)
  }, [heroShows.length])

  // State one: rotate calmly on its own. After a manual spin this timeout is
  // naturally delayed by autoResumeAtRef, keeping autoplay paused for 10s.
  useEffect(() => {
    if (isManualSpinning || heroShows.length < 2) return
    const wait = Math.max(6500, autoResumeAtRef.current - Date.now())
    const timer = window.setTimeout(() => {
      setHeroIndex(index => (index + 1) % heroShows.length)
    }, wait)
    return () => window.clearTimeout(timer)
  }, [heroIndex, heroShows.length, isManualSpinning])

  useEffect(() => {
    return () => {
      if (spinTimerRef.current !== null) window.clearTimeout(spinTimerRef.current)
    }
  }, [])

  const featured = useMemo(() => heroShows[heroIndex], [heroShows, heroIndex])

  const runManualSpin = (direction: 1 | -1, velocity: number, requestedSteps?: number) => {
    if (heroShows.length < 2 || isManualSpinning) return
    setIsManualSpinning(true)

    let remaining = requestedSteps ?? Math.min(14, Math.max(6, Math.round(velocity * 9)))
    let delay = 65

    const advance = () => {
      setHeroIndex(index => (index + direction + heroShows.length) % heroShows.length)
      remaining -= 1
      if (remaining <= 0) {
        autoResumeAtRef.current = Date.now() + 10000
        setIsManualSpinning(false)
        spinTimerRef.current = null
        return
      }
      delay = Math.min(520, delay * 1.24)
      spinTimerRef.current = window.setTimeout(advance, delay)
    }

    advance()
  }

  const navigateToHero = (targetIndex: number) => {
    if (heroShows.length < 2 || isManualSpinning || targetIndex === heroIndex) return

    const forwardSteps = (targetIndex - heroIndex + heroShows.length) % heroShows.length
    const backwardSteps = (heroIndex - targetIndex + heroShows.length) % heroShows.length
    const direction: 1 | -1 = forwardSteps <= backwardSteps ? 1 : -1
    runManualSpin(direction, 0.55, Math.min(forwardSteps, backwardSteps))
  }

  const handleHeroPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (isManualSpinning) return
    event.currentTarget.setPointerCapture(event.pointerId)
    swipeRef.current = { startX: event.clientX, lastX: event.clientX, lastTime: performance.now(), velocity: 0 }
  }

  const handleHeroPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || isManualSpinning) return
    const now = performance.now()
    const elapsed = Math.max(1, now - swipeRef.current.lastTime)
    swipeRef.current.velocity = Math.abs(event.clientX - swipeRef.current.lastX) / elapsed
    swipeRef.current.lastX = event.clientX
    swipeRef.current.lastTime = now
  }

  const handleHeroPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    const distance = event.clientX - swipeRef.current.startX
    const speed = Math.max(swipeRef.current.velocity, Math.abs(distance) / 240)
    if (Math.abs(distance) > 36 && speed > 0.18) {
      runManualSpin(distance < 0 ? 1 : -1, speed)
    }
  }

  const timeMessage = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 5) return { greeting: 'Still up?', message: 'There is always time for one more episode.' }
    if (hour < 12) return { greeting: 'Good morning', message: 'Start the day with a story worth settling into.' }
    if (hour < 18) return { greeting: 'Good afternoon', message: 'Take a little time out for something worth watching.' }
    return { greeting: 'Good evening', message: 'The night’s best viewing starts right here.' }
  }, [])

  return (
    <div>
      {/* Cinematic hero */}
      <section
        className="relative h-[64vh] min-h-[460px] w-full overflow-hidden flex items-end select-none touch-pan-y"
        onPointerDown={handleHeroPointerDown}
        onPointerMove={handleHeroPointerMove}
        onPointerUp={handleHeroPointerUp}
        onPointerCancel={handleHeroPointerUp}
      >
        {featured?.backdrop_path ? (
          <img
            key={featured.id}
            src={getBackdropUrl(featured.backdrop_path, 'w1280')}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            fetchPriority="high"
            decoding="async"
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
          {!isManualSpinning && <>
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
          </>}
        </div>

        {heroShows.length > 1 && (
          <nav
            aria-label="Featured series"
            className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-md"
          >
            {heroShows.map((show, index) => (
              <button
                key={show.id}
                type="button"
                aria-label={`Show ${index + 1}: ${show.name}`}
                aria-current={index === heroIndex ? 'true' : undefined}
                disabled={isManualSpinning}
                onPointerDown={event => event.stopPropagation()}
                onClick={() => navigateToHero(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out disabled:cursor-wait ${
                  index === heroIndex
                    ? 'w-8 bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]'
                    : 'w-1.5 bg-white/45 hover:bg-white/80'
                }`}
              />
            ))}
          </nav>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Continue Watching */}
        <section className="mb-10">
          <div className="mb-5 border-l-2 border-[var(--color-accent)] pl-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] font-medium mb-1">
              {timeMessage.greeting}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">{timeMessage.message}</p>
          </div>
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
          isLoading={!secondaryRowsReady || popular.isLoading}
          isError={popular.isError}
          onRetry={() => popular.refetch()}
          viewAllHref="/explore"
        />
        <ShowRow
          title="Top Rated"
          shows={topRated.data?.results}
          isLoading={!secondaryRowsReady || topRated.isLoading}
          isError={topRated.isError}
          onRetry={() => topRated.refetch()}
          viewAllHref="/explore"
        />
        <ShowRow
          title="Airing Today"
          shows={airingToday.data?.results}
          isLoading={!secondaryRowsReady || airingToday.isLoading}
          isError={airingToday.isError}
          onRetry={() => airingToday.refetch()}
          viewAllHref="/explore"
        />
        <ShowRow
          title="Currently Airing"
          shows={onTheAir.data?.results}
          isLoading={!secondaryRowsReady || onTheAir.isLoading}
          isError={onTheAir.isError}
          onRetry={() => onTheAir.refetch()}
          viewAllHref="/explore"
        />
      </div>
    </div>
  )
}
