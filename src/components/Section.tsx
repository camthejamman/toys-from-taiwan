import type { ReactNode } from 'react'

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
      <Heading className="wordmark mb-2 mt-1 text-3xl text-ink sm:text-4xl">
        {title}
      </Heading>
      <div className={`rainbow-bar mb-8 w-24 ${center ? 'mx-auto' : ''}`} aria-hidden="true" />
      {children}
    </section>
  )
}
