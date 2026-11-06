import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ShowGrid from '@/components/shows/ShowGrid'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState'
import { useGenres, useSearchShows, useDiscoverShows } from '@/hooks/useTV'
import { useDebounce } from '@/hooks/useDebounce'

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'first_air_date.desc', label: 'Newest First' },
  { value: 'first_air_date.asc', label: 'Oldest First' },
  { value: 'name.asc', label: 'Name (A–Z)' },
]

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Any language' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = [
  { value: '', label: 'Any year' },
  ...Array.from({ length: 40 }, (_, i) => {
    const y = currentYear + 1 - i
    return { value: String(y), label: String(y) }
  }),
]

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '9', label: '9+' },
  { value: '8', label: '8+' },
  { value: '7', label: '7+' },
  { value: '6', label: '6+' },
  { value: '5', label: '5+' },
]

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const queryParam = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(queryParam)
  const debouncedSearch = useDebounce(searchInput, 400)

  const genre = searchParams.get('genre') || ''
  const year = searchParams.get('year') || ''
  const rating = searchParams.get('rating') || ''
  const language = searchParams.get('language') || ''
  const sortBy = searchParams.get('sort') || 'popularity.desc'
  const page = parseInt(searchParams.get('page') || '1', 10)

  // Keep the URL in sync with debounced search text
  useEffect(() => {
    if (debouncedSearch === queryParam) return
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('q', debouncedSearch)
    else next.delete('q')
    next.delete('page')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const isSearchMode = queryParam.trim().length > 0
  const hasActiveFilters = Boolean(genre || year || rating || language || sortBy !== 'popularity.desc')

  const { data: genres } = useGenres()

  const discoverParams = useMemo(() => {
    const params: Record<string, string | number> = { page, sort_by: sortBy }
    if (genre) params.with_genres = genre
    if (year) params.first_air_date_year = year
    if (rating) params['vote_average.gte'] = rating
    if (language) params.with_original_language = language
    return params
  }, [page, sortBy, genre, year, rating, language])

  const searchResult = useSearchShows(queryParam, page)
  const discoverResult = useDiscoverShows(discoverParams, !isSearchMode)

  const active = isSearchMode ? searchResult : discoverResult

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-text-primary)] mb-6">
        Explore TV Series
      </h1>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <Input
            icon={<Search size={16} />}
            iconRight={searchInput ? (
              <button onClick={() => setSearchInput('')} aria-label="Clear search">
                <X size={14} />
              </button>
            ) : undefined}
            placeholder="Search by title…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
        <Button
          variant={filtersOpen ? 'primary' : 'secondary'}
          icon={<SlidersHorizontal size={16} />}
          onClick={() => setFiltersOpen(v => !v)}
        >
          Filters {hasActiveFilters && <span className="ml-0.5">•</span>}
        </Button>
        {(hasActiveFilters || queryParam) && (
          <Button variant="ghost" onClick={clearFilters}>Clear all</Button>
        )}
      </div>

      {/* Filters panel — disabled while in search mode since TMDB's
          /search/tv endpoint doesn't support genre/year/rating filters. */}
      {filtersOpen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <Select
            label="Genre"
            value={genre}
            onChange={e => updateFilter('genre', e.target.value)}
            disabled={isSearchMode}
            options={[{ value: '', label: 'Any genre' }, ...(genres ?? []).map(g => ({ value: String(g.id), label: g.name }))]}
          />
          <Select
            label="Year"
            value={year}
            onChange={e => updateFilter('year', e.target.value)}
            disabled={isSearchMode}
            options={YEAR_OPTIONS}
          />
          <Select
            label="Rating"
            value={rating}
            onChange={e => updateFilter('rating', e.target.value)}
            disabled={isSearchMode}
            options={RATING_OPTIONS}
          />
          <Select
            label="Language"
            value={language}
            onChange={e => updateFilter('language', e.target.value)}
            disabled={isSearchMode}
            options={LANGUAGE_OPTIONS}
          />
          <div className="col-span-2 sm:col-span-4">
            <Select
              label="Sort by"
              value={sortBy}
              onChange={e => updateFilter('sort', e.target.value)}
              disabled={isSearchMode}
              options={SORT_OPTIONS}
            />
          </div>
          {isSearchMode && (
            <p className="col-span-2 sm:col-span-4 text-xs text-[var(--color-text-muted)]">
              Filters apply to browsing, not to text search. Clear your search to use them.
            </p>
          )}
        </div>
      )}

      {active.isError && <ErrorState retry={() => active.refetch()} />}

      {!active.isError && (
        <>
          <ShowGrid
            shows={active.data?.results}
            isLoading={active.isLoading}
            emptyMessage={isSearchMode ? `No series found for "${queryParam}".` : 'No series match these filters.'}
          />
          {active.data && (
            <Pagination page={page} totalPages={active.data.total_pages} onChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}
