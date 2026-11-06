import { Router } from 'express'
import { tmdbService } from '@/services/tmdbService.js'
import { env } from '@/config/env.js'

const router = Router()

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AFTERSHOW backend',
    timestamp: new Date().toISOString(),
    integrations: {
      tmdbConfigured: tmdbService.isConfigured(),
      supabaseConfigured: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
      databaseConfigured: Boolean(env.databaseUrl),
    },
  })
})

export default router
