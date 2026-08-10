import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'
import herosRegular from '../assets/fonts/TeXGyreHeros-Regular-latin.woff2?url'
import herosBold from '../assets/fonts/TeXGyreHeros-Bold-latin.woff2?url'
import { AmbientSky } from '../components/AmbientSky'
import { Decorations } from '../components/Decorations'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { themeInitScript } from '../components/ThemeToggle'
import { NotFound } from '../components/NotFound'
import { site } from '../data/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: site.name },
      { name: 'description', content: site.description },
      { property: 'og:title', content: site.name },
      { property: 'og:description', content: site.tagline },
      { property: 'og:type', content: 'website' },
      // og:url + canonical are per-route (pageHead in src/data/site.ts).
      { property: 'og:image', content: `${site.url}/og.jpg` },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      // Preload both font weights — otherwise they're only discovered after
      // the CSS downloads and parses, serializing CSS → font and widening
      // the Arial-first FOUT window. crossOrigin is mandatory on font
      // preloads even same-origin, or browsers re-fetch the file.
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: herosRegular,
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: herosBold,
        crossOrigin: 'anonymous',
      },
      { rel: 'stylesheet', href: appCss },
      // "TFT" tab mark — .ico first for legacy browsers, SVG for the rest
      // (both generated from public/favicon.svg).
      {
        rel: 'icon',
        href: `${import.meta.env.BASE_URL}favicon.ico`,
        sizes: '48x48',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${import.meta.env.BASE_URL}favicon.svg`,
      },
    ],
    scripts: [
      // Sets the .dark class before first paint — must stay inline.
      { children: themeInitScript },
      // Marks JS as available before first paint: the hero swaps its CSS
      // lettering for loading gears only when this class is present, so
      // no-JS visitors keep the real text.
      { children: "document.documentElement.classList.add('js')" },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="sky" aria-hidden="true">
          <div className="sky-clouds" />
          <div className="sky-stars" />
        </div>
        <AmbientSky />
        <Decorations />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Scripts />
      </body>
    </html>
  )
}

