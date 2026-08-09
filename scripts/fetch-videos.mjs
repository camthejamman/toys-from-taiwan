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
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CHANNEL_ID = 'UC6dxtcMsqP_EfYigct6vv0Q' // youtube.com/@toysfromtaiwan
const HANDLE = '@toysfromtaiwan'
const KEEP = 9

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
    id: e.match(/<yt:videoId>([^<]+)/)?.[1],
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
    /"videoRenderer":\{"videoId":"([^"]+)".*?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/g
  for (const [, id, rawTitle] of html.matchAll(re)) {
    if (seen.has(id)) continue
    seen.add(id)
    videos.push({ id, title: JSON.parse(`"${rawTitle}"`).trim() })
  }
  return videos
}

/** Exact upload date from a video's watch page. */
async function fetchUploadDate(id) {
  const html = await fetchText(`https://www.youtube.com/watch?v=${id}`)
  return html.match(/"uploadDate":"([^"]+)"/)?.[1]?.slice(0, 10)
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

let videos = []
try {
  const tab = parseVideosTab(
    await fetchText(`https://www.youtube.com/${HANDLE}/videos`),
  ).slice(0, KEEP)
  if (tab.length === 0) throw new Error('videos tab parse yielded nothing')
  videos = await Promise.all(
    tab.map(async (v) => ({
      ...v,
      published:
        rssById.get(v.id)?.published ?? (await fetchUploadDate(v.id)) ?? null,
    })),
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

await mkdir(thumbsDir, { recursive: true })
for (const video of videos) {
  // maxresdefault is sharpest but not guaranteed; fall back to mqdefault (16:9).
  let thumb = await fetch(`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`)
  if (!thumb.ok) thumb = await fetch(`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`)
  if (!thumb.ok) throw new Error(`Thumbnail failed for ${video.id}`)
  await writeFile(
    path.join(thumbsDir, `${video.id}.jpg`),
    Buffer.from(await thumb.arrayBuffer()),
  )
}

// Drop thumbnails for videos that fell out of the list.
const keep = new Set(videos.map((v) => `${v.id}.jpg`))
for (const file of await readdir(thumbsDir)) {
  if (!keep.has(file)) await rm(path.join(thumbsDir, file))
}

await writeFile(
  dataFile,
  JSON.stringify({ channelId: CHANNEL_ID, videos }, null, 2) + '\n',
)
console.log(`Wrote ${videos.length} videos:`)
for (const v of videos) console.log(`  ${v.published ?? '????-??-??'}  ${v.title}`)
