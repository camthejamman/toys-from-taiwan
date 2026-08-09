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

/** One comfortable grid screen per page (2/3/4 columns). */
const PAGE_SIZE = 12

/** Memoized card; .short-card's content-visibility keeps offscreen cards
 * free even within a page. */
const ShortCard = memo(function ShortCard({ video }: { video: Video }) {
  return (
    <div className="short-card">
      <VideoEmbed video={video} vertical />
    </div>
  )
})

const pageBtn =
  'btn-3d flex h-10 min-w-10 items-center justify-center rounded-md border border-card-border bg-card px-2 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent'
const pageBtnActive =
  'btn-3d btn-3d-accent flex h-10 min-w-10 items-center justify-center rounded-md bg-accent px-2 font-semibold text-accent-ink no-underline'
const pageBtnDisabled =
  'flex h-10 min-w-10 items-center justify-center rounded-md border border-card-border bg-card px-2 font-semibold text-muted opacity-50'

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
      <p className="-mt-2 mb-8 max-w-2xl text-muted">
        Bite-size loops in portrait — the same 100% live looping,
        shorts-style. Tap one to play it right here.
      </p>
      {shorts.length > 0 ? (
        <>
          <div
            ref={gridRef}
            className="grid scroll-mt-24 grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
          >
            {pageShorts.map((short) => (
              <ShortCard key={short.id} video={short} />
            ))}
          </div>
          {totalPages > 1 ? (
            <nav
              aria-label="Shorts pages"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              {current > 1 ? (
                <Link
                  from={Route.fullPath}
                  search={pageSearch(current - 1)}
                  resetScroll={false}
                  className={pageBtn}
                  aria-label="Previous page"
                >
                  ‹
                </Link>
              ) : (
                <span className={pageBtnDisabled} aria-hidden="true">
                  ‹
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
                  ›
                </Link>
              ) : (
                <span className={pageBtnDisabled} aria-hidden="true">
                  ›
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
