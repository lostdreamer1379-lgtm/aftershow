import { z } from 'zod'

export const watchStatusEnum = z.enum(['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'])

export const addWatchlistSchema = z.object({
  tmdbTvId: z.number().int().positive(),
  status: watchStatusEnum.optional(),
})

export const updateWatchlistSchema = z.object({
  status: watchStatusEnum,
})

export const upsertHistorySchema = z.object({
  tmdbTvId: z.number().int().positive(),
  seasonNumber: z.number().int().min(0),
  episodeNumber: z.number().int().min(0),
  currentPosition: z.number().int().min(0),
  duration: z.number().int().positive().nullable().optional(),
  completed: z.boolean().optional(),
})

export const updateHistorySchema = upsertHistorySchema.partial()

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
})

export const updateCollectionSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
})

export const addCollectionShowSchema = z.object({
  tmdbTvId: z.number().int().positive(),
})

export const updateProfileSchema = z.object({
  displayName: z.string().trim().max(100).optional(),
  avatarUrl: z.string().url().optional(),
})

export const updateThemeSchema = z.object({
  theme: z.enum([
    'midnight-blue',
    'cinema-night',
    'noir',
    'burgundy-premiere',
    'forest-cinema',
    'ivory-matinee',
  ]),
})

export const updatePreferencesSchema = z.object({
  autoplayNext: z.boolean().optional(),
  preferredLanguage: z.string().trim().max(10).optional(),
  preferredRegion: z.string().trim().max(10).optional(),
})
