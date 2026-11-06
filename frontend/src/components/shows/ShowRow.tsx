import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { TVShowListItem } from '@/types'
import ShowCard from './ShowCard'
import { CardRowSkeleton } from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'

interface ShowRowProps {
  title: string
  shows?: TVShowListItem[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  viewAllHref?: string
  cardSize?: 'sm' | 'md' | 'lg'
}

export default function ShowRow({
  title,
  shows,
  isLoading,
  isError,
  onRetry,
  viewAllHref,
  cardSize = 'md',
}: ShowRowProps) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-0.5"
          >
            See all <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {isLoading && <CardRowSkeleton count={7} />}
      {isError && <ErrorState retry={onRetry} className="py-8" />}
      {!isLoading && !isError && shows && (
        <div className="scroll-row">
          {shows.map(show => (
            <ShowCard key={show.id} show={show} size={cardSize} />
          ))}
        </div>
      )}
    </section>
  )
}
