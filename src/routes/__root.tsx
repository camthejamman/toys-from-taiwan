import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'
import { AmbientSky } from '../components/AmbientSky'
import { Decorations } from '../components/Decorations'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { themeInitScript } from '../components/ThemeToggle'
import { Wordmark3D } from '../components/Wordmark3D'
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
      { property: 'og:url', content: `${site.url}/` },
      { property: 'og:image', content: `${site.url}/og.jpg` },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: `${import.meta.env.BASE_URL}favicon.ico` },
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

function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="m-0 text-7xl">
        <Wordmark3D text="404" />
      </p>
      <h1 className="mt-2 text-3xl">
        <Wordmark3D text="Lost in the clouds" />
      </h1>
      <p className="mt-3 text-muted">
        This page floated away. Head back home and the jams will find you.
      </p>
      <Link
        to="/"
        className="mt-6 btn-3d btn-3d-accent rounded-md bg-accent px-6 py-2.5 font-semibold text-accent-ink no-underline transition hover:bg-accent-strong"
      >
        Back to the Jam Lounge
      </Link>
    </div>
  )
}
