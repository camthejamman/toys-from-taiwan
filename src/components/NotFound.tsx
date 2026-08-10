import { Link } from '@tanstack/react-router'
import { Wordmark3D } from './Wordmark3D'

/**
 * The 404 screen. Rendered two ways: as the router's notFoundComponent
 * (any bad path, after hydration) and by the /404 route, whose prerendered
 * HTML the postbuild step copies to dist/client/404.html — so GitHub Pages
 * serves a real 404 page (not a copy of the home page) for unknown URLs.
 */
export function NotFound() {
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
