import { Link } from '@tanstack/react-router'
import { SpriteIcon } from './SpriteIcon'
import { site, socials, streaming } from '../data/site'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-card-border bg-card backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10">
        <p className="wordmark m-0 text-lg text-ink">{site.name}</p>

        <ul
          className="m-0 flex list-none flex-wrap items-center justify-center gap-4 p-0"
          aria-label="Social and streaming platforms"
        >
          {[...socials, ...streaming].map((p) => (
            <li key={p.id}>
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="block text-ink transition hover:scale-110 hover:text-accent"
              >
                <SpriteIcon name={p.icon} className="h-7 w-7" label={p.label} />
              </a>
            </li>
          ))}
        </ul>

        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
          <Link to="/about" className="text-muted no-underline hover:text-accent">
            About
          </Link>
          <Link to="/music" className="text-muted no-underline hover:text-accent">
            Music
          </Link>
          <Link to="/videos" className="text-muted no-underline hover:text-accent">
            Videos
          </Link>
          <Link to="/shows" className="text-muted no-underline hover:text-accent">
            Shows
          </Link>
          <Link to="/contact" className="text-muted no-underline hover:text-accent">
            Booking
          </Link>
          <Link to="/support" className="text-muted no-underline hover:text-accent">
            Tip Jar
          </Link>
        </nav>

        {/* suppressHydrationWarning: the prerendered year can lag the
            client's after New Year until the next deploy — harmless. */}
        <p className="m-0 text-center text-sm text-muted" suppressHydrationWarning>
          © {new Date().getFullYear()} {site.name} · 100% live-looped in{' '}
          {site.location}
        </p>
        <p className="wordmark m-0 text-xl text-muted" title={site.artist}>
          {site.artistChinese}
        </p>
      </div>
    </footer>
  )
}
