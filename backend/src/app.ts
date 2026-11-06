import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from '@/config/env.js'
import { notFoundHandler, errorHandler } from '@/middleware/errorHandler.js'

import healthRouter from '@/routes/health.js'
import tvRouter from '@/routes/tv.js'
import peopleRouter from '@/routes/people.js'
import profileRouter from '@/routes/profile.js'
import watchlistRouter from '@/routes/watchlist.js'
import historyRouter from '@/routes/history.js'
import collectionsRouter from '@/routes/collections.js'

// This file builds and exports the configured Express app WITHOUT calling
// app.listen(). That makes it usable two ways:
//  - locally / on a traditional Node host, via src/server.ts, which imports
//    this app and starts a long-running listener
//  - on Vercel, via api/index.ts, which imports this same app as a
//    serverless function — Vercel's Node runtime invokes an Express app
//    directly as a request handler, no listener needed
// Keeping the app definition in one place means both paths run identical
// middleware and routes.

const app = express()

// ── Security & parsing middleware ─────────────
app.use(helmet())
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
)
app.use(express.json())

// Apply a general API rate limit. Individual routes may layer stricter
// limits where needed. Note: on Vercel's serverless runtime this counter
// resets per cold start rather than persisting across a long-lived process
// — fine for basic abuse protection, but swap in a shared store (e.g.
// Redis) if you need it enforced consistently across invocations.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)

// ── Routes ─────────────────────────────────────
app.use('/health', healthRouter)
app.use('/api/tv', tvRouter)
app.use('/api/people', peopleRouter)
app.use('/api/profile', profileRouter)
app.use('/api/watchlist', watchlistRouter)
app.use('/api/history', historyRouter)
app.use('/api/collections', collectionsRouter)

// ── Error handling ─────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

export default app
