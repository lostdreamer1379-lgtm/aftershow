import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme, ThemeId, THEMES } from '@/contexts/ThemeContext'
import { useProfile } from '@/hooks/useProfile'

/**
 * Renders nothing. On sign-in, once the user's profile has loaded, applies
 * their saved `preferredTheme` to the app so their theme follows them across
 * devices. Runs once per sign-in — later in-session theme changes are the
 * user's own choice and are persisted the other direction, from ThemePicker
 * up to the backend, not pulled back down here.
 */
export default function ThemeSync() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const { theme, setTheme } = useTheme()
  const syncedForUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!user || !profile) return
    if (syncedForUserId.current === user.id) return

    const savedTheme = profile.preferredTheme as ThemeId
    if (THEMES.some(t => t.id === savedTheme) && savedTheme !== theme) {
      setTheme(savedTheme)
    }
    syncedForUserId.current = user.id
  }, [user, profile, theme, setTheme])

  useEffect(() => {
    if (!user) syncedForUserId.current = null
  }, [user])

  return null
}
