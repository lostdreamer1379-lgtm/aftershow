import { Router } from 'express'
import { prisma } from '@/config/prisma.js'
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.js'
import { asyncHandler } from '@/middleware/errorHandler.js'
import { updateProfileSchema, updateThemeSchema, updatePreferencesSchema } from '@/validators/index.js'

const router = Router()

router.use(requireAuth)

/** Finds or lazily creates the profile row for the verified user. */
async function getOrCreateProfile(authUserId: string) {
  return prisma.profile.upsert({
    where: { authUserId },
    update: {},
    create: { authUserId },
  })
}

router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const profile = await getOrCreateProfile(req.userId!)
  res.json(profile)
}))

router.put('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updates = updateProfileSchema.parse(req.body)
  await getOrCreateProfile(req.userId!)
  const profile = await prisma.profile.update({
    where: { authUserId: req.userId! },
    data: updates,
  })
  res.json(profile)
}))

router.put('/theme', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { theme } = updateThemeSchema.parse(req.body)
  await getOrCreateProfile(req.userId!)
  const profile = await prisma.profile.update({
    where: { authUserId: req.userId! },
    data: { preferredTheme: theme },
  })
  res.json(profile)
}))

router.put('/preferences', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updates = updatePreferencesSchema.parse(req.body)
  await getOrCreateProfile(req.userId!)
  const profile = await prisma.profile.update({
    where: { authUserId: req.userId! },
    data: updates,
  })
  res.json(profile)
}))

export default router
