# Toys From Taiwan — site guide for Claude

Official site for Toys From Taiwan (Cam / "JAM" 果酱) — a 100% live-looping
one-man jam band from Jacksonville Beach, FL. Brand vibe: sunny retro-3D
N64-vaporwave; rainbow-chrome accents over sky blue (see the Shorts! Vol. 1
cover in src/assets/images/). The legacy site this replaced lives at
/home/cam/workspaces/jam-waves (Next.js 12 + Bootstrap — reference only).

## Stack

TanStack Start ~1.168 (Vite plugin, **fully static prerender — no server**),
React 19, Tailwind v4 (CSS-first config, no tailwind.config), TypeScript,
bare three.js (no react-three-fiber, on purpose — load perf is a priority).

## Commands

- `npm run dev` — http://localhost:3000/toys-from-taiwan/ (note the base path)
- `npm run typecheck` — tsc --noEmit (run before calling work done)
- `npm run build` — prerenders all routes into dist/client (postbuild hook
  copies index.html → 404.html + touches .nojekyll automatically)
- `npm run preview` — serve dist/client. **Restart it after each rebuild** —
  vite preview serves stale HTML from before a rebuild.
- `npm run fetch-videos` — refresh Videos page data from YouTube (see below)

## Architecture map

- `src/data/` — ALL editable content: site.ts (links/contact/handles),
  shows.ts (upcoming+past), releases.ts (discography), videos.json (generated
  — never hand-edit; run fetch-videos)
- `src/routes/` — index, about, music, shows, contact, support, and
  videos as a layout route with two tabs: videos.index.tsx = Jams
  (regular uploads, default) and videos.shorts.tsx = Shorts (portrait
  9:16 grid); videos.tsx holds the tab nav + shared footer buttons
  (+ __root.tsx = document shell, nav/footer, theme init, 404)
- `src/components/` — Header, Footer, Section (page section w/ heading —
  optional `className` passthrough for layout, e.g. the xl flex-col trick
  that lets Meet JAM's card stretch to match its neighbor column —
  pass `as="h1"` on the FIRST Section of a page), SpriteIcon (has a `tint`
  prop: light-mode color, white in dark), ThemeToggle, SocialStrip,
  PlatformPill, ShowList, BandcampEmbed, VideoEmbed, AmbientSky,
  Wordmark3D (all display lettering — per-letter 3D gradient, see below),
  HeroTitle (landing hero: title + "100% Live-Looping…果酱" subtitle as
  CSS lettering + lazy three.js overlay), JamStudio (landing instrument
  tableau), JamGlyph3D (果酱: sprite fallback + lazy three.js overlay —
  currently unused; was the footer glyph until the footer refactor),
  Decorations (fixed gutter scenery — palms/solids/instruments in TWO
  independently-stacked columns per side, xl+ only; the layer stays
  invisible until the runtime stacker has placed everything, then fades
  in via .deco-ready — kills the hydration "wiggle" — and depth tiers
  cull toward the edges as the viewport narrows: items at x ≥ 10rem need
  ~1800px, x ≥ 5rem need ~1560px), LoadingGears (the legacy site's
  spinning gears, used by the hero loading state — rainbow-gradient
  filled via the in-SVG #lg-rainbow def)
- `src/lib/rainbow.ts` — the brand hue curve + extruded-face lightness +
  ICON_COLORS, shared by Wordmark3D and both three.js pieces
- `src/three/ambientSky.ts` — lazy three.js background (clouds day / stars
  night), dynamic-imported on idle by AmbientSky.tsx
- `src/three/heroTitle.ts` — lazy extruded three.js hero wordmark
  (helvetiker_bold, same lettering as the Shorts! covers), mounted on idle
  by HeroTitle.tsx, cross-fades over the CSS lettering
- `src/three/jamGlyph.ts` — lazy extruded three.js 果酱 (SVGLoader over
  src/assets/jam-standard.svg), mounted by JamGlyph3D.tsx; the same SVG
  is sprite symbol `icon-jam-cn`. Deliberately WAFER-thin: depth 0.05×
  glyph height — Cam dialed thickness down three times; don't restore
  the cover's chunkier proportions.
- `src/three/jamStudio.ts` — lazy instrument tableau (the Solune poster
  scene: gear SVGs from src/assets/instruments/ extruded on a GridHelper
  floor, transparent canvas so the site sky shows through, eased color
  drift instead of the poster's strobe). Mounted by JamStudio.tsx in TWO
  places: the landing hero (default layout classes; the tagline below it
  is the SEO/AT copy) and the About "Rig" card (via the className prop +
  the `--studio-aspect` CSS var for a squarer box). Palettes
  (LIGHT_PALETTE/DARK_PALETTE) are sampled from the hero wordmark's
  color recipe (rainbow.ts hue curve + saturation 0.95 +
  extruded-face lightness, per theme) so the instruments wear the title's
  colors, with a GLOW=0.22 emissive that tracks the drift so colors stay
  saturated under ACES; dark grid
  is bright lime #66ff33; left speaker sits at x=-545 (not the poster's
  -620) so its feet stay on the grid when narrow layouts compact.
- `src/assets/sprite.svg` — icon sprite (legacy icons + simple-icons brands),
  all fills stripped so icons inherit currentColor
- `scripts/fetch-videos.mjs` — keylessly pulls the latest 9 regular
  uploads (the /videos tab) AND up to 108 Shorts: initial /shorts tab
  HTML (shortsLockupViewModel blocks, title in
  overlayMetadata.primaryText) plus the keyless innertube
  browse-continuation API (API key + client version scraped from the
  page; the GRID token is the first structural continuationItemRenderer —
  shorter tokens are chip/tab endpoints that return the wrong route;
  continuation responses are PRETTY-PRINTED JSON, parsers must be
  whitespace-tolerant). Portrait thumbs are downscaled to 480w via sharp
  (optional dep — script survives without it). Resilience rules learned
  the hard way: the previous videos.json is a cache (known dates are
  never re-fetched; an empty shorts fetch KEEPS the old list; existing
  shorts thumbs are skipped), and watch-page date lookups have a 429
  circuit breaker (dates go null instead of the run failing — they
  backfill on later runs). Writes {videos, shorts} + public/thumbs/*.jpg
  (committed as CI fallback). This is as "live" as a fully static site
  gets: fresh at every build/deploy + the weekly cron — runtime YouTube
  fetching is CORS-blocked without an API key or proxy.
- Shorts tab UI (videos.shorts.tsx): PAGINATION, not infinite scroll (Cam
  switched deliberately so the platform buttons below stay reachable) —
  20 per page (fetch-videos caps shorts at 108 → never more than 6 pages,
  so the pager fits ONE row even on 320px phones: h-8 buttons + gap-1
  below sm, h-10 from sm, lg:h-11). Pager arrows are inline SVG Chevrons
  — the ‹ › text glyphs sat visibly off-center in the square buttons.
  URL-driven via the `page` search param (validateSearch; page 1 = no
  param), smooth scroll back to the grid top on page change. Titles are
  hashtag runs on YouTube — ShortCard strips them at display time
  (displayTitle; videos.json stays verbatim). Memoized ShortCard +
  .short-card { content-visibility: auto }; 2xl adds a 5th grid column
  (20 % 5 = 0, no orphan row).

## Reference material (visual source of truth)

`/home/cam/workspaces/three.js` is Cam's three.js playground (a checkout of
mrdoob/three.js) — consult it whenever styling 3D lettering, gradients, or
scenes, and prefer porting its exact numbers over inventing new ones:

- `examples/vol1.html` / `examples/vol2.html` — the Shorts! album-cover
  generators (day / night). Origin of the hue curve, per-vertex gradients,
  extrusion/bevel ratios, lighting rig, and the 果酱 SVG treatment.
- `examples/solune-day.html` / `examples/solune.html` — gig-poster
  generators; origin of the jam-studio instrument scene.
- `examples/fonts/` — typeface JSONs (helvetiker bold/regular are copied
  into src/three/fonts/); `examples/jam/svg/` mirrors this repo's jam/svg.
- Cam usually serves it at http://127.0.0.1:5502/examples/… via VS Code
  Live Server.

## Theme system

- `dark` class on <html>; set BEFORE paint by an inline head script
  (themeInitScript in ThemeToggle.tsx). Storage key `ttf-theme`.
- Theme changes dispatch the `ttf-theme-change` CustomEvent — use the
  `useIsDark()` hook (ThemeToggle.tsx) for theme-reactive components.
- Tokens: CSS vars on :root/.dark in src/styles.css, mapped to Tailwind
  utilities via `@theme inline` (text-ink, text-muted, bg-card, text-accent…).
  Light-theme values are WCAG-AA-tuned against the sky gradient top (#aed9f4)
  — don't lighten --ttf-accent/--ttf-muted without rechecking contrast.
- Static CSS sky (.sky/.sky-clouds/.sky-stars) is the always-there fallback;
  the three.js canvas fades in on top and `sky-live` on <html> hides the
  static decorations.

## The 3D system (built 2026-08-09)

Three lazy three.js scenes + a CSS lettering system replace the old flat
Cinerama wordmark. Everything gradient-colored shares src/lib/rainbow.ts
(the covers' hue curve — violet→red with the muddy yellow band skipped).

**Wordmark3D (CSS, zero runtime cost)** — every display heading sitewide.
Now deliberately FLAT: gradient-clipped text using the exact .rainbow-text
treatment (AA-darkened stops in light, luminous pastels in dark) in the
display weight. Cam iterated through per-letter 3D shadows and an extruded
gradient layer stack before settling on this — don't reintroduce 3D text
effects unprompted. The `small` prop is vestigial.

**The scenes** (each: module in src/three/, thin component wrapper):
- heroTitle.ts — bold helvetiker title (violet→red) + regular-weight
  subtitle running the gradient the OPPOSITE way with vol1's mid-band
  lightness dip + 果酱 SVG extruded 1.66× at the end. Title letters bob;
  subtitle stays put (like the covers).
- jamStudio.ts — the Solune-poster instrument tableau on a GridHelper
  floor. Transparent canvas (site sky shows through). Colors DRIFT (eased
  lerp between palette targets), not the posters' 350ms strobe; both
  palettes are sampled from the hero wordmark's letter recipe (hue curve,
  saturation 0.95, extruded-face lightness per theme), so the instruments
  wear the title's colors. Blue grid light / neon-green grid dark. On
  narrow aspects the stage COMPACTS (instruments slide inward, grid
  narrows) rather than zooming out. The landing box (JamStudio.tsx
  default className) steps 5xl→6xl→7xl→84rem→92rem with the viewport and
  deepens to a 2/1 aspect from lg — the camera fit is HEIGHT-bound in
  this wide box, so aspect depth (not width) is what grows the
  instruments — with an svh max-height cap so short laptops still fit
  the hero under the title.
- jamGlyph.ts — footer 果酱 from src/assets/jam-standard.svg at vol1's
  thin-plate proportions (depth ≈ 0.15× glyph height, light bevel).

**Shared scene contract** (keep all of it when touching any scene):
mounted on requestIdleCallback via dynamic import; ACES tone mapping
(without it colors wash out); DPR capped at 2 AND re-read on every refit
(browser zoom / monitor hops); paused when tab hidden or scrolled away
(IntersectionObserver — read the LAST entry, records arrive oldest-first);
reduced-motion honored LIVE via a matchMedia change listener +
setReduceMotion on the handle (render one resting frame); theme swaps via
the ttf-theme-change event + setTheme; full dispose on unmount; camera
fit is projection-verified where depth matters (project bbox corners to
NDC, iterate distance) and optically centered (pan camera along its own
right/up axes until projected bounds sit dead-center — world-space center
≠ optical center under an angled camera).

**Loading flow** — an inline head script adds `js` to <html> before paint;
CSS then hides the hero's fallback lettering and shows ONE LoadingGears
cluster (in the jam-studio box, the hero's visual center; the gears wear
the .rainbow-bar gradient via the in-SVG #lg-rainbow def and run BIG —
h-32 on phones up to h-[36rem] at 1920, lifted -translate-y-[10%] above
the box centerline). The home route gates the reveal: HeroTitle and
JamStudio take onSettled/reveal props; each settles only after its first
frame has PAINTED (double-rAF after mount, so the cross-fade never
stutters mid-shader-compile), and neither canvas shows until BOTH have
settled — then the gears finish their 400ms fade and the two canvases
fade in together (BOTH carry a matching 400ms transition-delay in
styles.css; keep them in sync or one scene leads the other). A failed
scene still settles, so it can't strand the gears. Scenes fully dispose
on unmount, so renavigating to home replays the whole sequence —
deliberate. `no3d` (WebGL/chunk failure) restores the CSS lettering.
No-JS visitors and crawlers never get `js`, so they always see real
text; sr-only copy exists regardless, and the copy below the tableau is
the visible SEO restatement.

## Responsive system (2026-08 mobile + wide passes)

Two full passes — phones (320–430px) and wide screens (1280–1920px+) —
settled these patterns. Sub-lg layouts are DONE: desktop tuning must be
additive lg:/xl:/2xl: prefixes only.

- **Content caps**: sections cap at max-w-6xl, 2xl:max-w-7xl. Don't
  exceed 80rem for opaque content — the deco gutters need ~196px/side.
  The hero is the exception (2xl 88rem, 1800px+ 96rem): its canvases are
  transparent, so they can stretch toward the scenery without burying it.
- **Header/Footer are full-bleed** (w-full, lg:px-10 edge insets),
  re-centering only past 1920px (min-[1920px]:max-w-[120rem]). Header is
  a `grid-cols-[1fr_auto_1fr]` so the nav sits dead-center; the
  toggle/hamburger div carries an explicit col-start-3 because the
  mobile-hidden nav vacates its grid slot and auto-placement would drag
  the buttons into the center column. Brand link is whitespace-nowrap
  with a text-lg/sm:text-xl/lg:text-2xl ladder (fits 320px AND the tight
  768px band). Mobile menu has a dvh max-height + scroll for landscape
  phones.
- **Footer shape**: wide = platform icons left, "Back to top" text-link
  right (smooth scroll, instant under reduced motion), © centered below,
  slim py. Below lg = the centered mobile stack (wordmark — mobile-only,
  the header already shows it on desktop — then a 4+4 icon block, then
  back-to-top, then ©). No page links: the sticky header owns those.
- **Buttons on phones**: never let flex-wrap produce orphan rows. Pairs/
  quads of full-width buttons via `w-full sm:w-auto` (+ justify-center on
  inline-flex ones): hero CTAs, videos platform row, Meet JAM, ShowList's
  Details. PlatformPill is w-full below sm (labels never wrap), natural
  width from sm, lg padding/text step-up.
- **Icon strips**: SocialStrip caps its own mobile width (max-w-52;
  callers override via className, e.g. the hero's max-sm:max-w-60 for
  bigger icons) so 8 icons always wrap into a symmetric 4+4 — the cap is
  the mechanism that prevents 7+1 orphans. Size ladders live at call
  sites via iconClassName.
- **Text wrapping**: styles.css @layer base sets h1–h3 text-wrap:balance
  and p text-wrap:pretty sitewide. Unbreakable strings get targeted
  fixes: paypal handle = max-w-full + wrap-anywhere (break-words does NOT
  fix flex min-content overflow), show times / release dates =
  whitespace-nowrap spans, "JAM 果酱" = NBSP join.
- **Home at xl**: Catch a Jam + Meet JAM pair into one 2-col band (plain
  wrapper div that becomes a grid at xl; Catch a Jam's inner grid flips
  to xl:grid-cols-1; Meet JAM's Section gets className="xl:flex
  xl:flex-col xl:items-start" — items-start preserves the rainbow-bar
  shrink-wrap — and its card xl:w-full xl:grow to match the neighbor
  column's height).
- **Grid-column breakpoints**: 3-across card grids go md:grid-cols-3 (not
  sm — 640px columns are too cramped); never use grid-cols-2 for 3 items
  (orphan row). Shorts grid adds 2xl:grid-cols-5; the 9-video Jams grid
  stays 3×3 (9 % 4 ≠ 0).

## Gotchas (learned the hard way)

- **Base path**: GitHub project page → `/toys-from-taiwan/` must be set in
  vite.config.ts `base` AND flows to router basepath via
  import.meta.env.BASE_URL. public/ asset URLs in JSX need the
  BASE_URL prefix (see videoThumb() in src/data/videos.ts).
- **One font family, app-wide**: TeX Gyre Heros (self-hosted 400 + 700
  latin woff2, GUST Font License) — the libre Helvetica of the URW/Nimbus
  lineage, i.e. the same letterforms as the helvetiker face in the
  three.js scenes and on the covers. Body, buttons, nav, AND display
  lettering all use it; don't introduce other faces. Only 400/700 exist —
  Tailwind's font-semibold/extrabold resolve to 700, font-medium to 400.
- **Display lettering**: Cinerama is gone (and its `$`→"4" / `%`→"S" glyph
  traps with it). Use the Wordmark3D component for any display/wordmark
  text — never raw `font-display` styling. See "The 3D system" for how the
  gradient layer stack works.
- **prerender.crawlLinks is off** intentionally — it double-crawls every
  route under the base path. autoStaticPathsDiscovery covers all static
  routes. Turn crawlLinks on only if dynamic $param routes are added.
- **three.js Points render as squares** without a round CanvasTexture map
  (see makeStarTexture in ambientSky.ts).
- **GridHelper bakes its constructor colors in as VERTEX colors** — tinting
  grid.material.color multiplies against them and muddies every theme
  swap. Set material.vertexColors = false and paint via material.color.
- Prerendered pages hydrate — anything reading localStorage/matchMedia/DOM
  must happen in effects or post-interaction, never during render.
- **Resize blink**: ResizeObserver fires AFTER that frame's rAF, and
  renderer.setSize clears the buffer — so every scene's RO callback must
  call renderFrame() synchronously and unconditionally, or the browser
  paints a blank canvas frame per resize step.
- **Sprite `<svg>`s have no intrinsic aspect ratio** — `w-auto` balloons
  to the 300px SVG default. Always give sprite icons an explicit width
  (the 果酱 glyph is 2.04:1 — `h-[1.5em] w-[3.06em]`). This once pushed
  the whole hero box off-center on phones.
- **Flat camera fits lie when geometry has depth**: the jamStudio speakers
  and grid edge sit far forward and project ~20% wider than a
  width/height fit predicts — hence the projection-verified fit. Don't
  regress it to simple trig.
- **Hero on phones**: the h1 uses a fluid `clamp()` size so the
  single-line wordmark fits 320px+, the hero section has `overflow-x-clip`
  so the canvas bleed can't widen the page, and `.hero3d .wm3d` is
  white-space: nowrap (the 3D overlay assumes one line).
- Platform icon colors are DATA: the optional `color` field on
  PlatformLink in src/data/site.ts (real brand colors — Spotify #1db954,
  Apple Music #fa233b, Twitch #9146ff, etc.). Icon rows fall back to
  ICON_COLORS rotation when unset. Dark mode always renders icons white
  (via .icon-tint); .icon-3d adds the drop-shadow depth.
- Radius language after the de-rounding pass: cards 0.625rem
  (.card-glass), buttons/pills rounded-md, avatars stay rounded-full.
  Don't reintroduce rounded-full buttons or rounded-2xl cards.
- grep on dist HTML: use `grep -a` (the `·` in titles trips binary detection).

## Deploy status (as of 2026-08-09)

- `.github/workflows/deploy.yml` → GitHub Pages at
  https://camthejamman.github.io/toys-from-taiwan/ — triggers: push to main,
  weekly cron (Mon 12:00 UTC, refreshes Videos page), manual dispatch.
- **Workflow is currently DISABLED** (`gh workflow disable`) — the site is
  NOT launched yet; Cam is still tweaking. Launch checklist:
  1. `gh workflow enable "Deploy to GitHub Pages"`
  2. Repo Settings → Pages → Source → "GitHub Actions" (one-time)
  3. Push to main (or `gh workflow run`)
- `gh` is a user-local install at ~/.local/bin/gh, already authenticated.
- The 2026-08-09 3D/typography/decoration overhaul landed as one big
  working-tree change (Cam commits himself — don't commit unprompted).
  Deleted along the way: Cinerama.otf, the Baloo 2 / Archivo Black /
  Arimo webfonts (font journey ended on TeX Gyre Heros). jam/svg/ at the
  repo root is Cam's source artwork; copies used by the build live in
  src/assets/ (jam-standard.svg, instruments/).

## UI language (settled through many iterations — keep consistent)

- **Buttons**: every button/pill link carries `.btn-3d` (bevel top edge,
  2px extruded bottom, soft ground shadow, hover lift, press-down on
  :active) — plus `.btn-3d-accent` on solid accent buttons. Shadows were
  deliberately REDUCED once; don't beef them back up. Non-interactive
  chips (music tags) stay flat.
- **Cards**: `.card-glass` floats high — three-layer shadow (contact +
  mid + 64px/96px soft drop). That's intentional drama, not a bug.
- **Section headings**: the rainbow underline auto-matches the heading's
  width (inline-block wrapper in Section.tsx, `mt-2` gap — tightened
  after the lettering went flat).
- **Video embeds**: only ONE plays at a time — starting an embed
  dispatches the `ttf-video-play` CustomEvent (detail = video id) and any
  other playing embed folds back to its thumbnail.
- **Videos page**: Shorts grid is single-column below `sm` (full-width
  portrait cards); the four platform buttons under both tabs are, in
  order: Long Jams on YouTube (accent), Shorts on YouTube, Reels
  on Instagram, Jams on TikTok.

## Conventions

- Content edits go in src/data/*, not components.
- All copy carried over from the legacy site should stay faithful (links,
  handles, tier lists were verbatim-audited — don't paraphrase URLs/handles).
- External links: target="_blank" rel="noreferrer". Icon-only links must
  pass `label` to SpriteIcon for screen readers.
- Third-party embeds are click-to-load facades (BandcampEmbed, VideoEmbed) —
  zero third-party requests before user intent. Keep it that way.
