import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { SpriteIcon } from '../components/SpriteIcon'
import { site } from '../data/site'
import jamFace from '../assets/images/jam-face.jpg'

export const Route = createFileRoute('/contact')({
  component: Contact,
  head: () => ({
    meta: [
      { title: `Contact & Booking · ${site.name}` },
      {
        name: 'description',
        content:
          'Book Toys From Taiwan for your venue or event — contact Jam directly by email or phone.',
      },
    ],
  }),
})

/** "How Much Music Stuff Should I Bring?" — the three rig tiers. */
const rigTiers = [
  {
    name: 'SOME STUFF',
    pitch: "I'll travel lite and set up quickly!",
    icon: 'icon-record',
    tint: '#2a92c4', // blue
    gear: ['1 Looper', 'Drum Machine / Percussion', 'Electric Guitar', 'Effects', 'Maybe more!'],
  },
  {
    name: 'MOST STUFF',
    pitch: "Now I'll really start jamming out!",
    icon: 'icon-drums',
    tint: '#d97e2e', // orange
    gear: [
      '2 Loopers',
      'Drum Machine / Percussion',
      'Electric Guitar',
      'Effects',
      'Mystery Instruments',
    ],
  },
  {
    name: 'ALL OF THE STUFF!',
    pitch: "I'll bring the whole rig and get really weird!",
    icon: 'icon-rockstar',
    tint: '#d6437f', // pink
    gear: [
      '3 Loopers',
      'Drum Machines / Percussions',
      'Electric Synth Guitar',
      'Keyboards & Pads',
      'Mystery Instruments & Gizmos',
      'All My Effects',
    ],
    featured: true,
  },
] as const

function Contact() {
  return (
    <>
      <Section title="Get in Touch" eyebrow="Contact & booking" as="h1">
        <div className="card-glass flex flex-col-reverse items-center gap-8 p-6 sm:flex-row sm:justify-between sm:p-10">
          <div>
          <ul className="m-0 flex list-none flex-col gap-4 p-0 lg:gap-5">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="group flex items-start gap-3 text-ink no-underline transition hover:text-accent"
              >
                <SpriteIcon name="icon-envelop" className="h-6 w-6 text-accent transition group-hover:text-accent dark:text-ink dark:group-hover:text-accent lg:h-7 lg:w-7" />
                <span className="font-semibold lg:text-lg">{site.email}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phone}`}
                className="group flex items-start gap-3 text-ink no-underline transition hover:text-accent"
              >
                <SpriteIcon name="icon-phone" className="h-6 w-6 text-accent transition group-hover:text-accent dark:text-ink dark:group-hover:text-accent lg:h-7 lg:w-7" />
                <span className="font-semibold lg:text-lg">{site.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a
                href={site.linktree}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 text-ink no-underline transition hover:text-accent"
              >
                <SpriteIcon name="icon-eye" className="h-6 w-6 text-accent transition group-hover:text-accent dark:text-ink dark:group-hover:text-accent lg:h-7 lg:w-7" />
                <span className="font-semibold lg:text-lg">Jam on the Web (Linktree)</span>
              </a>
            </li>
          </ul>
          <p className="mb-0 mt-6 max-w-xl text-muted">
            Booking a brewery night, coffee-shop afternoon, private party, or
            something weirder? Email is the fastest way to reach me — tell me
            the date, the space, and the vibe you&apos;re after.
          </p>
          </div>
          <img
            src={jamFace}
            alt="Cartoon drawing of Jam's face"
            width={180}
            height={180}
            className="h-40 w-40 rounded-full border-2 border-photo-border object-cover shadow-lg lg:h-52 lg:w-52"
            loading="lazy"
          />
        </div>
      </Section>

      <Section title="“How Much Music Stuff Should I Bring?”" eyebrow="Pick your rig">
        <div className="grid gap-5 md:grid-cols-3 xl:gap-6">
          {rigTiers.map((tier) => (
            <article
              key={tier.name}
              className={`card-glass flex flex-col p-6 ${
                'featured' in tier && tier.featured ? 'ring-2 ring-accent' : ''
              }`}
            >
              <SpriteIcon
                name={tier.icon}
                className="mx-auto h-28 w-28 text-accent icon-3d dark:text-ink sm:h-32 sm:w-32 lg:h-36 lg:w-36 xl:h-40 xl:w-40"
                tint={tier.tint}
              />
              <h3 className="mb-1 mt-4 text-center text-lg font-extrabold text-ink">
                {tier.name}
              </h3>
              <p className="m-0 text-center text-sm italic text-muted">
                {tier.pitch}
              </p>
              <p className="mb-2 mt-5 font-bold text-ink">
                Here&apos;s what I&apos;ll bring:
              </p>
              <ul className="m-0 flex grow list-none flex-col gap-1.5 p-0 text-ink">
                {tier.gear.map((item) => (
                  <li key={item} className="flex items-baseline gap-2">
                    <span className="text-accent" aria-hidden="true">
                      –
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${site.email}?subject=Booking%3A%20${encodeURIComponent(tier.name)}`}
                className="mt-6 btn-3d btn-3d-accent rounded-md bg-accent px-5 py-2 text-center font-semibold text-accent-ink no-underline transition hover:bg-accent-strong lg:px-6 lg:py-2.5"
              >
                Book Now!
              </a>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}
