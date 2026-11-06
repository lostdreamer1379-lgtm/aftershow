import Button from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center mb-4 text-[var(--color-text-muted)]">
          {icon}
        </div>
      )}
      <p className="font-medium text-[var(--color-text-primary)] mb-1">{title}</p>
      {description && <p className="text-sm text-[var(--color-text-muted)] max-w-xs mb-5">{description}</p>}
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
