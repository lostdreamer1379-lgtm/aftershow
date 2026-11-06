import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, KeyRound, CheckCircle2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { resetPasswordSchema, ResetPasswordFormValues } from '@/lib/authValidation'
import { supabase } from '@/lib/supabase'

// Reached via the link Supabase emails from the "forgot password" flow.
// Supabase exchanges the token in the URL for a temporary session
// automatically via onAuthStateChange (PASSWORD_RECOVERY event) before this
// page needs to do anything with it.
export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // If a session already exists (e.g. the listener fired before mount),
    // allow the form to render rather than waiting indefinitely.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null)
    const { error } = await updatePassword(values.password)
    if (error) {
      setFormError(error)
      return
    }
    setDone(true)
    setTimeout(() => navigate('/'), 2000)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[rgba(76,175,125,0.12)] flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={22} className="text-[var(--color-success)]" />
        </div>
        <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">Password updated</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Taking you back to AFTERSHOW…</p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Verifying your reset link… If this doesn't resolve, the link may have expired —{' '}
          <Link to="/forgot-password" className="text-[var(--color-accent)] hover:underline">request a new one</Link>.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="flex flex-col items-center mb-8">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center mb-4">
          <KeyRound size={20} className="text-[var(--color-bg-primary)]" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Set a new password</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="New password"
          type="password"
          icon={<Lock size={16} />}
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm new password"
          type="password"
          icon={<Lock size={16} />}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {formError && (
          <p className="text-sm text-[var(--color-error)] bg-[rgba(224,92,92,0.1)] border border-[var(--color-error)] rounded-md px-3 py-2">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </div>
  )
}
