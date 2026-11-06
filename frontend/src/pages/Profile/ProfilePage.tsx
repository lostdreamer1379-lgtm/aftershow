import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, LogOut, Pencil, Check, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { profileSchema, ProfileFormValues } from '@/lib/authValidation'
import ThemePicker from '@/components/ui/ThemePicker'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/hooks/useToast'

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
  const [editing, setEditing] = useState(false)

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
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-1">Viewing activity</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Series watched, episodes watched, seasons completed and total viewing time arrive in Phase 5
          once watch history is tracked in the database.
        </p>
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
