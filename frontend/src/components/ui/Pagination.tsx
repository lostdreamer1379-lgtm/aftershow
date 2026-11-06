import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const clampedTotal = Math.min(totalPages, 500) // TMDB caps at 500 pages
  if (clampedTotal <= 1) return null

  const go = (p: number) => {
    const next = Math.max(1, Math.min(clampedTotal, p))
    onChange(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Build a compact page list: first, last, current ± 1, with ellipses
  const pages = new Set<number>([1, clampedTotal, page, page - 1, page + 1].filter(p => p >= 1 && p <= clampedTotal))
  const sorted = Array.from(pages).sort((a, b) => a - b)

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <IconButton size="sm" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={16} />
      </IconButton>

      {sorted.map((p, i) => {
        const prev = sorted[i - 1]
        const showEllipsis = prev !== undefined && p - prev > 1
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && <span className="text-[var(--color-text-muted)] text-sm px-1">…</span>}
            <button
              onClick={() => go(p)}
              className={`w-8 h-8 rounded-md text-sm transition-colors ${
                p === page
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)]'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          </span>
        )
      })}

      <IconButton size="sm" onClick={() => go(page + 1)} disabled={page >= clampedTotal} aria-label="Next page">
        <ChevronRight size={16} />
      </IconButton>
    </nav>
  )
}
