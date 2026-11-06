import { Router } from 'express'
import { prisma } from '@/config/prisma.js'
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.js'
import { asyncHandler, ApiError } from '@/middleware/errorHandler.js'
import { addWatchlistSchema, updateWatchlistSchema, watchStatusEnum } from '@/validators/index.js'

const router = Router()

router.use(requireAuth)

router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const statusParam = req.query.status
  const status = statusParam ? watchStatusEnum.parse(statusParam) : undefined

  const entries = await prisma.watchlistEntry.findMany({
    where: { userId: req.userId!, ...(status ? { status } : {}) },
    orderBy: { addedAt: 'desc' },
  })
  res.json(entries)
}))

router.post('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { tmdbTvId, status } = addWatchlistSchema.parse(req.body)

  const entry = await prisma.watchlistEntry.upsert({
    where: { userId_tmdbTvId: { userId: req.userId!, tmdbTvId } },
    update: { status: status ?? undefined },
    create: { userId: req.userId!, tmdbTvId, status: status ?? 'plan_to_watch' },
  })
  res.status(201).json(entry)
}))

router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { status } = updateWatchlistSchema.parse(req.body)

  const existing = await prisma.watchlistEntry.findUnique({ where: { id: req.params.id } })
  if (!existing || existing.userId !== req.userId) {
    throw new ApiError(404, 'Watchlist entry not found.')
  }

  const entry = await prisma.watchlistEntry.update({
    where: { id: req.params.id },
    data: { status },
  })
  res.json(entry)
}))

router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.watchlistEntry.findUnique({ where: { id: req.params.id } })
  if (!existing || existing.userId !== req.userId) {
    throw new ApiError(404, 'Watchlist entry not found.')
  }

  await prisma.watchlistEntry.delete({ where: { id: req.params.id } })
  res.status(204).send()
}))

export default router
