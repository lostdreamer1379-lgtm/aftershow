import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Tv } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema, LoginFormValues } from '@/lib/authValidation'
import { useToast } from '@/hooks/useToast'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    const { error } = await signIn(values.email, values.password)
    if (error) {
      setFormError(error)
      return
    }
    toast.success('Welcome back!')
    const redirect = searchParams.get('redirect')
    navigate(redirect ? decodeURIComponent(redirect) : '/')
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="flex flex-col items-center mb-8">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center mb-4">
          <Tv size={20} className="text-[var(--color-bg-primary)]" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Welcome back</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Sign in to continue to AFTERSHOW</p>
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
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {formError && (
          <p className="text-sm text-[var(--color-error)] bg-[rgba(224,92,92,0.1)] border border-[var(--color-error)] rounded-md px-3 py-2">
            {formError}
          </p>
        )}

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-[var(--color-accent)] hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[var(--color-accent)] hover:underline">Sign up</Link>
      </p>

      <p className="text-center text-sm text-[var(--color-text-muted)] mt-3">
        <Link to="/" className="hover:text-[var(--color-text-secondary)] transition-colors">
          Continue browsing as a guest
        </Link>
      </p>
    </div>
  )
}
