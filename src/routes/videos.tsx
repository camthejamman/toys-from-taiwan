import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { SpriteIcon } from '../components/SpriteIcon'
import { socials } from '../data/site'
import { channelUrl } from '../data/videos'

// head() lives on the CHILD routes (videos.index.tsx / videos.shorts.tsx),
// not here: a layout-route canonical would stack with the child's — two
// rel=canonical links on the Shorts page, which search engines ignore.
export const Route = createFileRoute('/videos')({
  component: VideosLayout,
})

const tabClass =
  'btn-3d rounded-md border border-card-border bg-card px-5 py-2 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent lg:px-7 lg:py-2.5 lg:text-lg'
const activeTabClass =
  'btn-3d btn-3d-accent rounded-md bg-accent px-5 py-2 font-semibold text-accent-ink no-underline lg:px-7 lg:py-2.5 lg:text-lg'

function VideosLayout() {
  const tiktok = socials.find((s) => s.id === 'tiktok')
  const instagram = socials.find((s) => s.id === 'instagram')

  return (
    <Section title="Latest Videos" eyebrow="Watch live loops" as="h1">
      <nav aria-label="Video type" className="mb-8 flex flex-wrap gap-3">
        <Link
          to="/videos"
          activeOptions={{ exact: true }}
          activeProps={{ className: activeTabClass, 'aria-current': 'page' }}
          inactiveProps={{ className: tabClass }}
        >
          Jams
        </Link>
        <Link
          to="/videos/shorts"
          activeProps={{ className: activeTabClass, 'aria-current': 'page' }}
          inactiveProps={{ className: tabClass }}
        >
          Shorts
        </Link>
      </nav>

      <Outlet />

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:mt-12 lg:gap-4">
        <a
          href={`${channelUrl}/videos`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 btn-3d btn-3d-accent rounded-md bg-accent px-6 py-2.5 font-semibold text-accent-ink no-underline shadow-lg transition hover:bg-accent-strong sm:w-auto lg:px-8 lg:py-3 lg:text-lg"
        >
          <SpriteIcon name="icon-youtube" className="h-5 w-5 lg:h-6 lg:w-6" />
          Long Jams on YouTube
        </a>
        <a
          href={`${channelUrl}/shorts`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 btn-3d rounded-md border border-card-border bg-card px-6 py-2.5 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent sm:w-auto lg:px-8 lg:py-3 lg:text-lg"
        >
          <SpriteIcon name="icon-youtube" className="h-5 w-5 lg:h-6 lg:w-6" />
          Shorts on YouTube
        </a>
        {instagram ? (
          <a
            href={instagram.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 btn-3d rounded-md border border-card-border bg-card px-6 py-2.5 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent sm:w-auto lg:px-8 lg:py-3 lg:text-lg"
          >
            <SpriteIcon name="icon-instagram" className="h-5 w-5 lg:h-6 lg:w-6" />
            Reels on Instagram
          </a>
        ) : null}
        {tiktok ? (
          <a
            href={tiktok.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 btn-3d rounded-md border border-card-border bg-card px-6 py-2.5 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent sm:w-auto lg:px-8 lg:py-3 lg:text-lg"
          >
            <SpriteIcon name="icon-tiktok" className="h-5 w-5 lg:h-6 lg:w-6" />
            Jams on TikTok
          </a>
        ) : null}
      </div>
    </Section>
  )
}
