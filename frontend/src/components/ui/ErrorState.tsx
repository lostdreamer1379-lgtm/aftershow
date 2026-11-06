import { AlertCircle } from 'lucide-react'
import Button from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
  className?: string
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t load this content. Please try again.',
  retry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[rgba(224,92,92,0.1)] border border-[var(--color-error)] flex items-center justify-center mb-4">
        <AlertCircle size={22} className="text-[var(--color-error)]" />
      </div>
      <p className="font-medium text-[var(--color-text-primary)] mb-1">{title}</p>
      <p className="text-sm text-[var(--color-text-muted)] max-w-xs mb-5">{message}</p>
      {retry && <Button variant="secondary" size="sm" onClick={retry}>Try again</Button>}
    </div>
  )
}
