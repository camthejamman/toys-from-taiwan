import { SpriteIcon } from './SpriteIcon'
import type { PlatformLink } from '../data/site'

/** Icon-only row of platform links, like the old site's media links. */
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
      className={`m-0 flex list-none flex-wrap items-center justify-center gap-5 p-0 ${className}`}
    >
      {platforms.map((p) => (
        <li key={p.id}>
          <a
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="block text-ink transition hover:scale-110 hover:text-accent"
          >
            <SpriteIcon name={p.icon} className={iconClassName} label={p.label} />
          </a>
        </li>
      ))}
    </ul>
  )
}
