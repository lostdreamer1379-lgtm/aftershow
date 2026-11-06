import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as profileService from '@/services/profileService'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile } from '@/types'

const PROFILE_KEY = ['profile'] as const

export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: profileService.getProfile,
    enabled: Boolean(user),
    staleTime: 1000 * 60,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) => profileService.updateProfile(updates),
    onSuccess: data => {
      queryClient.setQueryData(PROFILE_KEY, data)
    },
  })
}

export function useUpdateThemePreference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (theme: string) => profileService.updateThemePreference(theme),
    onSuccess: data => {
      queryClient.setQueryData(PROFILE_KEY, data)
    },
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (prefs: { autoplayNext?: boolean; preferredLanguage?: string; preferredRegion?: string }) =>
      profileService.updatePreferences(prefs),
    onSuccess: data => {
      queryClient.setQueryData(PROFILE_KEY, data)
    },
  })
}
