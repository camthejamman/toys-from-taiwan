import { useState } from 'react'
import { useIsDark } from './ThemeToggle'
import type { Release } from '../data/releases'

/**
 * Click-to-load Bandcamp player. Shows the (self-hosted) cover art until the
 * visitor asks to listen, so no third-party requests happen on page load.
 */
export function BandcampEmbed({ release }: { release: Release }) {
  const [loaded, setLoaded] = useState(false)
  // Live theme so the player colors follow the toggle (src change reloads it).
  const dark = useIsDark() ?? false

  if (!loaded) {
    return (
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="group relative block w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl border border-card-border bg-transparent p-0 text-left shadow-lg"
        aria-label={`Play ${release.title} — loads the Bandcamp player`}
      >
        <img
          src={release.cover}
          alt={release.coverAlt}
          width={700}
          height={700}
          className="block w-full transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-90 transition group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 font-semibold text-slate-900 shadow-lg backdrop-blur">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
            Play on Bandcamp
          </span>
        </span>
      </button>
    )
  }

  const bgcol = dark ? '0d1630' : 'ffffff'
  const linkcol = dark ? '7cd0ff' : '0687f5'

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-card-border shadow-lg">
      <iframe
        title={`${release.title} — Bandcamp player`}
        src={`https://bandcamp.com/EmbeddedPlayer/album=${release.bandcampAlbumId}/size=large/bgcol=${bgcol}/linkcol=${linkcol}/tracklist=true/artwork=small/transparent=true/`}
        seamless
        className="h-[640px] w-full border-0"
        loading="lazy"
      >
        <a href={release.bandcampUrl}>
          {release.title} by Toys From Taiwan
        </a>
      </iframe>
    </div>
  )
}
