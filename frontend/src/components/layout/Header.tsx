import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, User, Menu, X, Tv } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { IconButton } from '@/components/ui/Button'
import { useSearchShows } from '@/hooks/useTV'
import { useDebounce } from '@/hooks/useDebounce'
import { getPosterUrl } from '@/lib/tmdb-image'

const NAV = [
  { label: 'Explore', to: '/explore' },
  { label: 'Watchlist', to: '/watchlist' },
  { label: 'Collections', to: '/collections' },
  { label: 'History', to: '/history' },
]

export default function Header() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 250)
  const liveSearchQuery = searchOpen && debouncedSearchQuery.trim().length >= 2 ? debouncedSearchQuery : ''
  const searchResults = useSearchShows(liveSearchQuery)
  const suggestions = searchResults.data?.results?.slice(0, 5) ?? []

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setMenuOpen(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = searchQuery.trim()
      closeSearch()
      navigate(`/explore?q=${encodeURIComponent(query)}`)
    }
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  const openSuggestion = (id: number) => {
    closeSearch()
    navigate(`/tv/${id}`)
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? 'var(--color-nav-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-[var(--color-accent)] flex items-center justify-center">
              <Tv size={14} className="text-[var(--color-bg-primary)]" />
            </div>
            <span className="font-semibold tracking-tight text-[var(--color-text-primary)] text-base">
              AFTERSHOW
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-card)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <IconButton onClick={() => { setMenuOpen(false); setSearchOpen(true) }} aria-label="Search" size="sm">
              <Search size={18} />
            </IconButton>
            <Link
              to={user ? '/profile' : '/login'}
              aria-label={user ? 'Profile' : 'Sign in'}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-subtle)] transition-colors"
            >
              <User size={18} />
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-subtle)] transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="fixed top-16 left-0 right-0 z-30 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] p-4 flex flex-col gap-1"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {NAV.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm px-3 py-2.5 rounded-md ${
                      isActive
                        ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-card)]'
                        : 'text-[var(--color-text-secondary)]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSearch}
            />
            <motion.div
              className="fixed top-20 left-3 right-3 z-50 w-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-xl sm:px-4"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <form onSubmit={handleSearch} className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search TV series…"
                  className="w-full min-w-0 h-14 pl-12 pr-16 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-base shadow-2xl outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-text-muted)] font-mono border border-[var(--color-border)] px-1.5 py-0.5 rounded">
                  ESC
                </kbd>
              </form>

              {(liveSearchQuery.length >= 2 || searchResults.isLoading) && (
                <div className="mt-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl">
                  {searchResults.isLoading ? (
                    <p className="px-4 py-4 text-sm text-[var(--color-text-muted)]">Searching series…</p>
                  ) : suggestions.length > 0 ? (
                    <div className="p-1.5">
                      {suggestions.map(show => (
                        <button
                          key={show.id}
                          type="button"
                          onClick={() => openSuggestion(show.id)}
                          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--color-bg-card-hover)]"
                        >
                          <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-[var(--color-bg-card)]">
                            {show.poster_path && <img src={getPosterUrl(show.poster_path, 'w92')} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{show.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {show.first_air_date?.slice(0, 4) || 'Series'}
                              {show.vote_average > 0 ? ` · ★ ${show.vote_average.toFixed(1)}` : ''}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-4 text-sm text-[var(--color-text-muted)]">No matching series found.</p>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
