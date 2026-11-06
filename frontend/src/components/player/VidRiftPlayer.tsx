import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize, RotateCcw } from 'lucide-react'
import {
  VIDRIFT_ORIGIN,
  buildVidRiftEmbedUrl,
  validateVidRiftMessage,
  parseProgressPayload,
  parseEpisodePayload,
  sendNextUpInfo,
  sendResume,
  sendPlaybackCommand,
} from '@/lib/vidrift'
import { NextEpisodeInfo } from '@/types'

export interface PartyPlayerCommand {
  id: number
  action: 'play' | 'pause' | 'seek'
  currentTime?: number
}

interface VidRiftPlayerProps {
  tmdbId: number
  season: number
  episode: number
  /** Playback position (seconds) to resume from, if any. */
  resumePosition?: number
  /** The actual next episode, from real TMDB season data — or null at the series finale. */
  nextEpisode: NextEpisodeInfo | null
  onProgress?: (data: { currentTime: number; duration?: number }, source?: 'local' | 'remote') => void
  onPaused?: (source?: 'local' | 'remote') => void
  onUnpaused?: (source?: 'local' | 'remote') => void
  /** Fired when the player reports it internally changed episode (keeps our route in sync). */
  onEpisodeChange?: (season: number, episode: number) => void
  /** Fired when the player signals it's moving to the next episode. */
  onNextUpPlay?: () => void
  partyCommand?: PartyPlayerCommand | null
}

// How long to wait for the very first message from the iframe before
// offering a retry — a genuine load failure (blocked content, dead embed)
// won't ever post anything, but we don't want to claim failure outright
// since the iframe may simply be slow.
const FIRST_MESSAGE_TIMEOUT_MS = 15000

export default function VidRiftPlayer({
  tmdbId,
  season,
  episode,
  resumePosition,
  nextEpisode,
  onProgress,
  onPaused,
  onUnpaused,
  onEpisodeChange,
  onNextUpPlay,
  partyCommand,
}: VidRiftPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasReceivedMessage = useRef(false)
  const hasSentResume = useRef(false)
  const remoteCommandUntil = useRef(0)
  const [slowToLoad, setSlowToLoad] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const embedUrl = buildVidRiftEmbedUrl(tmdbId, season, episode)

  // Reset per-episode guards whenever we switch episodes (this component is
  // also remounted via a `key` by its parent on episode change, but these
  // refs are cheap insurance against any future refactor that keeps it
  // mounted across episodes).
  useEffect(() => {
    hasReceivedMessage.current = false
    hasSentResume.current = false
    setSlowToLoad(false)
  }, [tmdbId, season, episode, retryKey])

  useEffect(() => {
    const win = iframeRef.current?.contentWindow
    if (!win || !partyCommand) return
    remoteCommandUntil.current = Date.now() + 1200
    sendPlaybackCommand(win, partyCommand)
  }, [partyCommand])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!hasReceivedMessage.current) setSlowToLoad(true)
    }, FIRST_MESSAGE_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [tmdbId, season, episode, retryKey])

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const expectedSource = iframeRef.current?.contentWindow ?? null
      const type = validateVidRiftMessage(event, expectedSource)
      if (!type) return // Wrong origin, wrong window, or not a message we recognize — ignore entirely.

      hasReceivedMessage.current = true
      setSlowToLoad(false)

      switch (type) {
        case 'vidrift:state': {
          // The player announcing it's ready. This is our cue to hand it the
          // real next-episode info and, once, a resume position — never
          // before the player has told us it's listening, and never twice.
          const win = iframeRef.current?.contentWindow
          if (!win) break
          sendNextUpInfo(win, nextEpisode)
          if (!hasSentResume.current && resumePosition && resumePosition > 0) {
            sendResume(win, resumePosition)
            hasSentResume.current = true
          }
          break
        }
        case 'vidrift:progress': {
          const payload = parseProgressPayload(event.data)
          if (payload) onProgress?.(payload, remoteCommandUntil.current > Date.now() ? 'remote' : 'local')
          break
        }
        case 'vidrift:paused':
          onPaused?.(remoteCommandUntil.current > Date.now() ? 'remote' : 'local')
          break
        case 'vidrift:unpaused':
          onUnpaused?.(remoteCommandUntil.current > Date.now() ? 'remote' : 'local')
          break
        case 'vidrift:episode': {
          const payload = parseEpisodePayload(event.data)
          if (payload) onEpisodeChange?.(payload.season, payload.episode)
          break
        }
        case 'vidrift:nextup':
          // Informational — the player is showing its own "up next" UI.
          // Nothing for us to do; we already sent it the correct data.
          break
        case 'vidrift:nextup-play':
          onNextUpPlay?.()
          break
      }
    },
    [nextEpisode, resumePosition, onProgress, onPaused, onUnpaused, onEpisodeChange, onNextUpPlay]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  const handleFullscreen = () => {
    containerRef.current?.requestFullscreen?.()
  }

  const handleRetry = () => {
    setRetryKey(k => k + 1)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="player-wrapper rounded-lg overflow-hidden bg-black">
        <iframe
          key={retryKey}
          ref={iframeRef}
          src={embedUrl}
          title={`AFTERSHOW player — S${season}E${episode}`}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          // Intentionally no `sandbox` attribute — VidRift's documented
          // embed requires full iframe capabilities to function.
        />
      </div>

      <button
        onClick={handleFullscreen}
        className="absolute bottom-3 right-3 w-9 h-9 rounded-md bg-black/60 text-white/90 hover:text-white hover:bg-black/80 flex items-center justify-center transition-colors z-10"
        aria-label="Fullscreen"
      >
        <Maximize size={16} />
      </button>

      {slowToLoad && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-center px-6">
          <p className="text-sm text-white/90">
            Still trying to load this episode. The player may be slow to start, or the stream may not be available.
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}
    </div>
  )
}

export { VIDRIFT_ORIGIN }
