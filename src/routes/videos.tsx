import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { SpriteIcon } from '../components/SpriteIcon'
import { site, socials } from '../data/site'
import { channelUrl } from '../data/videos'

export const Route = createFileRoute('/videos')({
  component: VideosLayout,
  head: () => ({
    meta: [
      { title: `Videos · ${site.name}` },
      {
        name: 'description',
        content:
          'Watch Toys From Taiwan live-looping videos — full jams, live streams, and video-game-flavored grooves, built one loop at a time.',
      },
    ],
  }),
})

const tabClass =
  'btn-3d rounded-md border border-card-border bg-card px-5 py-2 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent'
const activeTabClass =
  'btn-3d btn-3d-accent rounded-md bg-accent px-5 py-2 font-semibold text-accent-ink no-underline'

function VideosLayout() {
  const tiktok = socials.find((s) => s.id === 'tiktok')
  const instagram = socials.find((s) => s.id === 'instagram')

  return (
    <Section title="Latest Videos" eyebrow="Watch the loops happen" as="h1">
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

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`${channelUrl}/videos`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 btn-3d btn-3d-accent rounded-md bg-accent px-6 py-2.5 font-semibold text-accent-ink no-underline shadow-lg transition hover:bg-accent-strong"
        >
          <SpriteIcon name="icon-youtube" className="h-5 w-5" />
          FullScreen YouTube Jams
        </a>
        {instagram ? (
          <a
            href={instagram.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 btn-3d rounded-md border border-card-border bg-card px-6 py-2.5 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent"
          >
            <SpriteIcon name="icon-instagram" className="h-5 w-5" />
            Reels on Instagram
          </a>
        ) : null}
        {tiktok ? (
          <a
            href={tiktok.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 btn-3d rounded-md border border-card-border bg-card px-6 py-2.5 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent"
          >
            <SpriteIcon name="icon-tiktok" className="h-5 w-5" />
            TikTok
          </a>
        ) : null}
        <a
          href={`${channelUrl}/shorts`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 btn-3d rounded-md border border-card-border bg-card px-6 py-2.5 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent"
        >
          <SpriteIcon name="icon-youtube" className="h-5 w-5" />
          Shorts on YouTube
        </a>
      </div>
    </Section>
  )
}
