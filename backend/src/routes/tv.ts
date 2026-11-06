import { Router } from 'express'
import { tmdbService } from '@/services/tmdbService.js'
import { asyncHandler, ApiError } from '@/middleware/errorHandler.js'

const router = Router()

// TV catalog responses are public and change relatively slowly. This lets
// Vercel serve repeat visits from its edge cache instead of waking a new
// serverless function and waiting for TMDB on every request.
router.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  }
  next()
})

function requireTmdbConfigured() {
  if (!tmdbService.isConfigured()) {
    throw new ApiError(503, 'TMDB integration is not configured. Set TMDB_API_READ_ACCESS_TOKEN.')
  }
}

// ── Discovery ─────────────────────────────────

router.get('/trending', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get('/trending/tv/week', { page: req.query.page || 1 })
  res.json(data)
}))

router.get('/popular', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get('/tv/popular', { page: req.query.page || 1 })
  res.json(data)
}))

router.get('/top-rated', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get('/tv/top_rated', { page: req.query.page || 1 })
  res.json(data)
}))

router.get('/airing-today', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get('/tv/airing_today', { page: req.query.page || 1 })
  res.json(data)
}))

router.get('/on-the-air', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get('/tv/on_the_air', { page: req.query.page || 1 })
  res.json(data)
}))

router.get('/search', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  res.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
  const { query, page } = req.query
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new ApiError(400, 'A "query" parameter is required.')
  }
  // Search results change too often to cache for long; short TTL only.
  const data = await tmdbService.get('/search/tv', { query, page: page || 1 }, 30 * 1000)
  res.json(data)
}))

// Genre list — used to populate Explore's genre filter.
router.get('/genres', asyncHandler(async (_req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get('/genre/tv/list', undefined, 60 * 60 * 1000)
  res.json(data)
}))

router.get('/discover', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  // Pass through TMDB's documented discover/tv query parameters as-is
  // (with_genres, first_air_date_year, sort_by, with_original_language,
  // vote_average.gte, with_networks, with_watch_providers, watch_region,
  // page, etc.) — the Explore page composes these from its filter state.
  const data = await tmdbService.get('/discover/tv', req.query as Record<string, unknown>, 60 * 1000)
  res.json(data)
}))

// ── Show Details ──────────────────────────────

router.get('/:id', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get(`/tv/${req.params.id}`, {
    append_to_response: 'videos,credits,watch/providers',
  })
  res.json(data)
}))

router.get('/:id/recommendations', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get(`/tv/${req.params.id}/recommendations`, { page: req.query.page || 1 })
  res.json(data)
}))

router.get('/:id/similar', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const data = await tmdbService.get(`/tv/${req.params.id}/similar`, { page: req.query.page || 1 })
  res.json(data)
}))

// ── Seasons ───────────────────────────────────

router.get('/:id/seasons/:season', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const { id, season } = req.params
  const data = await tmdbService.get(`/tv/${id}/season/${season}`)
  res.json(data)
}))

// ── Episodes ──────────────────────────────────

router.get('/:id/seasons/:season/episodes/:episode', asyncHandler(async (req, res) => {
  requireTmdbConfigured()
  const { id, season, episode } = req.params
  const data = await tmdbService.get(`/tv/${id}/season/${season}/episode/${episode}`, {
    append_to_response: 'credits',
  })
  res.json(data)
}))

export default router
