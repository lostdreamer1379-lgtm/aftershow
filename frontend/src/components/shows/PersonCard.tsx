import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { getProfileUrl } from '@/lib/tmdb-image'

interface PersonCardProps {
  id: number
  name: string
  subtitle?: string
  profilePath?: string | null
}

export default function PersonCard({ id, name, subtitle, profilePath }: PersonCardProps) {
  return (
    <Link to={`/people/${id}`} className="flex-shrink-0 w-[110px] group">
      <div className="w-[110px] h-[110px] rounded-full overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)] mb-2">
        {profilePath ? (
          <img
            src={getProfileUrl(profilePath, 'w185')}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
            <User size={32} />
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1 text-center group-hover:text-[var(--color-accent)] transition-colors">
        {name}
      </p>
      {subtitle && (
        <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 text-center">{subtitle}</p>
      )}
    </Link>
  )
}
