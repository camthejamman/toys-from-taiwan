import { Link, createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { SocialStrip } from '../components/SocialStrip'
import { PlatformPillRow } from '../components/PlatformPill'
import { SpriteIcon } from '../components/SpriteIcon'
import { site, socials, streaming } from '../data/site'
import { releases } from '../data/releases'
import { sortShows, upcomingShows, formatShowDate } from '../data/shows'
import jamFace from '../assets/images/jam-face.jpg'

export const Route = createFileRoute('/')({
  component: Home,
})

const highlights = [
  {
    icon: 'icon-record',
    title: '100% Live',
    text: 'Every beat, melody, and rhythm is looped on the spot. No backing tracks, ever.',
  },
  {
    icon: 'icon-equalizer2',
    title: 'One-Man Band',
    text: 'Guitar, bass, keys, bongos, drum machines, and gizmos — all played and stacked live.',
  },
  {
    icon: 'icon-tv',
    title: 'Video-Game Vibes',
    text: 'Cheesy midi sounds, chill grooves, and retro N64-flavored jams to relax to.',
  },
] as const

function Home() {
  const nextShow = sortShows(upcomingShows, 'asc')[0]
  const featured = releases[0]

  return (
    <>
      {/* hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-10 pt-16 text-center sm:pt-24">
        <h1 className="wordmark m-0 text-4xl leading-tight text-ink sm:text-6xl lg:text-7xl">
          {site.name}
        </h1>
        <p className="mt-4 text-xl font-semibold text-ink sm:text-2xl">
          {site.tagline}{' '}
          <span className="wordmark text-muted" title={site.artist}>
            {site.artistChinese}
          </span>
        </p>
        <p className="mt-1 text-muted">
          A one-man live-looping jam band from {site.location}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/music"
            className="rounded-full bg-accent px-7 py-3 font-semibold text-accent-ink no-underline shadow-lg transition hover:bg-accent-strong"
          >
            Listen to the Music
          </Link>
          <Link
            to="/contact"
            className="rounded-full border border-card-border bg-card px-7 py-3 font-semibold text-ink no-underline backdrop-blur transition hover:border-accent hover:text-accent"
          >
            Book a Show
          </Link>
        </div>
        <SocialStrip
          platforms={[...socials, ...streaming]}
          className="mt-9"
          iconClassName="h-7 w-7"
        />
      </section>

      {/* what the show is */}
      <Section title="The Show" eyebrow="What is this?" center>
        <div className="grid gap-5 sm:grid-cols-3">
          {highlights.map((h) => (
            <article key={h.title} className="card-glass p-6 text-center">
              <SpriteIcon
                name={h.icon}
                className="mx-auto h-10 w-10 text-accent"
              />
              <h3 className="mb-2 mt-4 text-lg font-bold text-ink">{h.title}</h3>
              <p className="m-0 text-muted">{h.text}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-muted">
          It&apos;s a very relaxing, refreshing kind of vibe — musically engaging,
          but at a comfortable volume, so you and your friends can hang out and
          talk without yelling over the music.
        </p>
      </Section>

      {/* featured release */}
      <Section title={featured.title} eyebrow="Latest release">
        <div className="card-glass flex flex-col items-center gap-8 p-6 sm:p-10 md:flex-row">
          <Link
            to="/music"
            className="block w-full max-w-xs shrink-0 overflow-hidden rounded-2xl shadow-xl transition hover:scale-[1.02]"
            aria-label={`${featured.title} — listen on the Music page`}
          >
            <img
              src={featured.cover}
              alt={featured.coverAlt}
              width={700}
              height={700}
              className="block w-full"
              loading="lazy"
            />
          </Link>
          <div>
            <p className="m-0 text-sm font-semibold uppercase tracking-widest text-muted">
              {featured.trackCount} tracks · {featured.year}
            </p>
            <p className="rainbow-text mb-3 mt-1 text-2xl font-extrabold sm:text-3xl">
              Live-looped video-game jams
            </p>
            <p className="text-ink">{featured.blurb}</p>
            <PlatformPillRow platforms={streaming} className="mt-5" />
          </div>
        </div>
      </Section>

      {/* live online + next show */}
      <Section title="Catch a Jam" eyebrow="Live & upcoming">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="card-glass p-6">
            <div className="flex items-center gap-3">
              <SpriteIcon name="icon-tiktok" className="h-8 w-8 text-accent" />
              <h3 className="m-0 text-lg font-bold text-ink">Live online</h3>
            </div>
            <p className="mb-4 mt-3 text-muted">
              Live-looping streams on TikTok every Thursday at 9:30pm ET, plus
              streams and archives on Twitch and YouTube.
            </p>
            <PlatformPillRow
              platforms={socials.filter((s) =>
                ['tiktok', 'twitch', 'youtube'].includes(s.id),
              )}
            />
          </article>

          <article className="card-glass p-6">
            <div className="flex items-center gap-3">
              <SpriteIcon name="icon-calendar" className="h-8 w-8 text-accent" />
              <h3 className="m-0 text-lg font-bold text-ink">
                {nextShow ? 'Next show' : 'Shows'}
              </h3>
            </div>
            {nextShow ? (
              <>
                <p className="mb-1 mt-3 font-semibold text-ink">
                  {formatShowDate(nextShow.date)}
                  {nextShow.time ? ` · ${nextShow.time}` : ''}
                </p>
                <p className="m-0 text-muted">
                  {nextShow.venue} — {nextShow.city}
                </p>
              </>
            ) : (
              <p className="mb-4 mt-3 text-muted">
                Booking new shows around Jacksonville and St. Augustine right
                now — check the shows page and keep an eye out for updates!
              </p>
            )}
            <Link
              to="/shows"
              className="mt-2 inline-block rounded-full border border-card-border bg-card px-5 py-2 text-sm font-semibold text-accent no-underline transition hover:border-accent"
            >
              All shows
            </Link>
          </article>
        </div>
      </Section>

      {/* meet jam + support strip */}
      <Section title="Meet JAM" eyebrow="The human behind the loops">
        <div className="card-glass flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
          <img
            src={jamFace}
            alt="Cartoon drawing of Jam's face"
            width={160}
            height={160}
            className="h-32 w-32 rounded-full border-2 border-card-border object-cover shadow-lg"
            loading="lazy"
          />
          <div>
            <p className="mt-0 text-ink">
              Thanks for visiting my site! I&apos;m a solo musician based in
              sunny {site.location}. I put on a{' '}
              <strong>live one-man-band</strong> show that&apos;s unlike any solo
              act you&apos;ve ever seen — a nonstop,{' '}
              <strong>100% live-looped</strong>, instrumental jam session filled
              with cheesy midi video game sounds!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/about"
                className="rounded-full border border-card-border bg-card px-5 py-2 text-sm font-semibold text-accent no-underline transition hover:border-accent"
              >
                More about the project
              </Link>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-5 py-2 text-sm font-semibold text-accent no-underline transition hover:border-accent"
              >
                <SpriteIcon name="icon-heart" className="h-4 w-4" />
                Support the jams
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
