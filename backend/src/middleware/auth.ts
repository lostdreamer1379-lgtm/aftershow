import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/config/supabase.js'

export interface AuthenticatedRequest extends Request {
  userId?: string
  userEmail?: string
}

/**
 * Verifies the Supabase access token from the Authorization header.
 * The authenticated user's ID is derived ONLY from the verified token —
 * never from any client-submitted body or query parameter.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header.' })
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid or expired session.' })
    }

    req.userId = data.user.id
    req.userEmail = data.user.email
    next()
  } catch (err) {
    console.error('[auth] Token verification failed:', err)
    return res.status(401).json({ message: 'Authentication failed.' })
  }
}

/**
 * Optional auth: attaches the user if a valid token is present,
 * but does not block the request if absent. Useful for guest-accessible
 * routes that behave differently when a user is logged in.
 */
export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    const { data } = await supabaseAdmin.auth.getUser(token)
    if (data.user) {
      req.userId = data.user.id
      req.userEmail = data.user.email
    }
  } catch {
    // Ignore — treat as guest
  }

  next()
}
