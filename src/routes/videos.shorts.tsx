import { memo, useEffect, useMemo, useRef } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { VideoEmbed } from '../components/VideoEmbed'
import { site } from '../data/site'
import { shorts } from '../data/videos'
import type { Video } from '../data/videos'

export const Route = createFileRoute('/videos/shorts')({
  component: Shorts,
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const page = Math.floor(Number(search.page))
    return Number.isFinite(page) && page > 1 ? { page } : {}
  },
  head: () => ({
    meta: [
      { title: `Shorts · ${site.name}` },
      {
        name: 'description',
        content:
          'Short-form Toys From Taiwan live-looping videos — bite-size video-game grooves, every one looped live.',
      },
    ],
  }),
})

/** fetch-videos caps shorts at 108, so the pager never exceeds 6 pages
 * and fits one row even on 320px phones. */
const PAGE_SIZE = 20

/** Memoized card; .short-card's content-visibility keeps offscreen cards
 * free even within a page. */
/** Shorts titles are hashtag runs on YouTube ("Cake64 🎂 #livelooping
 * #midi …") — show just the name part, falling back to the full title
 * for the rare short that is nothing but hashtags. */
function displayTitle(title: string) {
  const stripped = title.replace(/#\S+/g, '').replace(/\s+/g, ' ').trim()
  return stripped || title
}

const ShortCard = memo(function ShortCard({ video }: { video: Video }) {
  return (
    <div className="short-card">
      <VideoEmbed
        video={{ ...video, title: displayTitle(video.title) }}
        vertical
      />
    </div>
  )
})

const pageBtn =
  'btn-3d flex h-8 min-w-8 items-center justify-center rounded-md border border-card-border bg-card px-2 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent sm:h-10 sm:min-w-10 lg:h-11 lg:min-w-11'
const pageBtnActive =
  'btn-3d btn-3d-accent flex h-8 min-w-8 items-center justify-center rounded-md bg-accent px-2 font-semibold text-accent-ink no-underline sm:h-10 sm:min-w-10 lg:h-11 lg:min-w-11'
const pageBtnDisabled =
  'flex h-8 min-w-8 items-center justify-center rounded-md border border-card-border bg-card px-2 font-semibold text-muted opacity-50 sm:h-10 sm:min-w-10 lg:h-11 lg:min-w-11'

/** SVG chevron instead of the ‹ › text glyphs — glyphs ride the font
 * baseline and sit visibly off-center in the square buttons. */
function Chevron({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === 'prev' ? <path d="M14 6l-6 6 6 6" /> : <path d="M10 6l6 6-6 6" />}
    </svg>
  )
}

function Shorts() {
  const { page = 1 } = Route.useSearch()
  const totalPages = Math.max(1, Math.ceil(shorts.length / PAGE_SIZE))
  const current = Math.min(Math.max(1, page), totalPages)
  const pageShorts = useMemo(
    () => shorts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    [current],
  )

  // Flipping pages while scrolled to the pagination row would leave the
  // viewer staring below the new (shorter) content — glide back to the top
  // of the grid instead. scroll-mt clears the sticky header.
  const gridRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    gridRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [current])

  const pageSearch = (n: number) => (n <= 1 ? {} : { page: n })

  return (
    <>
      <p className="-mt-2 mb-8 max-w-2xl text-muted lg:max-w-3xl lg:text-lg">
        Bite-size loops in portrait — the same 100% live looping,
        shorts-style. Tap one to play it right here.
      </p>
      {shorts.length > 0 ? (
        <>
          <div
            ref={gridRef}
            className="grid scroll-mt-24 grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
          >
            {pageShorts.map((short) => (
              <ShortCard key={short.id} video={short} />
            ))}
          </div>
          {totalPages > 1 ? (
            <nav
              aria-label="Shorts pages"
              className="mt-10 flex flex-wrap items-center justify-center gap-1 sm:gap-2"
            >
              {current > 1 ? (
                <Link
                  from={Route.fullPath}
                  search={pageSearch(current - 1)}
                  resetScroll={false}
                  className={pageBtn}
                  aria-label="Previous page"
                >
                  <Chevron dir="prev" />
                </Link>
              ) : (
                <span className={pageBtnDisabled} aria-hidden="true">
                  <Chevron dir="prev" />
                </span>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
                n === current ? (
                  <span key={n} className={pageBtnActive} aria-current="page">
                    {n}
                  </span>
                ) : (
                  <Link
                    key={n}
                    from={Route.fullPath}
                    search={pageSearch(n)}
                    resetScroll={false}
                    className={pageBtn}
                    aria-label={`Page ${n}`}
                  >
                    {n}
                  </Link>
                ),
              )}
              {current < totalPages ? (
                <Link
                  from={Route.fullPath}
                  search={pageSearch(current + 1)}
                  resetScroll={false}
                  className={pageBtn}
                  aria-label="Next page"
                >
                  <Chevron dir="next" />
                </Link>
              ) : (
                <span className={pageBtnDisabled} aria-hidden="true">
                  <Chevron dir="next" />
                </span>
              )}
            </nav>
          ) : null}
        </>
      ) : (
        <p className="text-muted">
          No shorts loaded yet — run <code>npm run fetch-videos</code>.
        </p>
      )}
    </>
  )
}
