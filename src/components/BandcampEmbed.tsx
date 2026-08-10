import { useState } from 'react'
import { useIsDark } from './ThemeToggle'
import type { Release } from '../data/releases'
import { preconnect } from '../lib/preconnect'

/**
 * Click-to-load Bandcamp player. Shows the (self-hosted) cover art until the
 * visitor asks to listen, so no third-party requests happen on page load.
 */
export function BandcampEmbed({ release }: { release: Release }) {
  const [loaded, setLoaded] = useState(false)
  // Live theme so the player colors follow the toggle (src change reloads it).
  const dark = useIsDark() ?? false

  if (!loaded) {
    // The player document comes from bandcamp.com; its assets and audio
    // stream from the bcbits CDNs — warm all three on intent.
    const warm = () =>
      preconnect([
        'https://bandcamp.com',
        'https://s4.bcbits.com',
        'https://t4.bcbits.com',
      ])
    return (
      <button
        type="button"
        onClick={() => setLoaded(true)}
        onPointerEnter={warm}
        onFocus={warm}
        onTouchStart={warm}
        className="group relative block w-full max-w-sm cursor-pointer overflow-hidden rounded-lg border border-card-border bg-transparent p-0 text-left shadow-lg xl:max-w-md"
        aria-label={`Play ${release.title} — loads the Bandcamp player`}
      >
        <img
          src={release.cover}
          alt={release.coverAlt}
          width={700}
          height={700}
          decoding="async"
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
    <div className="w-full max-w-sm overflow-hidden rounded-lg border border-card-border shadow-lg xl:max-w-md">
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
