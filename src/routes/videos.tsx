import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { SpriteIcon } from '../components/SpriteIcon'
import { VideoEmbed } from '../components/VideoEmbed'
import { site, socials } from '../data/site'
import { channelUrl, videos } from '../data/videos'

export const Route = createFileRoute('/videos')({
  component: Videos,
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

function Videos() {
  const tiktok = socials.find((s) => s.id === 'tiktok')

  return (
    <>
      <Section title="Latest Videos" eyebrow="Watch the loops happen" as="h1">
        <p className="-mt-2 mb-8 max-w-2xl text-muted">
          Every video is a real live loop — no backing tracks, built layer by
          layer on screen. Tap a thumbnail to play it right here.
        </p>
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoEmbed key={video.id} video={video} />
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`${channelUrl}/videos`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-ink no-underline shadow-lg transition hover:bg-accent-strong"
          >
            <SpriteIcon name="icon-youtube" className="h-5 w-5" />
            All videos on YouTube
          </a>
          {tiktok ? (
            <a
              href={tiktok.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-6 py-2.5 font-semibold text-ink no-underline transition hover:border-accent hover:text-accent"
            >
              <SpriteIcon name="icon-tiktok" className="h-5 w-5" />
              Shorts &amp; live streams on TikTok
            </a>
          ) : null}
        </div>
      </Section>
    </>
  )
}
