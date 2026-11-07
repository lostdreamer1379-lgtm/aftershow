import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, MailCheck } from 'lucide-react'
import BrandMark from '@/components/ui/BrandMark'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { signupSchema, SignupFormValues } from '@/lib/authValidation'
import { useToast } from '@/hooks/useToast'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null)
    const { error, needsEmailConfirmation } = await signUp(values.email, values.password)
    if (error) {
      setFormError(error)
      return
    }
    if (needsEmailConfirmation) {
      setAwaitingConfirmation(values.email)
      return
    }
    toast.success('Account created!')
    navigate('/')
  }

  if (awaitingConfirmation) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-5">
          <MailCheck size={22} className="text-[var(--color-accent)]" />
        </div>
        <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">Check your email</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          We sent a confirmation link to <span className="text-[var(--color-text-primary)]">{awaitingConfirmation}</span>.
          Click it to activate your account, then sign in.
        </p>
        <Link to="/login">
          <Button variant="secondary" fullWidth>Back to sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="flex flex-col items-center mb-8">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center mb-4">
          <BrandMark size={25} className="text-[var(--color-bg-primary)]" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Create your account</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Start tracking the shows you love</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          icon={<Mail size={16} />}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          icon={<Lock size={16} />}
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
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
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-accent)] hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
