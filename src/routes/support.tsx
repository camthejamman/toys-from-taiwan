import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { SocialStrip } from '../components/SocialStrip'
import { SpriteIcon } from '../components/SpriteIcon'
import { payments, site, socials, streaming } from '../data/site'
import jamFace from '../assets/images/jam-face.jpg'

export const Route = createFileRoute('/support')({
  component: Support,
  head: () => ({
    meta: [
      { title: `Support · ${site.name}` },
      {
        name: 'description',
        content:
          'Support Toys From Taiwan — send a tip via Cash App, Venmo, or PayPal, or just follow and share the jams.',
      },
    ],
  }),
})

function Support() {
  return (
    <>
      <Section title="Feelin' Tipsy?" eyebrow="Support the jams" center as="h1">
        <p className="mx-auto -mt-2 max-w-xl text-muted">
          Tap a card below to send a tip — every single one keeps the loops
          looping. Thank you!
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl gap-5 md:grid-cols-3 lg:max-w-4xl xl:max-w-5xl xl:gap-6">
          {payments.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="card-glass group flex flex-col items-center gap-3 p-6 no-underline transition hover:border-accent hover:shadow-xl lg:p-8"
            >
              <SpriteIcon
                name={p.icon}
                className="h-14 w-14 text-ink transition group-hover:scale-110 group-hover:text-accent lg:h-16 lg:w-16"
              />
              <span className="text-lg font-bold text-ink lg:text-xl">{p.label}</span>
              <span className="btn-3d max-w-full rounded-md border border-card-border bg-card px-3 py-1 text-center text-sm font-semibold wrap-anywhere text-muted lg:text-base">
                {p.handle}
              </span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Thank You" center>
        <div className="card-glass relative mx-auto max-w-2xl p-6 text-center sm:p-10 lg:max-w-3xl">
          {/* a heart in every corner */}
          <div aria-hidden="true">
            <SpriteIcon name="icon-heart" className="absolute left-4 top-4 h-6 w-6 text-[#d84c4c]" />
            <SpriteIcon name="icon-heart" className="absolute right-4 top-4 h-6 w-6 text-[#d84c4c]" />
            <SpriteIcon name="icon-heart" className="absolute bottom-4 left-4 h-6 w-6 text-[#d84c4c]" />
            <SpriteIcon name="icon-heart" className="absolute bottom-4 right-4 h-6 w-6 text-[#d84c4c]" />
          </div>
          <div
            className="mx-auto flex items-center justify-center gap-2 text-[#d84c4c]"
            aria-hidden="true"
          >
            <SpriteIcon name="icon-heart" className="h-8 w-8" />
            <SpriteIcon name="icon-heart" className="h-10 w-10" />
            <SpriteIcon name="icon-heart" className="h-8 w-8" />
          </div>
          <p className="mt-5 text-ink">
            I am truly passionate about creating live music, and I sincerely
            appreciate your visit and contribution to my work! Your support and
            encouragement mean the world to me. Please spread the word with
            your friends and loved ones about Toys From Taiwan! Thanks again,
            and I hope to play for you someday soon!
          </p>
          <img
            src={jamFace}
            alt="Cartoon drawing of Jam's face"
            width={160}
            height={160}
            className="mx-auto mt-6 h-64 w-64 rounded-full border-2 border-card-border object-cover shadow-lg lg:h-80 lg:w-80"
            loading="lazy"
          />
        </div>
      </Section>

      <Section title="Free Ways to Support" center>
        <p className="mx-auto -mt-2 mb-6 max-w-xl text-muted">
          No tip required — following, subscribing, sharing a video, or adding
          a track to a playlist helps just as much.
        </p>
        <SocialStrip
          platforms={[...socials, ...streaming]}
          className="lg:gap-7"
          iconClassName="h-8 w-8 lg:h-10 lg:w-10"
        />
      </Section>
    </>
  )
}
