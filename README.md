# Toys From Taiwan 果酱

The official site for **Toys From Taiwan** — a 100% live-looping one-man jam
band from Jacksonville Beach, FL. Live at
**<https://camthejamman.github.io/toys-from-taiwan/>**.

Built with [TanStack Start](https://tanstack.com/start) (statically
prerendered — no server), React 19, Tailwind CSS v4, TypeScript, and a pinch
of [three.js](https://threejs.org/) for the ambient sky.

## Day / night sky

The theme toggle switches between a faint blue sky with hazy clouds (light)
and a starry night (dark). The backdrop has two layers:

- A pure-CSS gradient + cloud/star decoration that renders instantly and is
  the permanent fallback (reduced motion, no WebGL, JS still loading).
- A lazy three.js scene (`src/three/ambientSky.ts`) with drifting clouds and
  twinkling stars, dynamically imported on browser idle so it never competes
  with page load. It cross-fades in and replaces the static decoration.

## Editing content

All content lives in typed data files — no component surgery needed:

| What                        | File                    |
| --------------------------- | ----------------------- |
| Links, contact, handles     | `src/data/site.ts`      |
| Shows (upcoming & past)     | `src/data/shows.ts`     |
| Releases / discography      | `src/data/releases.ts`  |
| YouTube videos (generated)  | `src/data/videos.json`  |
| Icons (SVG sprite)          | `src/assets/sprite.svg` |

To add a show, append an entry to `upcomingShows` in `src/data/shows.ts`.
To add a release, drop cover art in `src/assets/images/` and add an entry to
`src/data/releases.ts` (the Bandcamp album id is in the album page source,
`bc-page-properties` meta tag).

## Videos page

`npm run fetch-videos` (scripts/fetch-videos.mjs) pulls the latest 9 regular
uploads (Shorts excluded) from the YouTube channel — no API key needed — and
writes `src/data/videos.json` plus self-hosted thumbnails in `public/thumbs/`.
The page loads zero YouTube resources until a visitor clicks play (then a
youtube-nocookie.com iframe loads in place).

CI runs the refresh before every deploy (non-fatal if YouTube is flaky), and
the deploy workflow also runs on a weekly cron, so new uploads appear on the
site automatically. Commit the regenerated `videos.json` + `public/thumbs/`
whenever you run it locally so the fallback stays fresh.

## Development

```bash
npm install
npm run dev        # http://localhost:3000/toys-from-taiwan/
npm run typecheck  # tsc --noEmit
npm run build      # static prerender into dist/client
npm run preview    # serve the built site locally
```

Note the `/toys-from-taiwan/` base path — the site is served from a GitHub
project page, so the same path is used in dev. It is configured in
`vite.config.ts` (`BASE`) and flows to the router via `import.meta.env.BASE_URL`.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/client` to GitHub Pages. One-time repo setup:
**Settings → Pages → Source → GitHub Actions**.

The post-build step copies `index.html` to `404.html` so deep links and
unknown URLs hydrate into the router's not-found page.
