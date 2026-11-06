import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { TVShowListItem } from '@/types'
import { getPosterUrl } from '@/lib/tmdb-image'

interface ShowCardProps {
  show: TVShowListItem
  size?: 'sm' | 'md' | 'lg'
}

const WIDTHS = {
  sm: 'w-[130px] min-w-[130px]',
  md: 'w-[160px] min-w-[160px]',
  lg: 'w-[190px] min-w-[190px]',
}

export default function ShowCard({ show, size = 'md' }: ShowCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <Link
      to={`/tv/${show.id}`}
      className={`group flex flex-col gap-2 flex-shrink-0 ${WIDTHS[size]}`}
    >
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <img
          src={getPosterUrl(show.poster_path, 'w342')}
          alt={show.name}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        {/* Rating overlay */}
        {show.vote_average > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              {show.vote_average.toFixed(1)}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/8 transition-all duration-300" />
      </div>

      <div className="px-0.5">
        <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-tight group-hover:text-[var(--color-accent)] transition-colors">
          {show.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {show.first_air_date ? show.first_air_date.slice(0, 4) : '—'}
        </p>
      </div>
    </Link>
  )
}
