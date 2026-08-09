import type { ReactNode } from 'react'
import { Wordmark3D } from './Wordmark3D'

/**
 * Consistent page section: heading with a rainbow accent bar, then content.
 * Pass `as="h1"` on the first Section of a page so every page has an h1.
 */
export function Section({
  title,
  eyebrow,
  children,
  center = false,
  as: Heading = 'h2',
}: {
  title: string
  eyebrow?: string
  children: ReactNode
  center?: boolean
  as?: 'h1' | 'h2'
}) {
  return (
    <section className={`mx-auto w-full max-w-6xl px-4 py-10 ${center ? 'text-center' : ''}`}>
      {eyebrow ? (
        <p className="m-0 text-sm font-semibold uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
      ) : null}
      {/* inline-block shrink-wraps to the heading, so the rainbow bar is
          always exactly as wide as the lettering above it */}
      <div className="mb-8 inline-block">
        <Heading className="m-0 mt-1 text-3xl sm:text-4xl">
          <Wordmark3D text={title} />
        </Heading>
        <div className="rainbow-bar mt-2" aria-hidden="true" />
      </div>
      {children}
    </section>
  )
}
