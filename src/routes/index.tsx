import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { HeroTitle } from '../components/HeroTitle'
import { Wordmark3D } from '../components/Wordmark3D'
import { JamStudio } from '../components/JamStudio'
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
    tint: '#d6437f',
    title: '100% Live',
    text: 'Every beat, melody, and rhythm is looped on the spot. No backing tracks, ever.',
  },
  {
    icon: 'icon-rockstar',
    tint: '#2a92c4',
    title: 'One-Man Band',
    text: 'Guitar, bass, keys, bongos, drum machines, and gizmos — all played and stacked live.',
  },
  {
    icon: 'icon-tv',
    tint: '#2f9e53',
    title: 'Video-Game Vibes',
    text: 'Cheesy midi sounds, chill grooves, and retro N64-flavored jams to relax to.',
  },
] as const

function Home() {
  const nextShow = sortShows(upcomingShows, 'asc')[0]
  const featured = releases[0]

  // The hero holds TWO scenes (3D title + instrument tableau). Neither
  // reveals until both have settled (first frame painted, or failed), so
  // the loading gears hold until the whole hero can appear at once.
  const [titleSettled, setTitleSettled] = useState(false)
  const [studioSettled, setStudioSettled] = useState(false)
  const reveal = titleSettled && studioSettled

  return (
    <>
      {/* hero */}
      {/* the hero runs wider than the card sections at 2xl — the studio
          canvas is transparent, so it can stretch toward the deco gutters
          without burying them the way an opaque card would */}
      <section className="mx-auto flex max-w-6xl flex-col items-center overflow-x-clip px-4 pb-10 pt-6 text-center 2xl:max-w-[88rem] min-[1800px]:max-w-[96rem]">
        {/* Fluid clamp keeps the single-line wordmark inside 320px+ phones;
            overflow-x-clip stops the canvas bleed from widening the page. */}
        <HeroTitle
          text={site.name}
          subtitle={site.tagline}
          onSettled={() => setTitleSettled(true)}
          reveal={reveal}
        />
        {/* the jam-studio tableau; the copy below restates it for SEO/AT */}
        <JamStudio
          onSettled={() => setStudioSettled(true)}
          reveal={reveal}
        />
        <p className="mt-2 text-balance text-3xl uppercase sm:text-4xl xl:text-5xl">
          <Wordmark3D text={site.name} />
        </p>
        <p className="mt-1 text-lg text-muted xl:text-xl">
          A live-looping one man midi jam band based in sunny Florida!
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/music"
            className="btn-3d btn-3d-accent w-full rounded-md bg-accent px-7 py-3 text-center font-semibold text-accent-ink no-underline shadow-lg transition hover:bg-accent-strong sm:w-auto lg:px-9 lg:py-3.5 lg:text-lg"
          >
            Listen to the Music
          </Link>
          <Link
            to="/contact"
            className="btn-3d w-full rounded-md border border-card-border bg-card px-7 py-3 text-center font-semibold text-ink no-underline backdrop-blur transition hover:border-accent hover:text-accent sm:w-auto lg:px-9 lg:py-3.5 lg:text-lg"
          >
            Book a Show
          </Link>
        </div>
        <SocialStrip
          platforms={[...socials, ...streaming]}
          className="mt-12 max-sm:max-w-48 lg:gap-8"
          iconClassName="h-12 w-12 lg:h-14 lg:w-14"
        />
      </section>

      {/* what the show is */}
      <Section title="The Show" eyebrow="What is this?" center>
        <div className="grid gap-5 md:grid-cols-3 xl:gap-8">
          {highlights.map((h) => (
            <article key={h.title} className="card-glass p-6 text-center xl:p-8">
              <SpriteIcon
                name={h.icon}
                className="mx-auto h-20 w-20 text-accent icon-3d dark:text-ink xl:h-24 xl:w-24"
                tint={h.tint}
              />
              <h3 className="mb-2 mt-4 text-lg font-bold text-ink xl:text-xl">{h.title}</h3>
              <p className="m-0 text-muted">{h.text}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-muted xl:max-w-3xl xl:text-lg">
          It&apos;s a very relaxing, refreshing kind of vibe — musically engaging,
          but at a comfortable volume, so you and your friends can hang out and
          talk without yelling over the music.
        </p>
      </Section>

      {/* featured release */}
      <Section title={featured.title} eyebrow="Latest release">
        <div className="card-glass flex flex-col items-center gap-8 p-6 sm:p-10 md:flex-row xl:gap-12">
          <Link
            to="/music"
            className="block w-full max-w-xs shrink-0 overflow-hidden rounded-lg shadow-xl transition hover:scale-[1.02] xl:max-w-sm"
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
            <p className="rainbow-text mb-3 mt-1 text-2xl font-extrabold sm:text-3xl xl:text-4xl">
              Live-looped video-game jams
            </p>
            <p className="text-ink xl:text-lg">{featured.blurb}</p>
            <PlatformPillRow platforms={streaming} className="mt-5" />
          </div>
        </div>
      </Section>

      {/* live online + next show, paired with Meet JAM into one row at xl
          so wide screens get a composed 2-column band instead of two
          shallow full-width sections */}
      <div className="xl:mx-auto xl:grid xl:max-w-6xl xl:grid-cols-2 2xl:max-w-7xl">
      <Section title="Catch a Jam" eyebrow="Live & upcoming">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <article className="card-glass p-6">
            <div className="flex items-center gap-3">
              <SpriteIcon
                name="icon-tiktok"
                className="h-8 w-8 text-accent icon-3d dark:text-ink"
                tint="#2fa39a"
              />
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
              <SpriteIcon
                name="icon-calendar"
                className="h-8 w-8 text-accent icon-3d dark:text-ink"
                tint="#d97e2e"
              />
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
              className="mt-2 inline-block btn-3d rounded-md border border-card-border bg-card px-5 py-2 text-sm font-semibold text-accent no-underline transition hover:border-accent"
            >
              All shows
            </Link>
          </article>
        </div>
      </Section>

      {/* meet jam + support strip; at xl the section is a flex column and
          the card grows, so it matches the combined height of the two
          Catch a Jam cards beside it (items-start keeps the heading's
          rainbow-bar shrink-wrap intact) */}
      <Section
        title="Meet JAM"
        eyebrow="The human behind the loops"
        className="xl:flex xl:flex-col xl:items-start"
      >
        <div className="card-glass flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8 xl:w-full xl:grow">
          <img
            src={jamFace}
            alt="Cartoon drawing of Jam's face"
            width={160}
            height={160}
            className="h-48 w-48 rounded-full border-2 border-card-border object-cover shadow-lg xl:h-56 xl:w-56"
            loading="lazy"
          />
          <div>
            <p className="mt-0 text-ink xl:text-lg">
              Thanks for visiting my site! I&apos;m a solo musician based in
              sunny {site.location}. I put on a{' '}
              <strong>live one-man-band</strong> show that&apos;s unlike any solo
              act you&apos;ve ever seen — a nonstop,{' '}
              <strong>100% live-looped</strong>, instrumental jam session filled
              with cheesy midi video game sounds!
            </p>
            {/* grid, not flex-wrap: equal-width tracks keep the two buttons
                the same size — w-fit shrinks the pair to the wider label */}
            <div className="mt-6 grid w-full gap-3 sm:w-fit md:grid-cols-2 xl:grid-cols-1">
              <Link
                to="/about"
                className="btn-3d rounded-md border border-card-border bg-card px-5 py-2 text-center text-sm font-semibold text-accent no-underline transition hover:border-accent"
              >
                More about the project
              </Link>
              <Link
                to="/support"
                className="inline-flex items-center justify-center gap-2 btn-3d rounded-md border border-card-border bg-card px-5 py-2 text-sm font-semibold text-accent no-underline transition hover:border-accent"
              >
                <SpriteIcon name="icon-heart" className="h-4 w-4" />
                Support the jams
              </Link>
            </div>
          </div>
        </div>
      </Section>
      </div>
    </>
  )
}
