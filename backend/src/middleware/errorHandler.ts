import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
    })
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message })
  }

  console.error('[error]', err)
  const message = err instanceof Error ? err.message : 'Internal server error.'
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : message })
}

/** Wraps an async route handler so thrown errors reach errorHandler. */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
