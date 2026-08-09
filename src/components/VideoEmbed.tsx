import { useEffect, useState } from 'react'
import { formatVideoDate, videoThumb } from '../data/videos'
import type { Video } from '../data/videos'

/** Broadcast when any embed starts, so only one video plays at a time. */
const PLAY_EVENT = 'ttf-video-play'

/**
 * Click-to-play YouTube embed. Until the visitor clicks, only the
 * self-hosted thumbnail renders — zero YouTube requests on page load.
 * Pass `vertical` for Shorts (9:16 portrait thumbnails and player).
 * Starting one embed folds every other playing embed back to its
 * thumbnail (unmounting the iframe stops its audio).
 */
export function VideoEmbed({
  video,
  vertical = false,
}: {
  video: Video
  vertical?: boolean
}) {
  const [playing, setPlaying] = useState(false)
  const date = formatVideoDate(video.published)
  const aspect = vertical ? 'aspect-[9/16]' : 'aspect-video'

  useEffect(() => {
    if (!playing) return
    const onPlay = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== video.id) setPlaying(false)
    }
    window.addEventListener(PLAY_EVENT, onPlay)
    return () => window.removeEventListener(PLAY_EVENT, onPlay)
  }, [playing, video.id])

  const play = () => {
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: video.id }))
    setPlaying(true)
  }

  return (
    <article>
      {playing ? (
        <div
          className={`${aspect} w-full overflow-hidden rounded-lg border border-card-border shadow-lg`}
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={play}
          aria-label={`Play video: ${video.title}`}
          className="group relative block w-full cursor-pointer overflow-hidden rounded-lg border border-card-border bg-transparent p-0 shadow-lg"
        >
          <img
            src={videoThumb(video)}
            alt=""
            width={vertical ? 1080 : 1280}
            height={vertical ? 1920 : 720}
            loading="lazy"
            className={`block ${aspect} w-full object-cover transition duration-300 group-hover:scale-[1.03]`}
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition group-hover:scale-110">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            </span>
          </span>
        </button>
      )}
      <h3 className="mb-0 mt-3 text-base font-bold text-ink">{video.title}</h3>
      {date ? <p className="m-0 text-sm text-muted">{date}</p> : null}
    </article>
  )
}
