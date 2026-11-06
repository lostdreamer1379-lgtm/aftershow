import { TVShow, WatchHistoryEntry } from '@/types'

export interface ShowProgress {
  episodesWatched: number
  totalEpisodes: number
  seasonsCompleted: number
  totalSeasons: number
  overallPercent: number
  lastWatched: WatchHistoryEntry | null
  /** Best-effort guess at the next episode to watch, assuming sequential
   *  numbering within each season. Approximate for shows with irregular
   *  episode numbering (e.g. some anniversary specials). */
  nextEpisode: { season: number; episode: number } | null
}

export function computeShowProgress(show: TVShow, historyEntries: WatchHistoryEntry[]): ShowProgress {
  const showHistory = historyEntries.filter(h => h.tmdbTvId === show.id)
  const completedEntries = showHistory.filter(h => h.completed)

  // Only count real, numbered seasons — exclude "Season 0" specials from
  // completion math, matching how most viewers think about "finishing" a show.
  const realSeasons = (show.seasons ?? []).filter(s => s.season_number >= 1 && s.episode_count > 0)
  const totalEpisodes = realSeasons.reduce((sum, s) => sum + s.episode_count, 0)
  const episodesWatched = completedEntries.filter(h =>
    realSeasons.some(s => s.season_number === h.seasonNumber)
  ).length

  let seasonsCompleted = 0
  for (const season of realSeasons) {
    const watchedInSeason = completedEntries.filter(h => h.seasonNumber === season.season_number).length
    if (watchedInSeason >= season.episode_count) seasonsCompleted++
  }

  const overallPercent = totalEpisodes > 0 ? Math.round((episodesWatched / totalEpisodes) * 100) : 0

  const lastWatched = showHistory.length > 0
    ? [...showHistory].sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())[0]
    : null

  // Find the first season/episode combination with no completed record,
  // walking seasons and episode numbers in order.
  let nextEpisode: { season: number; episode: number } | null = null
  outer: for (const season of realSeasons.sort((a, b) => a.season_number - b.season_number)) {
    for (let ep = 1; ep <= season.episode_count; ep++) {
      const isComplete = completedEntries.some(
        h => h.seasonNumber === season.season_number && h.episodeNumber === ep
      )
      if (!isComplete) {
        nextEpisode = { season: season.season_number, episode: ep }
        break outer
      }
    }
  }

  return {
    episodesWatched,
    totalEpisodes,
    seasonsCompleted,
    totalSeasons: realSeasons.length,
    overallPercent,
    lastWatched,
    nextEpisode,
  }
}
