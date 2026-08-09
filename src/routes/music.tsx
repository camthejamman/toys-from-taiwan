import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { BandcampEmbed } from '../components/BandcampEmbed'
import { PlatformPillRow } from '../components/PlatformPill'
import { SpriteIcon } from '../components/SpriteIcon'
import { site, socials, streaming } from '../data/site'
import { releases } from '../data/releases'

export const Route = createFileRoute('/music')({
  component: Music,
  head: () => ({
    meta: [
      { title: `Music · ${site.name}` },
      {
        name: 'description',
        content:
          'Listen to Toys From Taiwan — 100% live-looped jams on Bandcamp, Spotify, Apple Music, and YouTube Music.',
      },
    ],
  }),
})

function Music() {
  return (
    <>
      <Section title="The Music" eyebrow="Discography" as="h1">
        {releases.map((release) => (
          <article
            key={release.slug}
            className="card-glass flex flex-col gap-8 p-6 sm:p-10 lg:flex-row"
          >
            <div className="mx-auto w-full max-w-sm shrink-0 lg:mx-0">
              <BandcampEmbed release={release} />
            </div>
            <div>
              <h3 className="wordmark m-0 text-3xl text-ink">{release.title}</h3>
              <p className="m-0 mt-1 text-sm font-semibold uppercase tracking-widest text-muted">
                {release.trackCount} tracks ·{' '}
                {new Date(release.releaseDate + 'T00:00:00').toLocaleDateString(
                  'en-US',
                  { month: 'long', day: 'numeric', year: 'numeric' },
                )}
              </p>
              <p className="mt-4 text-ink">{release.blurb}</p>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {release.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-card-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <p className="mb-2 mt-6 font-semibold text-ink">Listen everywhere:</p>
              <PlatformPillRow platforms={streaming} />
              <p className="mt-4 text-sm text-muted">
                Bandcamp is name-your-price — it&apos;s the best way to directly
                support the project.
              </p>
            </div>
          </article>
        ))}
        <p className="mt-6 text-center text-muted">
          More releases are on the way — new jams loop to life every week.
        </p>
      </Section>

      <Section title="Watch the Loops Happen" eyebrow="Video & live streams">
        <div className="grid gap-5 sm:grid-cols-3">
          {socials
            .filter((s) => ['youtube', 'tiktok', 'twitch'].includes(s.id))
            .map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="card-glass group flex flex-col items-center gap-3 p-6 text-center no-underline transition hover:border-accent"
              >
                <SpriteIcon
                  name={s.icon}
                  className="h-10 w-10 text-ink transition group-hover:text-accent"
                />
                <span className="text-lg font-bold text-ink">{s.label}</span>
                <span className="text-sm text-muted">{s.note}</span>
              </a>
            ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-muted">
          Every video short is a real live loop — the album versions on{' '}
          <span className="font-semibold">Shorts! Vol. 1</span> are the same
          takes you see being built on screen, one layer at a time.
        </p>
      </Section>
    </>
  )
}
