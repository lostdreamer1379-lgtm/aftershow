import { Link } from 'react-router-dom'
import BrandMark from '@/components/ui/BrandMark'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--color-accent)] flex items-center justify-center">
              <BrandMark size={16} className="text-[var(--color-bg-primary)]" />
            </div>
            <span className="font-semibold text-sm text-[var(--color-text-primary)]">AFTERSHOW</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
            <Link to="/explore" className="hover:text-[var(--color-text-secondary)] transition-colors">Explore</Link>
            <Link to="/watchlist" className="hover:text-[var(--color-text-secondary)] transition-colors">Watchlist</Link>
            <Link to="/collections" className="hover:text-[var(--color-text-secondary)] transition-colors">Collections</Link>
            <Link to="/profile" className="hover:text-[var(--color-text-secondary)] transition-colors">Profile</Link>
            <Link to="/settings" className="hover:text-[var(--color-text-secondary)] transition-colors">Settings</Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </div>
      </div>
    </footer>
  )
}
