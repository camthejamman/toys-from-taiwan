/**
 * Display lettering — flat rainbow-gradient text (the same treatment as
 * .rainbow-text on the release cards) in the display weight. All styling
 * lives in .wm3d in styles.css; the earlier per-letter and layer-stack 3D
 * experiments were retired in favor of this.
 */
export function Wordmark3D({
  text,
  className = '',
}: {
  text: string
  className?: string
  /** Kept for call-site compatibility; unused by the flat treatment. */
  small?: boolean
}) {
  return <span className={`wm3d ${className}`}>{text}</span>
}
