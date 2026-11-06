import { Router } from 'express'
import { prisma } from '@/config/prisma.js'
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.js'
import { asyncHandler, ApiError } from '@/middleware/errorHandler.js'
import {
  createCollectionSchema,
  updateCollectionSchema,
  addCollectionShowSchema,
} from '@/validators/index.js'

const router = Router()

router.use(requireAuth)

async function getOwnedCollectionOrThrow(id: string, userId: string) {
  const collection = await prisma.tVCollection.findUnique({ where: { id } })
  if (!collection || collection.userId !== userId) {
    throw new ApiError(404, 'Collection not found.')
  }
  return collection
}

router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const collections = await prisma.tVCollection.findMany({
    where: { userId: req.userId! },
    include: { shows: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(collections)
}))

router.post('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { name, description } = createCollectionSchema.parse(req.body)
  const collection = await prisma.tVCollection.create({
    data: { userId: req.userId!, name, description },
  })
  res.status(201).json(collection)
}))

router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  await getOwnedCollectionOrThrow(req.params.id, req.userId!)
  const collection = await prisma.tVCollection.findUnique({
    where: { id: req.params.id },
    include: { shows: { orderBy: { position: 'asc' } } },
  })
  res.json(collection)
}))

router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updates = updateCollectionSchema.parse(req.body)
  await getOwnedCollectionOrThrow(req.params.id, req.userId!)
  const collection = await prisma.tVCollection.update({
    where: { id: req.params.id },
    data: updates,
  })
  res.json(collection)
}))

router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  await getOwnedCollectionOrThrow(req.params.id, req.userId!)
  await prisma.tVCollection.delete({ where: { id: req.params.id } })
  res.status(204).send()
}))

router.post('/:id/shows', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { tmdbTvId } = addCollectionShowSchema.parse(req.body)
  await getOwnedCollectionOrThrow(req.params.id, req.userId!)

  const existing = await prisma.collectionShow.findUnique({
    where: { collectionId_tmdbTvId: { collectionId: req.params.id, tmdbTvId } },
  })
  if (existing) {
    throw new ApiError(409, 'This series is already in the collection.')
  }

  const count = await prisma.collectionShow.count({ where: { collectionId: req.params.id } })
  const show = await prisma.collectionShow.create({
    data: { collectionId: req.params.id, tmdbTvId, position: count },
  })
  res.status(201).json(show)
}))

router.delete('/:id/shows/:showId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  await getOwnedCollectionOrThrow(req.params.id, req.userId!)

  const show = await prisma.collectionShow.findUnique({ where: { id: req.params.showId } })
  if (!show || show.collectionId !== req.params.id) {
    throw new ApiError(404, 'Show not found in this collection.')
  }

  await prisma.collectionShow.delete({ where: { id: req.params.showId } })
  res.status(204).send()
}))

export default router
