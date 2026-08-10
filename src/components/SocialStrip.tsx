import { SpriteIcon } from './SpriteIcon'
import { ICON_COLORS } from '../lib/rainbow'
import type { PlatformLink } from '../data/site'

/**
 * Icon-only row of platform links, like the old site's media links.
 * The mobile max-width is the wrap mechanism: it decides how many icons
 * fit per row, which is what keeps the phone layout symmetric (9 icons =
 * 3+3+3) instead of leaving an orphan on a row of its own.
 */
export function SocialStrip({
  platforms,
  iconClassName = 'h-8 w-8',
  className = '',
}: {
  platforms: PlatformLink[]
  iconClassName?: string
  className?: string
}) {
  return (
    <ul
      className={`mx-auto my-0 flex max-w-40 list-none flex-wrap items-center justify-center gap-5 p-0 sm:max-w-none ${className}`}
    >
      {platforms.map((p, i) => (
        <li key={p.id}>
          <a
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="block text-ink transition hover:scale-110 hover:text-accent"
          >
            <SpriteIcon
              name={p.icon}
              className={`${iconClassName} icon-3d`}
              tint={p.color ?? ICON_COLORS[i % ICON_COLORS.length]}
              label={p.label}
            />
          </a>
        </li>
      ))}
    </ul>
  )
}
