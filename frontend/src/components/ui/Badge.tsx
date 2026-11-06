interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

const VARIANTS = {
  default:  'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
  accent:   'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]',
  success:  'bg-[rgba(76,175,125,0.12)] text-[var(--color-success)] border border-[var(--color-success)]',
  warning:  'bg-[rgba(232,160,68,0.12)] text-[var(--color-warning)] border border-[var(--color-warning)]',
  error:    'bg-[rgba(224,92,92,0.12)] text-[var(--color-error)] border border-[var(--color-error)]',
  outline:  'text-[var(--color-text-secondary)] border border-[var(--color-border)]',
}

const SIZES = {
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {children}
    </span>
  )
}
