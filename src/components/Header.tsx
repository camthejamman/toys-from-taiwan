import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { SocialStrip } from './SocialStrip'
import { ThemeToggle } from './ThemeToggle'
import { Wordmark3D } from './Wordmark3D'
import { site, socials, streaming } from '../data/site'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/music', label: 'Music' },
  { to: '/videos', label: 'Videos' },
  { to: '/shows', label: 'Shows' },
  { to: '/contact', label: 'Contact' },
  { to: '/support', label: 'Support' },
] as const

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-card-border header-bar backdrop-blur-md">
      {/* Full-bleed like the footer: brand hugs the left edge, toggle the
          right; content only re-centers inside a cap beyond 1920px. The
          1fr_auto_1fr grid keeps the nav links dead-center regardless of
          how wide the flanking brand/toggle are. */}
      {/* The brand nearly fills its 1fr track once the centered nav is
          placed, so brand→links reads as cramped. Widening the grid gap is
          what separates them, but the gap is paid twice (both sides of the
          nav) — so it only opens up past 850px, clear of the tight 768px
          band where the 7 links first appear and the header has no slack. */}
      <div className="mx-auto grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 min-[850px]:gap-8 lg:px-10 min-[1920px]:max-w-[120rem]">
        {/* The clamp governs phones only (sm: overrides it). Its 1.125rem
            FLOOR is the 320px fit and must not rise — the wordmark is
            nowrap and only ~164px of track is left there once the gaps and
            the toggle/hamburger pair are taken out. Raising just the
            ceiling (and the vw slope, so it lands sooner) grows the common
            360–430px phone sizes without touching that floor. sm:/lg: stay
            put: sm: also covers the tight 768px band where the 7-link nav
            appears, and 24px there would crowd it. */}
        <Link
          to="/"
          className="brand-underline flex items-baseline gap-2 justify-self-start whitespace-nowrap text-[clamp(1.125rem,5.5vw,1.375rem)] no-underline sm:text-xl lg:text-2xl"
          onClick={() => setOpen(false)}
        >
          <Wordmark3D small text={site.name} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === '/' }}
              activeProps={{
                className: 'text-accent font-semibold',
                'aria-current': 'page',
              }}
              inactiveProps={{ className: 'text-ink' }}
              className="rounded-lg px-2 py-1.5 text-sm no-underline transition hover:bg-accent/10 hover:text-accent lg:px-3 xl:text-base"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* col-start-3 is explicit: when the nav is display:none on mobile
            it vacates its grid slot, and auto-placement would otherwise
            pull these buttons into the center column */}
        <div className="col-start-3 flex items-center gap-2 justify-self-end">
          <ThemeToggle />
          <button
            type="button"
            className="btn-3d rounded-lg border border-card-border bg-card p-2.5 text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M5 5l14 14M19 5L5 19" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-card-border px-4 pb-4 pt-2 md:hidden"
        >
          {/* divide-y rather than per-item borders: it skips the first
              child, so there's no stray line under the header's own rule.
              The gap-1 is gone — dividers need the rows flush, and the
              links' py-2.5 already gives them room. */}
          <ul className="m-0 flex list-none flex-col divide-y divide-card-border p-0">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === '/' }}
                  activeProps={{
                    className: 'text-accent font-semibold',
                    'aria-current': 'page',
                  }}
                  inactiveProps={{ className: 'text-ink' }}
                  className="block rounded-lg py-2.5 no-underline transition hover:bg-accent/10 hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Platform links under the page links. Deliberately tiny — 9 in
              one row: 9×24 + 8×6 = 264px, inside the 288px a 320px phone has
              after the nav's px-4.
              The overrides MUST be max-md:-prefixed. SocialStrip's own base
              classes are unprefixed (flex-wrap, gap-5), and Tailwind emits
              plain utilities in value order — so an unprefixed flex-nowrap
              or gap-1.5 loses to them and the row silently wraps. A variant
              always wins, and this menu only exists below md anyway. */}
          <SocialStrip
            platforms={[...socials, ...streaming]}
            className="mt-3 max-w-none border-t border-card-border pt-3 max-md:flex-nowrap max-md:justify-between max-md:gap-1.5"
            iconClassName="h-6 w-6"
          />
        </nav>
      ) : null}
    </header>
  )
}
