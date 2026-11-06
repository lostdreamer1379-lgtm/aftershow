import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile, useUpdatePreferences } from '@/hooks/useProfile'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/hooks/useToast'
import { PreferencesFormValues } from '@/lib/authValidation'

const LANGUAGE_OPTIONS = [
  { value: '', label: 'No preference' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
]

const REGION_OPTIONS = [
  { value: '', label: 'No preference' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'IN', label: 'India' },
]

export default function SettingsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<Settings size={22} />}
          title="Sign in to manage settings"
          description="Autoplay, language and region preferences are saved to your account."
          action={{ label: 'Sign in', onClick: () => { window.location.href = '/login' } }}
        />
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Looking for themes? They work for guests too, under{' '}
          <Link to="/profile" className="text-[var(--color-accent)] hover:underline">
            Profile → Appearance &amp; Themes
          </Link>
          .
        </p>
      </div>
    )
  }

  return <AuthenticatedSettings />
}

function AuthenticatedSettings() {
  const toast = useToast()
  const { data: profile, isLoading } = useProfile()
  const updatePreferences = useUpdatePreferences()

  const { control, handleSubmit, reset, watch, setValue } = useForm<PreferencesFormValues>({
    defaultValues: { autoplayNext: true, preferredLanguage: '', preferredRegion: '' },
  })

  useEffect(() => {
    if (profile) {
      reset({
        autoplayNext: profile.autoplayNext,
        preferredLanguage: profile.preferredLanguage ?? '',
        preferredRegion: profile.preferredRegion ?? '',
      })
    }
  }, [profile, reset])

  const autoplayNext = watch('autoplayNext')

  const onSubmit = async (values: PreferencesFormValues) => {
    try {
      await updatePreferences.mutateAsync(values)
      toast.success('Preferences saved')
    } catch {
      toast.error('Could not save preferences')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text-primary)] mb-1">Settings</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Viewing preferences for your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Autoplay next episode</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Automatically continue to the next episode when one finishes.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoplayNext}
            aria-label="Autoplay next episode"
            onClick={() => setValue('autoplayNext', !autoplayNext, { shouldDirty: true })}
            className="relative h-7 w-12 flex-shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
            style={{ background: autoplayNext ? 'var(--color-accent)' : 'var(--color-border)' }}
          >
            <span
              className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: autoplayNext ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>

        <Controller
          control={control}
          name="preferredLanguage"
          render={({ field }) => (
            <Select label="Preferred content language" options={LANGUAGE_OPTIONS} {...field} />
          )}
        />

        <Controller
          control={control}
          name="preferredRegion"
          render={({ field }) => (
            <Select label="Preferred region (for watch providers)" options={REGION_OPTIONS} {...field} />
          )}
        />

        <Button type="submit" variant="primary" loading={updatePreferences.isPending}>
          Save preferences
        </Button>
      </form>
    </div>
  )
}
