/**
 * Refreshes the Videos page data from YouTube — no API key needed.
 *
 * Primary source: the channel's /videos tab (which never contains Shorts) —
 * the page embeds ytInitialData JSON that lists uploads in order. Exact
 * upload dates come from the RSS feed when the video is recent enough to
 * appear there, otherwise from the video's watch page microformat.
 *
 * Fallback source (if the tab layout ever changes): the public RSS feed,
 * with Shorts filtered out via the redirect trick — youtube.com/shorts/<id>
 * answers 200 for a Short and 3xx-redirects to /watch for a regular video.
 *
 * Keeps the newest 9 videos, downloads their thumbnails into public/thumbs/
 * (so the page makes no third-party requests until a visitor clicks play),
 * and writes src/data/videos.json.
 *
 * Run manually with `npm run fetch-videos`, or let CI run it before each
 * deploy. On any failure it exits non-zero WITHOUT touching the existing
 * videos.json, so a flaky network can never break the site.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Optional: shrinks the 1080×1920 Shorts frames (~200 KB each) to card
// size before committing. Missing sharp never breaks the fetch.
let sharp = null
try {
  sharp = (await import('sharp')).default
} catch {
  console.warn('sharp unavailable — shorts thumbnails stay full size')
}

const CHANNEL_ID = 'UC6dxtcMsqP_EfYigct6vv0Q' // youtube.com/@toysfromtaiwan
const HANDLE = '@toysfromtaiwan'
const KEEP = 9
/** The Shorts tab feeds a pseudo-infinite scroll — pull deep. */
const SHORTS_KEEP = 108

/** Run `fn` over `items` with bounded concurrency, preserving order. */
async function mapPool(items, limit, fn) {
  const out = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        out[i] = await fn(items[i])
      }
    }),
  )
  return out
}

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const thumbsDir = path.join(root, 'public', 'thumbs')
const dataFile = path.join(root, 'src', 'data', 'videos.json')

function decodeEntities(s) {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'accept-language': 'en-US,en;q=0.9' },
  })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.text()
}

/** RSS entries: last ~15 uploads (Shorts included), with exact dates. */
async function fetchRssEntries() {
  const xml = await fetchText(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
  )
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    // Constrain to the 11-char YouTube id charset (same as the tab
    // parsers below) — ids land in filesystem paths and fetch URLs, so
    // an unconstrained capture would trust the feed not to contain `../`.
    id: e.match(/<yt:videoId>([A-Za-z0-9_-]{11})</)?.[1],
    title: decodeEntities(e.match(/<title>([^<]*)/)?.[1] ?? ''),
    published: e.match(/<published>([^<]+)/)?.[1]?.slice(0, 10),
  }))
}

/** Ordered uploads from the /videos tab (regular videos only, no Shorts). */
function parseVideosTab(html) {
  const videos = []
  const seen = new Set()

  // Current layout (2026): lockupViewModel blocks with contentId + title.
  for (const chunk of html.split('"lockupViewModel":{').slice(1)) {
    const id = chunk.match(/"contentId":"([A-Za-z0-9_-]{11})"/)?.[1]
    const rawTitle = chunk.match(
      /"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/,
    )?.[1]
    const type = chunk.match(/"contentType":"([A-Z_]+)"/)?.[1]
    if (!id || rawTitle == null || seen.has(id)) continue
    if (type && type !== 'LOCKUP_CONTENT_TYPE_VIDEO') continue
    seen.add(id)
    videos.push({ id, title: JSON.parse(`"${rawTitle}"`).trim() })
  }
  if (videos.length > 0) return videos

  // Older layout: videoRenderer blocks.
  const re =
    /"videoRenderer":\{"videoId":"([A-Za-z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/g
  for (const [, id, rawTitle] of html.matchAll(re)) {
    if (seen.has(id)) continue
    seen.add(id)
    videos.push({ id, title: JSON.parse(`"${rawTitle}"`).trim() })
  }
  return videos
}

/** Ordered Shorts from the /shorts tab (2026 layout: shortsLockupViewModel
 * blocks with a reelWatchEndpoint videoId and the clean title in
 * overlayMetadata.primaryText). Works on the tab HTML and on innertube
 * continuation-response JSON alike. */
function parseShortsTab(text) {
  const shorts = []
  const seen = new Set()
  // Whitespace-tolerant: the tab HTML is minified JSON, but innertube
  // continuation responses come back pretty-printed.
  for (const chunk of text.split(/"shortsLockupViewModel":\s*\{/).slice(1)) {
    const id = chunk.match(/"videoId":\s*"([A-Za-z0-9_-]{11})"/)?.[1]
    const rawTitle = chunk.match(
      /"overlayMetadata":\s*\{\s*"primaryText":\s*\{\s*"content":\s*"((?:[^"\\]|\\.)*)"/,
    )?.[1]
    if (!id || rawTitle == null || seen.has(id)) continue
    seen.add(id)
    shorts.push({ id, title: JSON.parse(`"${rawTitle}"`).trim() })
  }
  return shorts
}

/** The whole Shorts feed (up to SHORTS_KEEP): initial tab HTML, then the
 * keyless innertube browse-continuation API — the page embeds its own API
 * key and client version, and each response carries the next token. */
async function fetchAllShorts() {
  const html = await fetchText(`https://www.youtube.com/${HANDLE}/shorts`)
  const items = parseShortsTab(html)
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1]
  const clientVersion =
    html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1] ??
    '2.20260101.00.00'
  // The grid's own continuation lives in a continuationItemRenderer with
  // trigger ON_ITEM_SHOWN (the first structural block); the shorter tokens
  // elsewhere are tab/sort-chip endpoints that return the wrong route.
  const gridToken = (text) =>
    text.match(
      /"continuationItemRenderer":\s*\{[\s\S]{0,3000}?"token":\s*"([^"]+)"/,
    )?.[1]
  let token = gridToken(html)
  const seen = new Set(items.map((s) => s.id))
  for (let hop = 0; hop < 12 && token && apiKey; hop++) {
    if (items.length >= SHORTS_KEEP) break
    const res = await fetch(
      `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          context: { client: { clientName: 'WEB', clientVersion } },
          continuation: token,
        }),
      },
    )
    if (!res.ok) break
    const text = await res.text()
    const more = parseShortsTab(text).filter((s) => !seen.has(s.id))
    if (more.length === 0) break
    for (const m of more) {
      seen.add(m.id)
      items.push(m)
    }
    token = gridToken(text)
  }
  return items.slice(0, SHORTS_KEEP)
}

/** Exact upload date from a video's watch page. Null on failure, and a
 * single 429 trips a circuit breaker for the rest of the run — dates are
 * nice-to-have; hammering a rate limit can ruin the whole fetch. */
let dateLimited = false
async function fetchUploadDate(id) {
  if (dateLimited) return null
  try {
    const html = await fetchText(`https://www.youtube.com/watch?v=${id}`)
    return html.match(/"uploadDate":"([^"]+)"/)?.[1]?.slice(0, 10) ?? null
  } catch (err) {
    if (String(err).includes('429')) {
      dateLimited = true
      console.warn('watch pages rate-limited — remaining dates left null')
    }
    return null
  }
}

async function isShort(id) {
  const r = await fetch(`https://www.youtube.com/shorts/${id}`, {
    method: 'HEAD',
    redirect: 'manual',
  })
  return r.status === 200 // regular videos 3xx-redirect to /watch
}

const rss = await fetchRssEntries().catch(() => [])
const rssById = new Map(rss.map((e) => [e.id, e]))

// The previous run is a cache: known dates never trigger a watch-page
// fetch again, and a failed shorts fetch keeps the old list instead of
// wiping it (the original videos.json-preserving philosophy).
let previous = { videos: [], shorts: [] }
try {
  previous = JSON.parse(await readFile(dataFile, 'utf8'))
} catch {}
const prevDates = new Map(
  [...(previous.videos ?? []), ...(previous.shorts ?? [])]
    .filter((v) => v.published)
    .map((v) => [v.id, v.published]),
)

async function resolveDate(id) {
  return (
    rssById.get(id)?.published ??
    prevDates.get(id) ??
    (await fetchUploadDate(id))
  )
}

let videos = []
try {
  const tab = parseVideosTab(
    await fetchText(`https://www.youtube.com/${HANDLE}/videos`),
  ).slice(0, KEEP)
  if (tab.length === 0) throw new Error('videos tab parse yielded nothing')
  videos = await Promise.all(
    tab.map(async (v) => ({ ...v, published: (await resolveDate(v.id)) ?? null })),
  )
} catch (err) {
  console.warn(`videos tab failed (${err.message}); falling back to RSS`)
  for (const entry of rss) {
    if (!entry.id || videos.length >= KEEP) continue
    if (await isShort(entry.id)) continue
    videos.push(entry)
  }
}

if (videos.length === 0)
  throw new Error('No videos found — refusing to overwrite data')

// ---- Shorts (the /shorts tab + continuations) — portrait thumbnails ----
let shorts = []
try {
  const raw = await fetchAllShorts()
  shorts = await mapPool(raw, 4, async (s) => ({
    ...s,
    published: (await resolveDate(s.id)) ?? null,
  }))
} catch (err) {
  console.warn(`shorts fetch failed (${err.message})`)
}
if (shorts.length === 0 && (previous.shorts?.length ?? 0) > 0) {
  console.warn(`reusing previous ${previous.shorts.length} shorts`)
  shorts = previous.shorts
}
// A continuation that dies mid-pagination returns a PARTIAL list (first
// page only). Left alone it would truncate videos.json and the prune loop
// below would delete the committed thumbs that fell out. Keep runs
// additive: merge the previous list back in behind the fresh entries.
if (shorts.length < (previous.shorts?.length ?? 0)) {
  const have = new Set(shorts.map((s) => s.id))
  shorts = [...shorts, ...previous.shorts.filter((s) => !have.has(s.id))].slice(
    0,
    SHORTS_KEEP,
  )
  console.warn(
    `shorts fetch came back short — merged previous list (now ${shorts.length})`,
  )
}

await mkdir(thumbsDir, { recursive: true })
for (const video of videos) {
  // maxresdefault is sharpest but not guaranteed; fall back to mqdefault (16:9).
  let thumb = await fetch(`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`)
  if (!thumb.ok) thumb = await fetch(`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`)
  if (!thumb.ok) throw new Error(`Thumbnail failed for ${video.id}`)
  let buf = Buffer.from(await thumb.arrayBuffer())
  // maxresdefault is 1280×720; the cards render ~360px wide, so 768w
  // covers 2× DPR at roughly 40% of the bytes.
  if (sharp) {
    buf = await sharp(buf)
      .resize(768, null, { withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toBuffer()
      .catch(() => buf)
  }
  await writeFile(path.join(thumbsDir, `${video.id}.jpg`), buf)
}
await mapPool(shorts, 4, async (short) => {
  // Thumbs are effectively immutable — skip ones we already have.
  if (existsSync(path.join(thumbsDir, `${short.id}.jpg`))) return
  // Portrait frames for Shorts (both variants are 1080×1920); downscale to
  // 480w (2× the rendered card) so 100+ committed thumbs stay a few MB.
  let thumb = await fetch(`https://i.ytimg.com/vi/${short.id}/oar2.jpg`)
  if (!thumb.ok) thumb = await fetch(`https://i.ytimg.com/vi/${short.id}/oardefault.jpg`)
  if (!thumb.ok) thumb = await fetch(`https://i.ytimg.com/vi/${short.id}/frame0.jpg`)
  if (!thumb.ok) throw new Error(`Thumbnail failed for short ${short.id}`)
  let buf = Buffer.from(await thumb.arrayBuffer())
  if (sharp) {
    buf = await sharp(buf)
      .resize(480, null, { withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toBuffer()
      .catch(() => buf)
  }
  await writeFile(path.join(thumbsDir, `${short.id}.jpg`), buf)
})

// Drop thumbnails for videos that fell out of the lists.
const keep = new Set(
  [...videos, ...shorts].map((v) => `${v.id}.jpg`),
)
for (const file of await readdir(thumbsDir)) {
  if (!keep.has(file)) await rm(path.join(thumbsDir, file))
}

await writeFile(
  dataFile,
  JSON.stringify({ channelId: CHANNEL_ID, videos, shorts }, null, 2) + '\n',
)
console.log(`Wrote ${videos.length} videos:`)
for (const v of videos) console.log(`  ${v.published ?? '????-??-??'}  ${v.title}`)
console.log(`Wrote ${shorts.length} shorts:`)
for (const s of shorts) console.log(`  ${s.published ?? '????-??-??'}  ${s.title}`)
