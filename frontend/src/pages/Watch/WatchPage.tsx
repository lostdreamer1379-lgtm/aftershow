import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronDown, ArrowLeft, Play, Check, Users, Copy, MessageCircle, X } from 'lucide-react'
import VidRiftPlayer, { type PartyPlayerCommand } from '@/components/player/VidRiftPlayer'
import ErrorState from '@/components/ui/ErrorState'
import { useShowDetails, useSeasonDetails } from '@/hooks/useTV'
import { useHistory, useUpsertProgress } from '@/hooks/useHistory'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { getAdjacentEpisodes } from '@/lib/episodeNav'
import { getStillUrl } from '@/lib/tmdb-image'
import { NextEpisodeInfo } from '@/types'
import { useWatchParty, type WatchPartyPlayback } from '@/hooks/useWatchParty'

export default function WatchPage() {
  const { id, season, episode } = useParams<{ id: string; season: string; episode: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const showId = id ? parseInt(id, 10) : undefined
  const seasonNumber = season !== undefined ? parseInt(season, 10) : undefined
  const episodeNumber = episode !== undefined ? parseInt(episode, 10) : undefined

  const { data: show, isLoading: showLoading, isError: showError, refetch: refetchShow } = useShowDetails(showId)
  const { data: seasonData, isLoading: seasonLoading } = useSeasonDetails(showId, seasonNumber)
  const { data: profile } = useProfile()
  const { data: historyEntries } = useHistory()
  const upsertProgress = useUpsertProgress()
  const partyRoomId = searchParams.get('party')
  const partyQuery = partyRoomId ? `?party=${encodeURIComponent(partyRoomId)}` : ''
  const watchUrl = (s: number, e: number, tmdbId = showId) => `/watch/tv/${tmdbId}/${s}/${e}${partyQuery}`
  const [partyCommand, setPartyCommand] = useState<PartyPlayerCommand | null>(null)
  const [chatText, setChatText] = useState('')
  const partyCommandIdRef = useRef(0)
  const lastPartyBroadcastRef = useRef(0)
  const [episodesOpen, setEpisodesOpen] = useState(true)
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false)
  const seasonMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeSeasonMenu = (event: MouseEvent) => {
      if (!seasonMenuRef.current?.contains(event.target as Node)) setSeasonMenuOpen(false)
    }
    document.addEventListener('mousedown', closeSeasonMenu)
    return () => document.removeEventListener('mousedown', closeSeasonMenu)
  }, [])

  // Default to autoplay-on for guests (matches the backend's own default);
  // signed-in users get their saved preference once the profile loads.
  const autoplayNext = profile?.autoplayNext ?? true

  const { nextTarget, prevTarget, isSeriesFinale } = getAdjacentEpisodes(
    show,
    seasonData?.episodes,
    seasonNumber,
    episodeNumber
  )

  // If the next episode crosses into a season we don't already have loaded,
  // fetch just that season so we can show its real title/still — never a
  // guessed one.
  const crossesSeasonBoundary = Boolean(nextTarget && nextTarget.season !== seasonNumber)
  const { data: nextSeasonData } = useSeasonDetails(showId, crossesSeasonBoundary ? nextTarget!.season : undefined)

  const nextEpisodeInfo: NextEpisodeInfo | null = useMemo(() => {
    if (!nextTarget) return null
    const source = crossesSeasonBoundary ? nextSeasonData?.episodes : seasonData?.episodes
    const match = source?.find(e => e.episode_number === nextTarget.episode)
    return {
      season: nextTarget.season,
      episode: nextTarget.episode,
      name: match?.name ?? `Episode ${nextTarget.episode}`,
      still: match?.still_path ? getStillUrl(match.still_path, 'w300') : null,
    }
  }, [nextTarget, crossesSeasonBoundary, nextSeasonData, seasonData])

  const currentEpisode = seasonData?.episodes?.find(e => e.episode_number === episodeNumber)

  const existingEntry = historyEntries?.find(
    h => h.tmdbTvId === showId && h.seasonNumber === seasonNumber && h.episodeNumber === episodeNumber
  )
  const resumePosition = existingEntry && !existingEntry.completed ? existingEntry.currentPosition : undefined

  const handlePartyPlayback = useCallback((message: WatchPartyPlayback) => {
    if (message.type === 'episode') {
      if (message.tmdbId === showId && (message.season !== seasonNumber || message.episode !== episodeNumber)) {
        navigate(watchUrl(message.season, message.episode, message.tmdbId), { replace: true })
      }
      return
    }
    if (message.type !== 'playback' || message.tmdbId !== showId || message.season !== seasonNumber || message.episode !== episodeNumber || !message.action) return
    partyCommandIdRef.current += 1
    setPartyCommand({ id: partyCommandIdRef.current, action: message.action, currentTime: message.currentTime })
  }, [episodeNumber, navigate, partyQuery, seasonNumber, showId])

  const party = useWatchParty({
    roomId: partyRoomId,
    userId: user?.id,
    displayName: profile?.displayName || user?.email?.split('@')[0] || 'Guest',
    onPlayback: handlePartyPlayback,
  })

  const createParty = () => {
    const roomId = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
    const next = new URLSearchParams(searchParams)
    next.set('party', roomId)
    setSearchParams(next)
  }

  const leaveParty = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('party')
    setSearchParams(next)
    setChatText('')
  }

  const copyPartyInvite = async () => {
    await navigator.clipboard?.writeText(window.location.href)
  }

  // ── Progress persistence ──────────────────────
  // vidrift:progress fires frequently; we throttle actual writes to the
  // backend and always flush on pause and on leaving the episode, so
  // progress is never lost to the throttle window.
  const latestProgressRef = useRef<{ currentTime: number; duration?: number } | null>(null)
  const lastSavedAtRef = useRef(0)
  const [manualNextPrompt, setManualNextPrompt] = useState(false)

  const saveProgress = useCallback(
    (data: { currentTime: number; duration?: number }, completedOverride?: boolean) => {
      if (!user || !showId || seasonNumber === undefined || episodeNumber === undefined) return
      const completed = completedOverride ?? (data.duration ? data.currentTime / data.duration >= 0.9 : false)
      upsertProgress.mutate({
        tmdbTvId: showId,
        seasonNumber,
        episodeNumber,
        currentPosition: Math.floor(data.currentTime),
        duration: data.duration ? Math.floor(data.duration) : undefined,
        completed,
      })
    },
    [user, showId, seasonNumber, episodeNumber, upsertProgress]
  )

  const saveProgressRef = useRef(saveProgress)

  // Keep the cleanup callback current without making the cleanup effect itself
  // rerun whenever the React Query mutation changes state.
  useEffect(() => {
    saveProgressRef.current = saveProgress
  }, [saveProgress])

  const handleProgress = useCallback(
    (data: { currentTime: number; duration?: number }, source: 'local' | 'remote' = 'local') => {
      latestProgressRef.current = data
      const now = Date.now()
      if (now - lastSavedAtRef.current > 15000) {
        lastSavedAtRef.current = now
        saveProgress(data)
      }
      if (source === 'local' && partyRoomId && now - lastPartyBroadcastRef.current > 2000) {
        lastPartyBroadcastRef.current = now
        party.sendPlayback({ type: 'playback', tmdbId: showId!, season: seasonNumber!, episode: episodeNumber!, action: 'seek', currentTime: data.currentTime, duration: data.duration })
      }
    },
    [episodeNumber, party, partyRoomId, saveProgress, seasonNumber, showId]
  )

  const handlePaused = useCallback((source: 'local' | 'remote' = 'local') => {
    if (latestProgressRef.current) saveProgress(latestProgressRef.current)
    if (source === 'local' && partyRoomId) {
      party.sendPlayback({ type: 'playback', tmdbId: showId!, season: seasonNumber!, episode: episodeNumber!, action: 'pause', currentTime: latestProgressRef.current?.currentTime })
    }
  }, [episodeNumber, party, partyRoomId, saveProgress, seasonNumber, showId])

  const handleUnpaused = useCallback((source: 'local' | 'remote' = 'local') => {
    if (source === 'local' && partyRoomId) {
      party.sendPlayback({ type: 'playback', tmdbId: showId!, season: seasonNumber!, episode: episodeNumber!, action: 'play', currentTime: latestProgressRef.current?.currentTime })
    }
  }, [episodeNumber, party, partyRoomId, seasonNumber, showId])

  // Flush whatever progress we have whenever the episode changes or the
  // page unmounts, so a quick switch or navigating away never loses it.
  useEffect(() => {
    return () => {
      if (latestProgressRef.current) saveProgressRef.current(latestProgressRef.current)
    }
  }, [showId, seasonNumber, episodeNumber])

  useEffect(() => {
    if (partyRoomId && party.connected && showId && seasonNumber !== undefined && episodeNumber !== undefined) {
      party.sendPlayback({ type: 'episode', tmdbId: showId, season: seasonNumber, episode: episodeNumber })
    }
  }, [episodeNumber, party.connected, partyRoomId, party.sendPlayback, seasonNumber, showId])

  useEffect(() => {
    // Reset per-episode local state when the URL's episode changes.
    latestProgressRef.current = null
    lastSavedAtRef.current = 0
    setPartyCommand(null)
    setManualNextPrompt(false)
  }, [showId, seasonNumber, episodeNumber])

  const handleEpisodeChangeFromPlayer = useCallback(
    (s: number, e: number) => {
      if (s !== seasonNumber || e !== episodeNumber) {
        navigate(watchUrl(s, e), { replace: true })
      }
    },
    [seasonNumber, episodeNumber, partyQuery, showId, navigate]
  )

  const handleNextUpPlay = useCallback(() => {
    // The player has determined this episode is finished — record it as
    // completed regardless of the autoplay preference, since the user did
    // in fact finish watching it.
    if (latestProgressRef.current) saveProgress(latestProgressRef.current, true)
    else saveProgress({ currentTime: 0 }, true)

    if (!nextTarget) return
    if (autoplayNext) {
      navigate(watchUrl(nextTarget.season, nextTarget.episode))
    } else {
      setManualNextPrompt(true)
    }
  }, [nextTarget, autoplayNext, partyQuery, showId, navigate, saveProgress])

  if (showLoading || seasonLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="skeleton aspect-video w-full rounded-lg" />
        <div className="skeleton h-6 w-1/2" />
      </div>
    )
  }

  if (showError || !show || !showId || seasonNumber === undefined || episodeNumber === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <ErrorState title="Can't play this episode" message="We couldn't load the series or episode data needed for playback." retry={() => refetchShow()} />
      </div>
    )
  }

  const seasonOptions = (show.seasons ?? [])
    .filter(s => s.season_number >= 0)
    .map(s => ({ value: String(s.season_number), label: s.name }))

  return (
    <div className={`mx-auto ${episodesOpen ? 'max-w-7xl' : 'max-w-[1600px]'} px-4 sm:px-6 lg:px-8 py-6`}>
      <Link
        to={`/tv/${show.id}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-4"
      >
        <ArrowLeft size={16} /> {show.name}
      </Link>

      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => setEpisodesOpen(open => !open)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-expanded={episodesOpen}
          aria-controls="watch-episodes-sidebar"
        >
          {episodesOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {episodesOpen ? 'Theater mode' : 'Show episodes'}
        </button>
      </div>

      <div className={`watch-layout ${episodesOpen ? '' : 'is-theater'}`}>
        {/* Main column */}
        <div>
          <VidRiftPlayer
            key={`${showId}-${seasonNumber}-${episodeNumber}`}
            tmdbId={showId}
            season={seasonNumber}
            episode={episodeNumber}
            resumePosition={resumePosition}
            nextEpisode={nextEpisodeInfo}
            onProgress={handleProgress}
            onPaused={handlePaused}
            onUnpaused={handleUnpaused}
            onEpisodeChange={handleEpisodeChangeFromPlayer}
            onNextUpPlay={handleNextUpPlay}
            partyCommand={partyCommand}
          />

          <section className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            {!partyRoomId ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-[var(--color-accent-subtle)] p-2 text-[var(--color-accent)]"><Users size={17} /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Watch together</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Sync playback and chat with friends in a private room.</p>
                  </div>
                </div>
                {user ? (
                  <button type="button" onClick={createParty} className="rounded-md bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-[var(--color-bg-primary)] hover:bg-[var(--color-accent-hover)] transition-colors">
                    Start watch party
                  </button>
                ) : (
                  <Link to="/login" className="text-xs text-[var(--color-accent)] hover:underline">Sign in to start</Link>
                )}
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-[var(--color-accent-subtle)] p-2 text-[var(--color-accent)]"><MessageCircle size={17} /></div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">Watch party</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{party.connected ? `${party.participantCount} participant${party.participantCount === 1 ? '' : 's'} online` : 'Connecting…'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={copyPartyInvite} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"><Copy size={13} /> Copy invite</button>
                    <button type="button" onClick={leaveParty} aria-label="Close watch party" className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)] transition-colors"><X size={15} /></button>
                  </div>
                </div>

                <div className="mt-4 max-h-48 space-y-2 overflow-y-auto rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/40 p-3">
                  {party.messages.length === 0 ? (
                    <p className="py-5 text-center text-xs text-[var(--color-text-muted)]">Room chat is ready. Say hello.</p>
                  ) : party.messages.map(message => (
                    <div key={message.id}>
                      <span className="text-xs font-medium text-[var(--color-accent)]">{message.senderName}</span>
                      <p className="text-sm text-[var(--color-text-secondary)] break-words">{message.text}</p>
                    </div>
                  ))}
                </div>

                <form
                  className="mt-3 flex gap-2"
                  onSubmit={event => {
                    event.preventDefault()
                    party.sendChat(chatText)
                    setChatText('')
                  }}
                >
                  <input
                    value={chatText}
                    onChange={event => setChatText(event.target.value)}
                    placeholder="Send a message…"
                    maxLength={500}
                    className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                  />
                  <button type="submit" disabled={!party.connected || !chatText.trim()} className="rounded-md bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-[var(--color-bg-primary)] disabled:cursor-not-allowed disabled:opacity-40">Send</button>
                </form>
              </div>
            )}
          </section>

          {manualNextPrompt && nextEpisodeInfo && (
            <div className="mt-4 flex items-center gap-4 p-4 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-subtle)]">
              {nextEpisodeInfo.still && (
                <img src={nextEpisodeInfo.still} alt={nextEpisodeInfo.name} className="w-24 aspect-video object-cover rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Up next</p>
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  S{nextEpisodeInfo.season}E{nextEpisodeInfo.episode} · {nextEpisodeInfo.name}
                </p>
              </div>
              <button
                onClick={() => navigate(watchUrl(nextEpisodeInfo.season, nextEpisodeInfo.episode))}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-[var(--color-bg-primary)] hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                <Play size={14} fill="currentColor" /> Play
              </button>
            </div>
          )}

          <div className="mt-5">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[var(--color-accent)] font-semibold text-sm">S{seasonNumber}E{episodeNumber}</span>
              <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
                {currentEpisode?.name ?? show.name}
              </h1>
            </div>
            {currentEpisode?.overview && (
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">{currentEpisode.overview}</p>
            )}
            {!user && (
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                Sign in to save your progress and pick up where you left off.
              </p>
            )}

            {/* Prev / next */}
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
              {prevTarget ? (
                <button
                  onClick={() => navigate(watchUrl(prevTarget.season, prevTarget.episode))}
                  className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
              ) : <span />}

              {nextTarget ? (
                <button
                  onClick={() => navigate(watchUrl(nextTarget.season, nextTarget.episode))}
                  className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Next Episode <ChevronRight size={16} />
                </button>
              ) : isSeriesFinale ? (
                <span className="text-sm text-[var(--color-text-muted)]">End of series</span>
              ) : <span />}
            </div>
          </div>
        </div>

        {/* Sidebar: season selector + episode list */}
        <aside
          id="watch-episodes-sidebar"
          className={`watch-sidebar ${episodesOpen ? '' : 'is-collapsed'}`}
          aria-hidden={!episodesOpen}
        >
          {seasonOptions.length > 1 && (
            <div className="relative mb-4" ref={seasonMenuRef}>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Season</p>
              <button
                type="button"
                onClick={() => setSeasonMenuOpen(open => !open)}
                className={`flex h-11 w-full items-center justify-between rounded-lg border px-3.5 text-left text-sm transition-all duration-200 ${
                  seasonMenuOpen
                    ? 'border-[var(--color-accent)] bg-[var(--color-bg-elevated)] shadow-[0_0_0_3px_var(--color-accent-subtle)]'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-card-hover)]'
                }`}
                aria-haspopup="listbox"
                aria-expanded={seasonMenuOpen}
              >
                <span className="font-medium text-[var(--color-text-primary)]">
                  {seasonOptions.find(option => option.value === String(seasonNumber))?.label ?? `Season ${seasonNumber}`}
                </span>
                <ChevronDown size={17} className={`text-[var(--color-text-muted)] transition-transform duration-200 ${seasonMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute left-0 right-0 top-[calc(100%+8px)] z-30 origin-top rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1.5 shadow-2xl transition-all duration-200 ${
                  seasonMenuOpen ? 'pointer-events-auto scale-y-100 opacity-100' : 'pointer-events-none scale-y-95 opacity-0'
                }`}
                role="listbox"
                aria-label="Select season"
              >
                {seasonOptions.map(option => {
                  const selected = option.value === String(seasonNumber)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        setSeasonMenuOpen(false)
                        navigate(watchUrl(Number(option.value), 1))
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                        selected
                          ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      {option.label}
                      {selected && <Check size={15} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {(seasonData?.episodes ?? []).map(ep => {
              const isCurrent = ep.episode_number === episodeNumber
              const watched = historyEntries?.some(
                h => h.tmdbTvId === showId && h.seasonNumber === seasonNumber && h.episodeNumber === ep.episode_number && h.completed
              )
              return (
                <button
                  key={ep.id}
                  onClick={() => navigate(watchUrl(seasonNumber, ep.episode_number))}
                  className={`w-full flex gap-3 p-2 rounded-md text-left transition-colors ${
                    isCurrent ? 'bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]' : 'hover:bg-[var(--color-bg-card)] border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0 w-20 aspect-video rounded overflow-hidden bg-[var(--color-bg-card)]">
                    <img src={getStillUrl(ep.still_path, 'w185')} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate ${isCurrent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
                      {ep.episode_number}. {ep.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">{ep.overview || 'No overview'}</p>
                  </div>
                  {watched && <Check size={14} className="text-[var(--color-success)] flex-shrink-0 mt-0.5" />}
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
