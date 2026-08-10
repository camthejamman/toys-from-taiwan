import type { CSSProperties } from 'react'
import { gradientHue, extrudedFaceLightness } from '../lib/rainbow'
import { RIG_ART } from './rigArt.generated'

/**
 * The About page's "Rig" illustration: a static SVG tableau of Jam's
 * actual live-looping setup (keytar + keyboard left, HandSonic center
 * under the guitar, second keyboard + boom mic/tablet right, loopers,
 * pedalboard and drum machine on the floor), drawn with the same
 * silhouette art the three.js jam-studio scene extrudes plus the
 * agent-drawn additions in rigArt.generated.ts.
 *
 * Zero-runtime: colors are the jam-studio recipe (rainbow.ts hue curve,
 * saturation 0.95, extruded-face lightness per theme) baked into CSS
 * custom properties; the .dark flip happens in styles.css, so the SVG
 * needs no JS, no theme listener, and prerenders fully.
 */

/** hsl(0..1) → #rrggbb, matching three.js Color.setHSL / CSS hsl(). */
function hslHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    const a = s * Math.min(l, 1 - l)
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(v * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Eight samples of the hero-wordmark color recipe, per theme — the same
 * palette jamStudio drifts through, frozen into a still. */
function titlePalette(dark: boolean): string[] {
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7
    return hslHex(gradientHue(t), 0.95, extrudedFaceLightness(t, dark))
  })
}
const LIGHT = titlePalette(false)
const DARK = titlePalette(true)

/** Per-layer paint: palette index, or 'K' to knock out to the card color.
 * Silhouette-export art has indexed layers p0..p3; agent art has b/k. */
type Paint = number | 'K'
const COLORS: Record<string, Record<string, Paint>> = {
  // palette: 0 red, 1 orange, 2 green, 3 teal, 4 cyan, 5 blue, 6 indigo, 7 violet
  guitar: { p0: 5, p1: 'K', p2: 'K', p3: 'K' },
  keyboard: { p0: 2, p1: 2, p2: 'K', p3: 'K' },
  keyboard2: { p0: 6, p1: 6, p2: 'K', p3: 'K' },
  handsonic: { p0: 1, p1: 'K', p2: 3 },
  loopstation: { p0: 0 },
  keytar: { b: 7, k: 'K' },
  'mic-stand': { b: 4, k: 'K' },
  'drum-machine': { b: 3, k: 'K' },
  'pedal-row': { b: 1, k: 'K' },
  'tabletop-synth': { b: 4, k: 'K' },
}

/** name, x (bottom-center anchor), y, target height, rotation°, flipX —
 * placements mirror the live-rig photo. keyboard2 reuses the keyboard art. */
const LAYOUT: ReadonlyArray<
  readonly [string, number, number, number, number, boolean]
> = [
  ['tabletop-synth', 100, 580, 95, 0, false],
  ['keytar', 900, 250, 100, -15, false],
  ['keyboard', 280, 742, 310, 0, true],
  ['drum-machine', 145, 790, 110, 0, false],
  ['guitar', 612, 520, 425, -58, false],
  ['loopstation', 430, 788, 44, 0, false],
  ['handsonic', 600, 782, 400, 0, false],
  ['pedal-row', 780, 790, 62, 0, false],
  ['keyboard2', 935, 756, 280, 0, false],
  ['mic-stand', 1048, 778, 490, 0, false],
]

/** Perspective wireframe floor, echoing the jam-studio GridHelper. */
const GRID_D = (() => {
  const [xlb, xrb, yb] = [250, 950, 505] // back edge
  const [xlf, xrf, yf] = [30, 1170, 792] // front edge
  const rows = 7
  const cols = 14
  const k = 2.3
  const d: string[] = []
  for (let i = 0; i <= rows; i++) {
    const t = i / rows
    const f = t / (t + k * (1 - t))
    const y = yb + (yf - yb) * f
    d.push(
      `M${(xlb + (xlf - xlb) * f).toFixed(1)} ${y.toFixed(1)}H${(xrb + (xrf - xrb) * f).toFixed(1)}`,
    )
  }
  for (let j = 0; j <= cols; j++) {
    const c = j / cols
    d.push(
      `M${xlb + (xrb - xlb) * c} ${yb}L${xlf + (xrf - xlf) * c} ${yf}`,
    )
  }
  return d.join(' ')
})()

const CARD = 'var(--ttf-card-solid)'

export function RigTableau({ className = '' }: { className?: string }) {
  return (
    <div className={`rig-tableau w-full ${className}`} aria-hidden="true">
      <svg viewBox="0 170 1200 630" className="h-auto w-full">
        <path className="rg" d={GRID_D} fill="none" strokeWidth="1.4" opacity="0.75" />
        {LAYOUT.map(([name, x, y, targetH, rot, flip]) => {
          const art = RIG_ART[name === 'keyboard2' ? 'keyboard' : name]
          if (!art) return null
          const s = targetH / art.h
          const vars: Record<string, string> = {}
          for (const [cls, paint] of Object.entries(COLORS[name] ?? {})) {
            // slot 0 serves both p0 and b; k has a static rule in styles.css
            if (cls === 'k') continue
            const slot = cls === 'b' ? 0 : Number(cls.slice(1))
            vars[`--rl${slot}`] = paint === 'K' ? CARD : LIGHT[paint]
            vars[`--rd${slot}`] = paint === 'K' ? CARD : DARK[paint]
          }
          return (
            <g
              key={name}
              style={vars as CSSProperties}
              transform={`translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -s : s).toFixed(4)} ${s.toFixed(4)}) translate(${(-art.w / 2).toFixed(1)} ${(-art.h).toFixed(1)})`}
              dangerouslySetInnerHTML={{ __html: art.html }}
            />
          )
        })}
      </svg>
    </div>
  )
}
