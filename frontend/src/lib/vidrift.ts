import { NextEpisodeInfo } from '@/types'

// VidRift is the primary and default playback provider for AFTERSHOW's TV
// episodes. This module is the single source of truth for its embed URL
// format and postMessage protocol — nothing outside VidRiftPlayer should
// construct a VidRift URL or touch window.postMessage for it directly.

export const VIDRIFT_ORIGIN = 'https://embed.vidrift.net'

/**
 * Builds the documented VidRift TV embed URL. tmdbId/season/episode must be
 * the actual TMDB series id, the actual season number, and the actual
 * episode number — never a guessed id, a database row id, or an array index.
 */
export function buildVidRiftEmbedUrl(tmdbId: number, season: number, episode: number): string {
  return `${VIDRIFT_ORIGIN}/embed/tv/${tmdbId}/${season}/${episode}`
}

// ── Incoming messages (from the VidRift iframe to AFTERSHOW) ──────────────

export const VIDRIFT_INCOMING_TYPES = [
  'vidrift:progress',
  'vidrift:paused',
  'vidrift:unpaused',
  'vidrift:episode',
  'vidrift:nextup',
  'vidrift:nextup-play',
  'vidrift:state',
] as const

export type VidRiftIncomingType = (typeof VIDRIFT_INCOMING_TYPES)[number]

const KNOWN_INCOMING_TYPES = new Set<string>(VIDRIFT_INCOMING_TYPES)

export interface VidRiftProgressPayload {
  currentTime: number
  duration?: number
}

export interface VidRiftEpisodePayload {
  season: number
  episode: number
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Validates an incoming MessageEvent against the documented VidRift
 * contract: the origin must be exactly the VidRift embed origin, and (when
 * we have a live reference to compare against) the source must be the
 * specific iframe window we created — never trust a message just because
 * its `type` looks right. Returns the message's `type` string, or null if
 * the event fails any check and must be ignored.
 */
export function validateVidRiftMessage(
  event: MessageEvent,
  expectedSource: Window | null
): VidRiftIncomingType | null {
  if (event.origin !== VIDRIFT_ORIGIN) return null
  if (expectedSource && event.source !== expectedSource) return null
  if (!event.data || typeof event.data !== 'object') return null
  const type = (event.data as { type?: unknown }).type
  if (typeof type !== 'string' || !KNOWN_INCOMING_TYPES.has(type)) return null
  return type as VidRiftIncomingType
}

/** Parses a vidrift:progress payload, rejecting anything without a valid numeric currentTime. */
export function parseProgressPayload(data: unknown): VidRiftProgressPayload | null {
  const d = data as Record<string, unknown> | null
  if (!d || !isFiniteNumber(d.currentTime)) return null
  return {
    currentTime: d.currentTime,
    duration: isFiniteNumber(d.duration) ? d.duration : undefined,
  }
}

/** Parses a vidrift:episode payload (the player reporting its own internal episode change). */
export function parseEpisodePayload(data: unknown): VidRiftEpisodePayload | null {
  const d = data as Record<string, unknown> | null
  if (!d || !isFiniteNumber(d.season) || !isFiniteNumber(d.episode)) return null
  if (d.season < 0 || d.episode < 1) return null
  return { season: d.season, episode: d.episode }
}

// ── Outgoing messages (from AFTERSHOW to the VidRift iframe) ──────────────
// Always sent to the exact VidRift origin — never '*' — and only via the
// specific iframe's own contentWindow.

export function sendNextUpInfo(target: Window, next: NextEpisodeInfo | null) {
  target.postMessage({ type: 'vidrift:nextup-info', next }, VIDRIFT_ORIGIN)
}

export function sendResume(target: Window, currentTime: number) {
  target.postMessage({ type: 'vidrift:resume', currentTime }, VIDRIFT_ORIGIN)
}
