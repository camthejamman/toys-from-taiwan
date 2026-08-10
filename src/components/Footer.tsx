import { SpriteIcon } from './SpriteIcon'
import { Wordmark3D } from './Wordmark3D'
import { ICON_COLORS } from '../lib/rainbow'
import { site, socials, streaming } from '../data/site'

export function Footer() {
  // mt-4 on phones, mt-16 from sm: 64px of dead space above the footer
  // pushed the platform icons off the screenful a reader lands on when they
  // reach the end of a page. Desktop has the room, so it keeps the gap.
  return (
    <footer className="mt-4 border-t border-card-border bg-card backdrop-blur-md sm:mt-16">
      {/* Below lg: the settled centered stack. From lg: a three-column
          band — brand left, page links center, platform icons right,
          copyright centered underneath — so the footer fills the width
          instead of staying phone-shaped. */}
      {/* Full-bleed on desktop (icons hug the left edge, back-to-top the
          right, like a proper wide footer); only beyond 1920px does the
          content re-center inside a cap. Mobile keeps the centered stack. */}
      <div className="mx-auto flex w-full flex-col items-center gap-8 px-4 py-6 sm:gap-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-x-10 lg:gap-y-1 lg:px-10 lg:py-3 min-[1920px]:max-w-[120rem]">
        {/* Size ladder tracks the LAYOUT, not just the width: sm–lg is
            still the centered stack with open space either side, so it
            keeps generous sizes; only at lg — where the footer becomes the
            three-column band and the pieces have to share a row — do they
            step back down to compact. */}
        {/* brand wordmark is mobile-only — wide screens already have it in
            the sticky header right above */}
        <p className="m-0 text-4xl sm:text-3xl lg:hidden">
          <Wordmark3D small text={site.name} />
        </p>

        {/* Phones: same treatment as the hero strip — an explicit 3-col
            grid at full width instead of a max-width wrap cap, so the 9
            icons stay 3+3+3 at every width while spreading across the
            footer. w-full is required because this stack is a centered
            column flex below lg (fit-content otherwise). All of it is
            max-sm-scoped so the sm one-row and lg justify-self-start
            layouts below are untouched. */}
        <ul
          className="m-0 flex max-w-48 list-none flex-wrap items-center justify-center gap-5 p-0 max-sm:grid max-sm:w-full max-sm:max-w-88 max-sm:grid-cols-3 max-sm:justify-items-center max-sm:gap-y-7 sm:max-w-none sm:gap-4 lg:col-start-1 lg:row-start-1 lg:translate-y-2.5 lg:justify-self-start lg:gap-5"
          aria-label="Social and streaming platforms"
        >
          {[...socials, ...streaming].map((p, i) => (
            <li key={p.id}>
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="block text-ink transition hover:scale-110 hover:text-accent"
              >
                <SpriteIcon
                  name={p.icon}
                  className="h-16 w-16 icon-3d sm:h-12 sm:w-12 lg:h-10 lg:w-10"
                  tint={p.color ?? ICON_COLORS[i % ICON_COLORS.length]}
                  label={p.label}
                />
              </a>
            </li>
          ))}
        </ul>

        {/* The sticky header already carries the page links — the footer
            just offers a ride back up to it. */}
        <button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'auto'
                : 'smooth',
            })
          }
          className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-base font-semibold text-accent transition hover:underline sm:text-lg lg:col-start-3 lg:row-start-1 lg:justify-self-end lg:text-base"
        >
          <svg
            className="h-5 w-5 lg:h-4 lg:w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 14l6-6 6 6" />
          </svg>
          Back to top
        </button>

        {/* suppressHydrationWarning: the prerendered year can lag the
            client's after New Year until the next deploy — harmless. */}
        <p
          className="m-0 text-center text-base text-muted sm:text-sm lg:col-span-3 lg:row-start-2 lg:justify-self-center"
          suppressHydrationWarning
        >
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  )
}
