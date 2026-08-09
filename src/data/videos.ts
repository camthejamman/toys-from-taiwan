import videosJson from './videos.json'

export type Video = {
  id: string
  title: string
  /** ISO date, or null if YouTube didn't expose one. */
  published: string | null
}

/**
 * Latest regular uploads (no Shorts), refreshed by `npm run fetch-videos`
 * (scripts/fetch-videos.mjs) — CI also runs it before every deploy, and the
 * deploy workflow rebuilds on a weekly schedule so this stays current
 * without manual pushes.
 */
export const videos: Video[] = videosJson.videos

export const channelUrl = 'https://www.youtube.com/@toysfromtaiwan'

export function videoThumb(video: Video): string {
  return `${import.meta.env.BASE_URL}thumbs/${video.id}.jpg`
}

export function formatVideoDate(iso: string | null): string | null {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
