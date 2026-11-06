import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, LogOut, Pencil, Check, X, Clock3, Film, CheckCircle2, Play } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { profileSchema, ProfileFormValues } from '@/lib/authValidation'
import ThemePicker from '@/components/ui/ThemePicker'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/hooks/useToast'
import { useHistory } from '@/hooks/useHistory'
import { useShowsByIds } from '@/hooks/useShowsByIds'

export default function ProfilePage() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<User size={22} />}
          title="Sign in to view your profile"
          description="Account details and viewing stats are available once you're signed in."
          action={{ label: 'Sign in', onClick: () => { window.location.href = '/login' } }}
        />
        <div className="max-w-2xl mx-auto mt-10">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-1">Appearance & Themes</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-5">
            Your theme choice works right away as a guest, saved on this device.
            Sign in later and it will carry over to your account.
          </p>
          <ThemePicker />
        </div>
      </div>
    )
  }

  return <AuthenticatedProfile userEmail={user.email ?? ''} userId={user.id} onSignOut={signOut} />
}

function AuthenticatedProfile({ userEmail, userId, onSignOut }: { userEmail: string; userId: string; onSignOut: () => Promise<void> }) {
  const toast = useToast()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const { data: history = [], isLoading: historyLoading } = useHistory()
  const [editing, setEditing] = useState(false)

  const historyShowIds = useMemo(() => [...new Set(history.map(entry => entry.tmdbTvId))], [history])
  const { data: historyShows } = useShowsByIds(historyShowIds)

  const activityStats = useMemo(() => {
    const totalSeconds = history.reduce((total, entry) => {
      const seconds = entry.completed && entry.duration ? entry.duration : entry.currentPosition
      return total + Math.max(0, seconds || 0)
    }, 0)
    return {
      series: historyShowIds.length,
      episodes: history.length,
      completed: history.filter(entry => entry.completed).length,
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
    }
  }, [history, historyShowIds.length])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (profile) reset({ displayName: profile.displayName ?? '' })
  }, [profile, reset])

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({ displayName: values.displayName?.trim() || undefined })
      toast.success('Profile updated')
      setEditing(false)
    } catch {
      toast.error('Could not update profile')
    }
  }

  const displayName = profile?.displayName || userEmail.split('@')[0]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-lg font-semibold text-[var(--color-text-secondary)]">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            {!editing ? (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{displayName}</h1>
                <button onClick={() => setEditing(true)} aria-label="Edit name" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                  <Pencil size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2">
                <Input
                  placeholder="Display name"
                  error={errors.displayName?.message}
                  autoFocus
                  {...register('displayName')}
                />
                <button type="submit" className="mt-2 text-[var(--color-success)]" aria-label="Save">
                  <Check size={18} />
                </button>
                <button type="button" onClick={() => setEditing(false)} className="mt-2 text-[var(--color-text-muted)]" aria-label="Cancel">
                  <X size={18} />
                </button>
              </form>
            )}
            <p className="text-sm text-[var(--color-text-muted)]">{userEmail}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" icon={<LogOut size={14} />} onClick={() => onSignOut()}>
          Sign out
        </Button>
      </div>

      <section className="mb-10">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-1">Appearance &amp; Themes</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-5">
          Choose how AFTERSHOW looks. Your selection applies everywhere and is saved to your account.
        </p>
        <ThemePicker />
      </section>

      <section className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-1">Viewing activity</h2>
            <p className="text-sm text-[var(--color-text-muted)]">A snapshot of your AFTERSHOW journey.</p>
          </div>
          <Link to="/history" className="text-xs text-[var(--color-accent)] hover:underline whitespace-nowrap">View history</Link>
        </div>

        {historyLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(item => <div key={item} className="skeleton h-20 rounded-md" />)}
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--color-border)] px-4 py-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Your viewing activity will appear here.</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Start an episode to begin building your history.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <ActivityStat icon={<Film size={15} />} value={activityStats.series} label="Series" />
              <ActivityStat icon={<Play size={15} />} value={activityStats.episodes} label="Episodes" />
              <ActivityStat icon={<CheckCircle2 size={15} />} value={activityStats.completed} label="Completed" />
              <ActivityStat icon={<Clock3 size={15} />} value={activityStats.hours ? `${activityStats.hours}h` : `${activityStats.minutes}m`} label="Time logged" />
            </div>

            <div className="border-t border-[var(--color-border-subtle)] pt-4">
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Recently watched</p>
              <div className="space-y-2">
                {history.slice(0, 4).map(entry => {
                  const show = historyShows.find(item => item.id === entry.tmdbTvId)?.show
                  return (
                    <Link
                      key={entry.id}
                      to={`/watch/tv/${entry.tmdbTvId}/${entry.seasonNumber}/${entry.episodeNumber}`}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-2 -mx-2 hover:bg-[var(--color-bg-card-hover)] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[var(--color-text-primary)] truncate">{show?.name ?? 'Loading series…'}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">S{entry.seasonNumber} · E{entry.episodeNumber}</p>
                      </div>
                      <span className={`flex-shrink-0 text-xs ${entry.completed ? 'text-[var(--color-success)]' : 'text-[var(--color-accent)]'}`}>
                        {entry.completed ? 'Completed' : 'In progress'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </section>

      <p className="text-sm text-[var(--color-text-muted)]">
        Want to change autoplay or language/region preferences?{' '}
        <Link to="/settings" className="text-[var(--color-accent)] hover:underline">Go to Settings</Link>.
      </p>

      {isLoading && <p className="text-xs text-[var(--color-text-muted)] mt-4">Loading profile…</p>}
      <p className="text-xs text-[var(--color-text-muted)] mt-1">Account ID: {userId}</p>
    </div>
  )
}

function ActivityStat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 p-3">
      <div className="flex items-center gap-1.5 text-[var(--color-accent)] mb-1">{icon}<span className="text-lg font-semibold text-[var(--color-text-primary)]">{value}</span></div>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  )
}
