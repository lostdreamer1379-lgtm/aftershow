import { Router } from 'express'
import { prisma } from '@/config/prisma.js'
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.js'
import { asyncHandler, ApiError } from '@/middleware/errorHandler.js'
import { upsertHistorySchema, updateHistorySchema } from '@/validators/index.js'

const router = Router()

router.use(requireAuth)

router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const unfinishedOnly = req.query.unfinished === 'true'

  const entries = await prisma.watchHistory.findMany({
    where: { userId: req.userId!, ...(unfinishedOnly ? { completed: false } : {}) },
    orderBy: { lastWatchedAt: 'desc' },
  })
  res.json(entries)
}))

router.post('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const payload = upsertHistorySchema.parse(req.body)

  const entry = await prisma.watchHistory.upsert({
    where: {
      userId_tmdbTvId_seasonNumber_episodeNumber: {
        userId: req.userId!,
        tmdbTvId: payload.tmdbTvId,
        seasonNumber: payload.seasonNumber,
        episodeNumber: payload.episodeNumber,
      },
    },
    update: {
      currentPosition: payload.currentPosition,
      duration: payload.duration ?? undefined,
      completed: payload.completed ?? undefined,
      lastWatchedAt: new Date(),
    },
    create: {
      userId: req.userId!,
      tmdbTvId: payload.tmdbTvId,
      seasonNumber: payload.seasonNumber,
      episodeNumber: payload.episodeNumber,
      currentPosition: payload.currentPosition,
      duration: payload.duration ?? null,
      completed: payload.completed ?? false,
    },
  })
  res.status(201).json(entry)
}))

router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updates = updateHistorySchema.parse(req.body)

  const existing = await prisma.watchHistory.findUnique({ where: { id: req.params.id } })
  if (!existing || existing.userId !== req.userId) {
    throw new ApiError(404, 'History entry not found.')
  }

  const entry = await prisma.watchHistory.update({
    where: { id: req.params.id },
    data: { ...updates, lastWatchedAt: new Date() },
  })
  res.json(entry)
}))

router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.watchHistory.findUnique({ where: { id: req.params.id } })
  if (!existing || existing.userId !== req.userId) {
    throw new ApiError(404, 'History entry not found.')
  }

  await prisma.watchHistory.delete({ where: { id: req.params.id } })
  res.status(204).send()
}))

export default router
