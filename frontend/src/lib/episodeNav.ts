import { TVShow, Season } from '@/types'

export interface EpisodeTarget {
  season: number
  episode: number
}

export interface AdjacentEpisodes {
  prevTarget: EpisodeTarget | null
  nextTarget: EpisodeTarget | null
  /** True when there's no previous episode in this season but an earlier season exists. */
  hasPrevSeason: boolean
  /** True when there's no next episode and this is the show's last season. */
  isSeriesFinale: boolean
}

/**
 * Determines the previous/next episode using the ACTUAL loaded season data,
 * correctly handling season boundaries — the next episode after the last
 * episode of a season is season N+1 episode 1 (if that season exists), not
 * a guess at episode number + 1. Crossing backward into a previous season
 * isn't resolved here (we'd need that season's episode list to know its
 * last episode number), so callers get `hasPrevSeason` to link to that
 * season's page instead of guessing an episode number.
 */
export function getAdjacentEpisodes(
  show: TVShow | undefined,
  currentSeasonEpisodes: Season['episodes'] | undefined,
  seasonNumber: number | undefined,
  episodeNumber: number | undefined
): AdjacentEpisodes {
  if (!show || !currentSeasonEpisodes || seasonNumber === undefined || episodeNumber === undefined) {
    return { prevTarget: null, nextTarget: null, hasPrevSeason: false, isSeriesFinale: false }
  }

  const idx = currentSeasonEpisodes.findIndex(e => e.episode_number === episodeNumber)
  if (idx === -1) {
    return { prevTarget: null, nextTarget: null, hasPrevSeason: false, isSeriesFinale: false }
  }

  let prevTarget: EpisodeTarget | null = null
  let nextTarget: EpisodeTarget | null = null

  if (idx > 0) {
    prevTarget = { season: seasonNumber, episode: currentSeasonEpisodes[idx - 1].episode_number }
  }

  if (idx < currentSeasonEpisodes.length - 1) {
    nextTarget = { season: seasonNumber, episode: currentSeasonEpisodes[idx + 1].episode_number }
  } else {
    const nextSeason = show.seasons?.find(s => s.season_number === seasonNumber + 1)
    if (nextSeason) {
      nextTarget = { season: nextSeason.season_number, episode: 1 }
    }
  }

  const hasPrevSeason = idx === 0 && seasonNumber > 1 && !prevTarget
  const isSeriesFinale = !nextTarget && seasonNumber >= (show.number_of_seasons ?? 0)

  return { prevTarget, nextTarget, hasPrevSeason, isSeriesFinale }
}
