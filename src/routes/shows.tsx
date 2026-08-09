import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { ShowList } from '../components/ShowList'
import { SpriteIcon } from '../components/SpriteIcon'
import { site } from '../data/site'
import { pastShows, sortShows, upcomingShows } from '../data/shows'

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
          <div className="card-glass flex flex-col items-center gap-4 p-8 text-center sm:p-12">
            <SpriteIcon name="icon-calendar" className="h-12 w-12 text-accent" />
            <h3 className="m-0 text-xl font-bold text-ink">Booking soon!</h3>
            <p className="m-0 max-w-2xl text-muted">
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
              className="btn-3d btn-3d-accent rounded-md bg-accent px-6 py-2.5 font-semibold text-accent-ink no-underline transition hover:bg-accent-strong"
            >
              Invite me to play
            </a>
          </div>
        )}
      </Section>

      <Section title="Rooms the Loops Have Filled" eyebrow="Past shows">
        <ShowList shows={past} />
        <p className="mt-6 text-center text-sm text-muted">
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
          className="mt-4 inline-block btn-3d btn-3d-accent rounded-md bg-accent px-7 py-3 font-semibold text-accent-ink no-underline shadow-lg transition hover:bg-accent-strong"
        >
          Book Toys From Taiwan
        </a>
      </Section>
    </>
  )
}
