import { SpriteIcon } from './SpriteIcon'
import type { PlatformLink } from '../data/site'

/** Pill-shaped external link with a platform icon — for listen/watch rows. */
export function PlatformPill({ platform }: { platform: PlatformLink }) {
  return (
    <a
      href={platform.href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 btn-3d rounded-md border border-card-border bg-card px-4 py-2 text-sm font-semibold text-ink no-underline transition hover:border-accent hover:text-accent"
    >
      <SpriteIcon name={platform.icon} className="h-4.5 w-4.5" />
      {platform.label}
    </a>
  )
}

export function PlatformPillRow({
  platforms,
  className = '',
}: {
  platforms: PlatformLink[]
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {platforms.map((p) => (
        <PlatformPill key={p.id} platform={p} />
      ))}
    </div>
  )
}
