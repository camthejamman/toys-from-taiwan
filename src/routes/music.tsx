import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { BandcampEmbed } from '../components/BandcampEmbed'
import { PlatformPillRow } from '../components/PlatformPill'
import { SpriteIcon } from '../components/SpriteIcon'
import { Wordmark3D } from '../components/Wordmark3D'
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
        {releases.map((release, i) => (
          <article
            key={release.slug}
            className="card-glass flex flex-col gap-8 p-6 sm:p-10 lg:flex-row xl:gap-12"
          >
            <div className="mx-auto w-full max-w-sm shrink-0 lg:mx-0 xl:max-w-md">
              <BandcampEmbed release={release} />
            </div>
            <div>
              <h3 className="m-0 text-2xl sm:text-3xl">
                <Wordmark3D text={release.title} />
              </h3>
              <p className="m-0 mt-1 text-sm font-semibold uppercase tracking-widest text-muted">
                {release.trackCount} tracks ·{' '}
                <span className="whitespace-nowrap">
                  {new Date(release.releaseDate + 'T00:00:00').toLocaleDateString(
                    'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' },
                  )}
                </span>
              </p>
              <p className="mb-4 mt-4 text-ink">{release.blurb}</p>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {release.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md border border-card-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted"
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
              {/* closing note for the whole discography — guarded to the last
                  card so it can't repeat once a second release lands */}
              {i === releases.length - 1 ? (
                <p className="mt-2 text-sm text-muted">
                  More releases are on the way — new jams loop to life every
                  week.
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </Section>

      <Section title="Watch Live Loops" eyebrow="Video & live streams">
        <div className="grid gap-5 md:grid-cols-3 xl:gap-6">
          {socials
            .filter((s) => ['youtube', 'tiktok', 'twitch'].includes(s.id))
            .map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="card-glass group flex flex-col items-center gap-3 p-6 text-center no-underline transition hover:border-accent lg:p-8"
              >
                <SpriteIcon
                  name={s.icon}
                  className="h-10 w-10 text-ink transition group-hover:text-accent lg:h-12 lg:w-12"
                  tint={s.color}
                />
                <span className="text-lg font-bold text-ink lg:text-xl">{s.label}</span>
                <span className="text-sm text-muted lg:text-base">{s.note}</span>
              </a>
            ))}
        </div>
        <p className="mx-auto mt-20 max-w-2xl text-center text-muted">
          Every video short is a real live loop — the album versions on{' '}
          <span className="font-semibold">Shorts! Vol. 1</span> are the same
          takes you see being built on screen, one layer at a time.
        </p>
      </Section>
    </>
  )
}
