import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { SpriteIcon } from '../components/SpriteIcon'
import { Wordmark3D } from '../components/Wordmark3D'
import { ICON_COLORS } from '../lib/rainbow'
import { site } from '../data/site'
import rigPhoto from '../assets/images/rig-photo.jpg'

export const Route = createFileRoute('/about')({
  component: About,
  head: () => ({
    meta: [
      { title: `About · ${site.name}` },
      {
        name: 'description',
        content:
          'About Toys From Taiwan — a 100% live-looping one-man jam band from Jacksonville Beach, FL.',
      },
    ],
  }),
})

/** The six vibe cards, carried over from the original site. */
const vibeCards = [
  {
    title: '100%',
    icon: 'icon-tv',
    instrument: 'icon-guitar',
    quote: 'Live Looping Jams',
    items: ['Live Looping Jams', 'No Backing Tracks', 'In Real Time', 'On The Fly'],
  },
  {
    title: 'Live',
    icon: 'icon-headphones',
    instrument: 'icon-bongos',
    quote: 'Music To Help You Relax',
    items: ['Singing & Songwriting', 'Instrumental Jams', 'Experimentation', 'Improvisation'],
  },
  {
    title: 'Looping',
    icon: 'icon-equalizer2',
    instrument: 'icon-keys',
    quote: 'JAM Plays It All',
    items: ['Acoustic/Electric Guitars', 'Keyboards & Gizmos', 'Drum Machines', 'Bass Guitar'],
  },
  {
    title: 'Playing',
    icon: 'icon-music',
    instrument: 'icon-vibes',
    quote: 'Really Chill Vibes',
    items: ['Psychedelic Midi Jams', 'Midi Hawaiian Slide', 'Spacey Midi Rock', "Midi Sambas"],
  },
  {
    title: 'Trippy',
    icon: 'icon-video-camera',
    instrument: 'icon-drums',
    quote: 'For Melting Into The Couch',
    items: ['Ambient Spaces', 'Soundscapes', 'Guitar Solos', 'Island Vibes'],
  },
  {
    title: 'Sounds',
    icon: 'icon-mic',
    instrument: 'icon-synth',
    quote: "90's Hippie Weather Channel",
    items: ['Relaxing', 'Jammy', 'Funky', 'Retro'],
  },
] as const

function About() {
  return (
    <>
      <Section title="Toys From Taiwan" eyebrow="About" as="h1">
        <div className="card-glass p-6 sm:p-8">
          <p className="mt-0 text-ink">
            Hi, I&apos;m Jam, and these are my Toys From Taiwan. Thanks for stopping
            by! Here&apos;s a little bit about me and my music project:
          </p>
          {/* two prose columns at xl — plain block divs below xl, so the
              stacked rhythm is unchanged there */}
          <div className="xl:grid xl:grid-cols-2 xl:gap-x-10">
            <div>
              <h3 className="mb-2 mt-6 text-lg font-bold text-ink">About Me</h3>
              <p className="m-0 text-ink">
                I specialize in creating 100% live looping songs and jams. Every
                beat, melody, and rhythm you hear is crafted in real time, with no
                backing tracks or any pre-recorded music. I use a bunch of loop
                machines and effects pedals to put it all together. I play guitar,
                bass, keyboard, and I put together random jams on the fly with some
                singing in between!
              </p>
            </div>
            <div>
              <h3 className="mb-2 mt-6 text-lg font-bold text-ink">The Music</h3>
              <p className="m-0 text-ink">
                Experience deep relaxation through dynamic and spontaneous jams in
                the Jam Lounge. Truly, every jam I make is an improvised arrangement
                of sound, rhythm, and melody, brought to life before your ears. And
                it&apos;s all live and made in real time! Come check out my show
                soon. I bet you&apos;ll dig it! I&apos;m looking forward to playing
                for you!
              </p>
            </div>
          </div>
          <p className="m-0 mt-4 font-bold text-ink">
            — JAM <span title={site.artist}>{site.artistChinese}</span>
          </p>
        </div>
      </Section>

      <Section title="The Vibes" eyebrow="What you'll hear">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {vibeCards.map((card, i) => (
            <article key={card.title} className="card-glass flex flex-col p-6">
              <div className="flex items-center justify-between">
                <h3 className="m-0 text-2xl">
                  <Wordmark3D text={card.title} />
                </h3>
                <SpriteIcon
                  name={card.icon}
                  className="h-6 w-6 text-muted icon-3d dark:text-ink"
                  tint={ICON_COLORS[i % ICON_COLORS.length]}
                />
              </div>
              <ul className="my-4 flex list-none flex-col gap-1.5 p-0 font-medium italic text-ink">
                {card.items.map((item) => (
                  <li key={item} className="flex items-baseline gap-2">
                    <span className="text-accent" aria-hidden="true">
                      –
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col items-center gap-2 pt-2">
                <SpriteIcon
                  name={card.instrument}
                  className="h-24 w-24 text-accent icon-3d dark:text-ink lg:h-28 lg:w-28"
                  tint={ICON_COLORS[i % ICON_COLORS.length]}
                />
                <p className="m-0 text-center text-sm font-semibold text-muted">
                  “{card.quote}”
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="The Rig" eyebrow="Toys, gizmos & gear">
        <div className="card-glass flex flex-col items-center gap-6 p-6 sm:p-8 lg:flex-row xl:gap-10">
          {/* 3D rendering of the actual live-looping rig — the copy next
              to it is the description */}
          <img
            src={rigPhoto}
            alt="3D rendering of Jam's live-looping rig: guitar, dual keyboards, HandSonic, loop pedals, and a boom mic with tablet"
            width={1700}
            height={1010}
            className="h-64 w-64 shrink-0 rounded-full border-2 border-card-border object-cover shadow-lg sm:h-72 sm:w-72 lg:h-80 lg:w-80 xl:h-96 xl:w-96"
            loading="lazy"
          />
          <div>
            <p className="mt-0 text-ink">
              The one-man band runs on a small mountain of musical toys:
              acoustic and electric guitars, bass, keyboards and pads, drum
              machines, bongos, mystery instruments, a pile of effects pedals —
              and up to three loopers stacking it all together in real time.
            </p>
            <p className="m-0 text-muted">
              I may also have some ambient nature sounds playing in the
              background from time to time, so it&apos;s a very relaxing,
              refreshing kind of vibe.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
