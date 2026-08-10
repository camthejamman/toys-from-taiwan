import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from './ThemeToggle'
import { Wordmark3D } from './Wordmark3D'
import { site } from '../data/site'

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
      <div className="mx-auto grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 lg:px-10 min-[1920px]:max-w-[120rem]">
        <Link
          to="/"
          className="flex items-baseline gap-2 justify-self-start whitespace-nowrap text-lg no-underline transition hover:-translate-y-0.5 sm:text-xl lg:text-2xl"
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
            className="btn-3d rounded-lg border border-card-border bg-card p-2 text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              className="h-5 w-5"
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
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
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
                  className="block rounded-lg px-3 py-2 no-underline transition hover:bg-accent/10 hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
