import type { CSSProperties } from 'react'
import spriteUrl from '../assets/sprite.svg'

/**
 * Renders an icon from the shared SVG sprite (src/assets/sprite.svg).
 * Icons inherit `currentColor`, so color them with text-* utilities — or
 * pass `tint` for a light-mode-only solid color (dark mode stays
 * currentColor, i.e. white when paired with dark:text-ink).
 */
export function SpriteIcon({
  name,
  className = 'h-6 w-6',
  label,
  tint,
}: {
  name: string
  className?: string
  /** Accessible name. Omit for purely decorative icons. */
  label?: string
  /** Light-mode fill color (see .icon-tint in styles.css). */
  tint?: string
}) {
  return (
    <svg
      className={tint ? `${className} icon-tint` : className}
      style={tint ? ({ '--icon-c': tint } as CSSProperties) : undefined}
      fill="currentColor"
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label ? <title>{label}</title> : null}
      <use href={`${spriteUrl}#${name}`} />
    </svg>
  )
}
