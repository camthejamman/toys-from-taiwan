import { createFileRoute } from '@tanstack/react-router'
import { Section } from '../components/Section'
import { SocialStrip } from '../components/SocialStrip'
import { SpriteIcon } from '../components/SpriteIcon'
import { payments, site, socials, streaming } from '../data/site'
import derp from '../assets/images/derp.jpg'

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
      <Section title="Feelin' Tipsy?" eyebrow="$$ Support the jams $$" center as="h1">
        <p className="mx-auto -mt-2 max-w-xl text-muted">
          Tap a card below to send a tip — every single one keeps the loops
          looping. Thank you!
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-3">
          {payments.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="card-glass group flex flex-col items-center gap-3 p-6 no-underline transition hover:border-accent hover:shadow-xl"
            >
              <SpriteIcon
                name={p.icon}
                className="h-12 w-12 text-ink transition group-hover:scale-110 group-hover:text-accent"
              />
              <span className="text-lg font-bold text-ink">{p.label}</span>
              <span className="rounded-full border border-card-border bg-card px-3 py-1 text-sm font-semibold text-muted">
                {p.handle}
              </span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Thank You" center>
        <div className="card-glass mx-auto max-w-2xl p-6 text-center sm:p-10">
          <div
            className="mx-auto flex items-center justify-center gap-2 text-accent"
            aria-hidden="true"
          >
            <SpriteIcon name="icon-heart" className="h-6 w-6" />
            <SpriteIcon name="icon-heart" className="h-8 w-8" />
            <SpriteIcon name="icon-heart" className="h-6 w-6" />
          </div>
          <p className="mt-5 text-ink">
            I am truly passionate about creating live music, and I sincerely
            appreciate your visit and contribution to my work! Your support and
            encouragement mean the world to me. Please spread the word with
            your friends and loved ones about Toys From Taiwan! Thanks again,
            and I hope to play for you someday soon!
          </p>
          <img
            src={derp}
            alt="Goofy cartoon drawing of Jam's face"
            width={500}
            height={296}
            className="mx-auto mt-6 w-full max-w-xs rounded-2xl border border-card-border"
            loading="lazy"
          />
        </div>
      </Section>

      <Section title="Free Ways to Support" center>
        <p className="mx-auto -mt-2 mb-6 max-w-xl text-muted">
          No tip required — following, subscribing, sharing a video, or adding
          a track to a playlist helps just as much.
        </p>
        <SocialStrip platforms={[...socials, ...streaming]} iconClassName="h-8 w-8" />
      </Section>
    </>
  )
}
