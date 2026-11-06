interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const ROUNDED = { sm: 'rounded', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' }

export default function Skeleton({ className = '', rounded = 'md' }: SkeletonProps) {
  return <div className={`skeleton ${ROUNDED[rounded]} ${className}`} aria-hidden="true" />
}

export function PosterSkeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg aspect-[2/3] ${className}`} aria-hidden="true" />
}

export function CardRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="scroll-row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[160px]">
          <PosterSkeleton />
          <Skeleton className="mt-2 h-3 w-3/4" />
          <Skeleton className="mt-1.5 h-2.5 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function EpisodeCardSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-lg border border-[var(--color-border)]">
      <Skeleton className="flex-shrink-0 w-[120px] h-[68px]" rounded="md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-2/3" />
      </div>
    </div>
  )
}
