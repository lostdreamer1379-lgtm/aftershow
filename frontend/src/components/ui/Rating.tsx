import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  count?: number
  size?: 'sm' | 'md'
  className?: string
}

export default function Rating({ value, count, size = 'sm', className = '' }: RatingProps) {
  const formatted = value.toFixed(1)
  const starSize = size === 'sm' ? 12 : 14
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <span className={`inline-flex items-center gap-1 ${textClass} font-medium ${className}`}>
      <Star size={starSize} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
      <span>{formatted}</span>
      {count && <span className="text-[var(--color-text-muted)] font-normal">({count.toLocaleString()})</span>}
    </span>
  )
}
