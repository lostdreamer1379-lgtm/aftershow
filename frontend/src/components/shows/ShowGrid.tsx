import { TVShowListItem } from '@/types'
import ShowCard from './ShowCard'
import { PosterSkeleton } from '@/components/ui/Skeleton'
import Skeleton from '@/components/ui/Skeleton'

interface ShowGridProps {
  shows?: TVShowListItem[]
  isLoading?: boolean
  skeletonCount?: number
  emptyMessage?: string
}

export default function ShowGrid({ shows, isLoading, skeletonCount = 20, emptyMessage }: ShowGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i}>
            <PosterSkeleton />
            <Skeleton className="mt-2 h-3 w-3/4" />
            <Skeleton className="mt-1.5 h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (!shows || shows.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--color-text-muted)] text-sm">
        {emptyMessage || 'No results found.'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
      {shows.map(show => (
        <ShowCard key={show.id} show={show} size="md" />
      ))}
    </div>
  )
}
