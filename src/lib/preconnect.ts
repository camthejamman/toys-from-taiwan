/**
 * Warm a third-party origin (DNS + TCP + TLS) ahead of an embed load.
 * Called from hover/focus/touch on the click-to-load facades — that's user
 * intent, so it keeps the site's zero-third-party-requests-before-intent
 * promise: a preconnect opens a socket but transfers no content bytes.
 */
const warmed = new Set<string>()

export function preconnect(origins: string[]) {
  for (const origin of origins) {
    if (warmed.has(origin)) continue
    warmed.add(origin)
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }
}
