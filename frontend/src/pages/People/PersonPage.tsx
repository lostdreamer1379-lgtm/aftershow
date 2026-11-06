import { useParams } from 'react-router-dom'
import { User } from 'lucide-react'
import ErrorState from '@/components/ui/ErrorState'
import ShowRow from '@/components/shows/ShowRow'
import { usePersonDetails } from '@/hooks/useTV'
import { getProfileUrl } from '@/lib/tmdb-image'

function calculateAge(birthday: string, deathday: string | null) {
  const end = deathday ? new Date(deathday) : new Date()
  const start = new Date(birthday)
  let age = end.getFullYear() - start.getFullYear()
  const m = end.getMonth() - start.getMonth()
  if (m < 0 || (m === 0 && end.getDate() < start.getDate())) age--
  return age
}

export default function PersonPage() {
  const { id } = useParams<{ id: string }>()
  const personId = id ? parseInt(id, 10) : undefined
  const { data: person, isLoading, isError, refetch } = usePersonDetails(personId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <div className="skeleton h-48 w-48 rounded-full" />
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-4 w-full" />
      </div>
    )
  }

  if (isError || !person) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <ErrorState title="Person not found" message="We couldn't load this profile." retry={() => refetch()} />
      </div>
    )
  }

  // Sort TV credits by popularity-adjacent signal (vote count) and dedupe
  const credits = (person.tv_credits?.cast ?? [])
    .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)
    .sort((a, b) => b.popularity - a.popularity)

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        <div className="w-48 h-48 rounded-full overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)] flex-shrink-0 mx-auto sm:mx-0">
          {person.profile_path ? (
            <img src={getProfileUrl(person.profile_path, 'h632')} alt={person.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
              <User size={48} />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            {person.name}
          </h1>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)] mb-4">
            {person.known_for_department && <span>{person.known_for_department}</span>}
            {person.birthday && (
              <span>
                Born {new Date(person.birthday).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                {' '}({calculateAge(person.birthday, person.deathday)}{person.deathday ? ' at passing' : ''})
              </span>
            )}
            {person.place_of_birth && <span>{person.place_of_birth}</span>}
          </div>
          {person.biography ? (
            <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {person.biography}
            </p>
          ) : (
            <p className="text-[var(--color-text-muted)] italic">No biography available.</p>
          )}
        </div>
      </div>

      <ShowRow title="Known For" shows={credits.slice(0, 20)} />
    </div>
  )
}
