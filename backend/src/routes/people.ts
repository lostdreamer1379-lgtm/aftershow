import { Router } from 'express'
import { tmdbService } from '@/services/tmdbService.js'
import { asyncHandler, ApiError } from '@/middleware/errorHandler.js'

const router = Router()

router.get('/:id', asyncHandler(async (req, res) => {
  if (!tmdbService.isConfigured()) {
    throw new ApiError(503, 'TMDB integration is not configured. Set TMDB_API_READ_ACCESS_TOKEN.')
  }
  const data = await tmdbService.get(`/person/${req.params.id}`, { append_to_response: 'tv_credits' })
  res.json(data)
}))

export default router
