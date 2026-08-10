import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../components/NotFound'
import { site } from '../data/site'

/**
 * Exists so the prerender emits a real 404 page: postbuild copies
 * dist/client/404/index.html to dist/client/404.html, which GitHub Pages
 * serves (with a 404 status) for every unknown URL. Asset links are
 * base-path-absolute, so the page works from any URL depth.
 */
export const Route = createFileRoute('/404')({
  component: NotFound,
  head: () => ({
    meta: [
      { title: `Page not found · ${site.name}` },
      // The literal /404/ URL would otherwise be indexable.
      { name: 'robots', content: 'noindex' },
    ],
  }),
})
