import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
}

const BASE = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none'

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-[var(--color-accent)] text-[var(--color-bg-primary)] hover:bg-[var(--color-accent-hover)] active:scale-[0.98]',
  secondary: 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] active:scale-[0.98]',
  ghost:     'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-subtle)] active:scale-[0.98]',
  danger:    'bg-[var(--color-error)] text-white hover:opacity-90 active:scale-[0.98]',
}

const SIZES: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 h-8',
  md: 'text-sm px-4 py-2 h-9',
  lg: 'text-base px-6 py-2.5 h-11',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
})

Button.displayName = 'Button'
export default Button

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
  ...props
}, ref) => {
  const PAD: Record<Size, string> = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' }
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md transition-all duration-150 disabled:opacity-50 cursor-pointer ${VARIANTS[variant]} ${PAD[size ?? 'md']} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})
IconButton.displayName = 'IconButton'

export { motion }
