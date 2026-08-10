import { SpriteIcon } from './SpriteIcon'
import { Wordmark3D } from './Wordmark3D'
import { ICON_COLORS } from '../lib/rainbow'
import { site, socials, streaming } from '../data/site'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-card-border bg-card backdrop-blur-md">
      {/* Below lg: the settled centered stack. From lg: a three-column
          band — brand left, page links center, platform icons right,
          copyright centered underneath — so the footer fills the width
          instead of staying phone-shaped. */}
      {/* Full-bleed on desktop (icons hug the left edge, back-to-top the
          right, like a proper wide footer); only beyond 1920px does the
          content re-center inside a cap. Mobile keeps the centered stack. */}
      <div className="mx-auto flex w-full flex-col items-center gap-8 px-4 py-6 sm:gap-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-x-10 lg:gap-y-2 lg:px-10 lg:py-4 min-[1920px]:max-w-[120rem]">
        {/* Larger footer pieces below sm fill the phone footer's open space;
            sm+ keeps the settled compact row. */}
        {/* brand wordmark is mobile-only — wide screens already have it in
            the sticky header right above */}
        <p className="m-0 text-3xl sm:text-lg lg:hidden">
          <Wordmark3D small text={site.name} />
        </p>

        <ul
          className="m-0 flex max-w-64 list-none flex-wrap items-center justify-center gap-5 p-0 sm:max-w-none sm:gap-4 lg:col-start-1 lg:row-start-1 lg:justify-self-start lg:gap-5"
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
                  className="h-12 w-12 icon-3d sm:h-7 sm:w-7 lg:h-10 lg:w-10"
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
          className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-accent transition hover:underline lg:col-start-3 lg:row-start-1 lg:justify-self-end lg:text-base"
        >
          <svg
            className="h-4 w-4"
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
