import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { ShowList } from '../components/ShowList'
import { SpriteIcon } from '../components/SpriteIcon'
import { site } from '../data/site'
import { pastShows, sortShows, upcomingShows } from '../data/shows'
import jamFace from '../assets/images/jam-face.jpg'

/** Calendar confetti in the four corners of the "Booking soon!" card. */
const bookingCorners = [
  { pos: 'left-3 top-3 sm:left-4 sm:top-4', tint: '#d6437f' },
  { pos: 'right-3 top-3 sm:right-4 sm:top-4', tint: '#2a92c4' },
  { pos: 'bottom-3 left-3 sm:bottom-4 sm:left-4', tint: '#2f9e53' },
  { pos: 'bottom-3 right-3 sm:bottom-4 sm:right-4', tint: '#d97e2e' },
] as const

export const Route = createFileRoute('/shows')({
  component: Shows,
  head: () => ({
    meta: [
      { title: `Shows · ${site.name}` },
      {
        name: 'description',
        content:
          'Upcoming Toys From Taiwan live-looping shows around Jacksonville and St. Augustine, FL.',
      },
    ],
  }),
})

function Shows() {
  const upcoming = sortShows(upcomingShows, 'asc')
  const past = sortShows(pastShows, 'desc')

  return (
    <>
      <Section title="Upcoming Shows" eyebrow="Come hang" as="h1">
        {upcoming.length > 0 ? (
          <ShowList shows={upcoming} />
        ) : (
          <div className="card-glass relative flex flex-col items-center gap-6 p-8 sm:p-12 md:flex-row md:gap-14 lg:gap-20">
            {bookingCorners.map((corner) => (
              <SpriteIcon
                key={corner.pos}
                name="icon-calendar"
                className={`absolute ${corner.pos} h-5 w-5 text-accent icon-3d dark:text-ink sm:h-6 sm:w-6 lg:h-7 lg:w-7`}
                tint={corner.tint}
              />
            ))}
            <img
              src={jamFace}
              alt="Cartoon drawing of Jam's face"
              width={180}
              height={180}
              className="h-40 w-40 shrink-0 rounded-full border-2 border-photo-border object-cover shadow-lg md:ml-4 lg:ml-8 lg:h-52 lg:w-52"
              loading="lazy"
            />
            <div className="flex flex-col items-center gap-4 md:items-start">
              <h3 className="m-0 text-xl font-bold text-ink">Booking soon!</h3>
              <p className="m-0 max-w-2xl text-left text-muted">
                I am currently hard at work, meticulously scheduling and booking
                upcoming shows. I am passionate about live instrumental music and
                I&apos;m eager to perform in venues where original music is truly
                appreciated. While I&apos;ll primarily be performing locally in
                Jacksonville and St. Augustine, please don&apos;t hesitate to
                reach out if you&apos;d like me to visit your town and play for
                you!
              </p>
              <a
                href={`mailto:${site.email}?subject=Booking%20inquiry`}
                className="btn-3d btn-3d-accent rounded-md bg-accent px-6 py-2.5 font-semibold text-accent-ink no-underline transition hover:bg-accent-strong lg:px-7 lg:py-3 lg:text-lg"
              >
                Invite me to play
              </a>
            </div>
          </div>
        )}
      </Section>

      <Section title="Rooms the Loops Have Filled" eyebrow="Past shows">
        <ShowList shows={past} />
        <p className="mt-20 text-center text-sm text-muted">
          Plus live-looping streams online every week — see the music page for
          where to watch.
        </p>
      </Section>

      <Section title="Want the Jams at Your Venue?" center>
        <p className="mx-auto -mt-2 max-w-xl text-muted">
          Breweries, coffee shops, listening rooms, backyard hangs — the rig
          travels and the volume stays conversation-friendly.
        </p>
        <a
          href={`mailto:${site.email}?subject=Booking%20inquiry`}
          className="mt-4 inline-block btn-3d btn-3d-accent rounded-md bg-accent px-7 py-3 font-semibold text-accent-ink no-underline shadow-lg transition hover:bg-accent-strong lg:px-8 lg:py-3.5 lg:text-lg"
        >
          Book Toys From Taiwan
        </a>
      </Section>
    </>
  )
}
