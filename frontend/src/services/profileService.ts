import { apiClient } from '@/lib/api'
import { UserProfile } from '@/types'

export const getProfile = () =>
  apiClient.get<UserProfile>('/profile').then(r => r.data)

export const updateProfile = (updates: Partial<UserProfile>) =>
  apiClient.put<UserProfile>('/profile', updates).then(r => r.data)

export const updateThemePreference = (theme: string) =>
  apiClient.put<UserProfile>('/profile/theme', { theme }).then(r => r.data)

export const updatePreferences = (preferences: {
  autoplayNext?: boolean
  preferredLanguage?: string
  preferredRegion?: string
}) =>
  apiClient.put<UserProfile>('/profile/preferences', preferences).then(r => r.data)
