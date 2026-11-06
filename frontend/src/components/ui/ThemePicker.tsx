import { Check } from 'lucide-react'
import { useTheme, THEMES, ThemeId } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateThemePreference } from '@/hooks/useProfile'

export default function ThemePicker() {
  const { theme, setTheme, resetTheme } = useTheme()
  const { user } = useAuth()
  const updateThemePreference = useUpdateThemePreference()

  const handleSelect = (id: ThemeId) => {
    setTheme(id)
    // Persist to the account so the theme follows the user across devices.
    // Guests keep working purely off localStorage (handled by ThemeContext).
    if (user) updateThemePreference.mutate(id)
  }

  const handleReset = () => {
    resetTheme()
    if (user) updateThemePreference.mutate('midnight-blue')
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id as ThemeId)}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 text-left ${
              theme === t.id
                ? 'border-[var(--color-accent)] scale-[1.02]'
                : 'border-transparent hover:border-[var(--color-border)]'
            }`}
            aria-pressed={theme === t.id}
            aria-label={`Switch to ${t.name} theme`}
          >
            {/* Miniature UI preview */}
            <div
              className="h-20 p-2 relative"
              style={{ background: t.palette.bg }}
            >
              {/* Mock nav bar */}
              <div className="flex items-center gap-1 mb-2">
                <div className="w-2.5 h-2.5 rounded-sm flex items-center justify-center" style={{ background: t.palette.accent }}>
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ background: t.palette.bg }} />
                </div>
                <div className="h-1.5 w-8 rounded-full" style={{ background: t.palette.card }} />
                <div className="ml-auto flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: t.palette.card }} />
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: t.palette.card }} />
                </div>
              </div>
              {/* Mock content */}
              <div className="flex gap-1.5">
                {[1,2,3].map(i => (
                  <div key={i} className="flex-1 rounded" style={{ background: t.palette.card, aspectRatio: '2/3', maxHeight: '40px' }}>
                    <div className="w-full h-full rounded" style={{ background: i === 1 ? t.palette.accent + '44' : 'transparent' }} />
                  </div>
                ))}
              </div>
              {/* Active checkmark */}
              {theme === t.id && (
                <div
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: t.palette.accent }}
                >
                  <Check size={11} style={{ color: t.palette.bg }} />
                </div>
              )}
            </div>
            {/* Label */}
            <div
              className="px-3 py-2 border-t"
              style={{ background: t.palette.card, borderColor: t.palette.card }}
            >
              <p className="text-xs font-semibold leading-tight" style={{ color: t.palette.text }}>
                {t.name}
              </p>
            </div>
          </button>
        ))}
      </div>

      {theme !== 'midnight-blue' && (
        <button
          onClick={handleReset}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] underline underline-offset-2 transition-colors"
        >
          Reset to default (Midnight Blue)
        </button>
      )}
    </div>
  )
}
