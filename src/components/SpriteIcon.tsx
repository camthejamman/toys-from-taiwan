import spriteUrl from '../assets/sprite.svg'

/**
 * Renders an icon from the shared SVG sprite (src/assets/sprite.svg).
 * Icons inherit `currentColor`, so color them with text-* utilities.
 */
export function SpriteIcon({
  name,
  className = 'h-6 w-6',
  label,
}: {
  name: string
  className?: string
  /** Accessible name. Omit for purely decorative icons. */
  label?: string
}) {
  return (
    <svg
      className={className}
      fill="currentColor"
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label ? <title>{label}</title> : null}
      <use href={`${spriteUrl}#${name}`} />
    </svg>
  )
}
