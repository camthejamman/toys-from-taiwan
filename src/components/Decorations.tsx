import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { SpriteIcon } from './SpriteIcon'

/**
 * Bandcamp-page-style scenery: palm trees, low-poly-look geometric solids,
 * and instruments from the sprite, scattered down the left/right gutters.
 * Pure static SVG on a fixed layer behind the content — no three.js, no
 * runtime cost beyond one composited float animation per item (killed by
 * the global reduced-motion block). Hidden below xl where there are no
 * gutters to decorate.
 */

/** Simple hex shade: f < 1 darkens toward black, f > 1 lightens to white. */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const mix = (v: number) =>
    Math.round(f <= 1 ? v * f : v + (255 - v) * Math.min(1, f - 1))
  const r = mix(n >> 16)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function Cube({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <polygon points="32,4 60,18 32,32 4,18" fill={shade(c, 1.38)} />
      <polygon points="4,18 32,32 32,60 4,46" fill={c} />
      <polygon points="60,18 32,32 32,60 60,46" fill={shade(c, 0.68)} />
    </svg>
  )
}

function Octa({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <polygon points="32,2 8,32 32,30" fill={shade(c, 1.35)} />
      <polygon points="32,2 56,32 32,30" fill={c} />
      <polygon points="8,32 32,30 32,62" fill={shade(c, 0.82)} />
      <polygon points="56,32 32,30 32,62" fill={shade(c, 0.6)} />
    </svg>
  )
}

function Prism({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <polygon points="32,6 58,50 6,50" fill={c} />
      <polygon points="32,6 58,50 46,58 30,16" fill={shade(c, 0.66)} />
    </svg>
  )
}

function Palm() {
  const trunk = '#a8713d'
  const leaf = '#3cb45c'
  const leafD = '#2b8544'
  return (
    <svg viewBox="0 0 64 84" className="h-full w-full" aria-hidden="true">
      <polygon points="28,82 36,82 34,64 29,64" fill={trunk} />
      <polygon points="29,64 34,64 33,50 30,50" fill={shade(trunk, 0.8)} />
      <polygon points="30,50 33,50 32,40" fill={trunk} />
      {/* frond fan around the crown */}
      <polygon points="32,40 4,46 12,55" fill={leafD} />
      <polygon points="32,40 5,26 2,37" fill={leaf} />
      <polygon points="32,40 16,11 8,20" fill={leafD} />
      <polygon points="32,40 48,11 56,20" fill={leaf} />
      <polygon points="32,40 59,26 62,37" fill={leafD} />
      <polygon points="32,40 60,46 52,55" fill={leaf} />
      <circle cx="29" cy="41" r="3" fill={shade(trunk, 0.7)} />
      <circle cx="35" cy="42" r="3" fill={shade(trunk, 0.62)} />
    </svg>
  )
}

type Deco =
  | { kind: 'palm' | 'cube' | 'octa' | 'prism'; color?: string }
  | { kind: 'icon'; icon: string; color: string }

type Placed = Deco & {
  top: string
  x: string
  size: number
  rot: number
  dur: number
  delay: number
}

const PALETTE = {
  pink: '#e0508c',
  orange: '#e08a3c',
  green: '#3cb45c',
  teal: '#37b8a8',
  blue: '#2e9fd0',
  purple: '#7f6ae0',
  red: '#d84c4c',
  yellow: '#d8b93c',
}

const LEFT: Placed[] = [
  { kind: 'palm', top: '6%', x: '1.2rem', size: 92, rot: -5, dur: 8, delay: 0 },
  { kind: 'cube', color: PALETTE.orange, top: '9%', x: '6.5rem', size: 40, rot: 14, dur: 7, delay: 1.2 },
  { kind: 'icon', icon: 'icon-keys', color: PALETTE.blue, top: '19%', x: '2rem', size: 96, rot: -8, dur: 9, delay: 0.6 },
  { kind: 'octa', color: PALETTE.pink, top: '30%', x: '5.5rem', size: 46, rot: 0, dur: 6.5, delay: 2 },
  { kind: 'prism', color: PALETTE.teal, top: '40%', x: '1rem', size: 38, rot: -12, dur: 7.5, delay: 0.3 },
  { kind: 'icon', icon: 'icon-guitar', color: PALETTE.purple, top: '48%', x: '3.5rem', size: 94, rot: -24, dur: 8.5, delay: 1.6 },
  { kind: 'icon', icon: 'icon-handsonic', color: PALETTE.teal, top: '56%', x: '4rem', size: 66, rot: 9, dur: 7.7, delay: 0.5 },
  { kind: 'cube', color: PALETTE.green, top: '64%', x: '1.5rem', size: 52, rot: 8, dur: 7, delay: 0.9 },
  { kind: 'palm', top: '72%', x: '5rem', size: 64, rot: 6, dur: 9.5, delay: 2.4 },
  { kind: 'cube', color: PALETTE.red, top: '79%', x: '4.5rem', size: 40, rot: -11, dur: 6.7, delay: 1.9 },
  { kind: 'octa', color: PALETTE.yellow, top: '84%', x: '2.2rem', size: 42, rot: 0, dur: 6.8, delay: 0.2 },
  { kind: 'icon', icon: 'icon-bongos', color: PALETTE.red, top: '91%', x: '6rem', size: 80, rot: 10, dur: 8, delay: 1.1 },
]

/** Second, inner column per gutter (x ≥ 10rem): fills the wide-open band
 * on 1900px+ screens; on narrower viewports it simply slides behind the
 * content column (z -5) like the outer column already does at ~1280px. */
const LEFT2: Placed[] = [
  { kind: 'octa', color: PALETTE.green, top: '6%', x: '11.5rem', size: 38, rot: 0, dur: 7.5, delay: 1.3 },
  { kind: 'octa', color: PALETTE.teal, top: '14%', x: '11rem', size: 40, rot: 0, dur: 7.3, delay: 0.5 },
  { kind: 'icon', icon: 'icon-headphones', color: PALETTE.red, top: '26%', x: '12.5rem', size: 62, rot: 8, dur: 8.6, delay: 1.7 },
  { kind: 'palm', top: '36%', x: '10.5rem', size: 50, rot: 4, dur: 8.1, delay: 1.0 },
  { kind: 'cube', color: PALETTE.pink, top: '46%', x: '10rem', size: 44, rot: -12, dur: 6.9, delay: 0.2 },
  { kind: 'palm', top: '58%', x: '12rem', size: 70, rot: -5, dur: 9.3, delay: 2.1 },
  { kind: 'icon', icon: 'icon-congos', color: PALETTE.orange, top: '74%', x: '10.5rem', size: 82, rot: -9, dur: 7.8, delay: 0.9 },
  { kind: 'icon', icon: 'icon-music', color: PALETTE.blue, top: '84%', x: '12rem', size: 54, rot: 7, dur: 8.4, delay: 2.5 },
  { kind: 'prism', color: PALETTE.yellow, top: '93%', x: '12.5rem', size: 38, rot: 10, dur: 7.1, delay: 1.4 },
]

const RIGHT: Placed[] = [
  { kind: 'icon', icon: 'icon-vibes', color: PALETTE.blue, top: '9%', x: '2rem', size: 96, rot: 7, dur: 8.2, delay: 0.4 },
  { kind: 'octa', color: PALETTE.blue, top: '15%', x: '7rem', size: 38, rot: 0, dur: 7.2, delay: 1.8 },
  { kind: 'palm', top: '23%', x: '1.2rem', size: 84, rot: 4, dur: 9, delay: 0.1 },
  { kind: 'prism', color: PALETTE.purple, top: '32%', x: '5rem', size: 36, rot: 8, dur: 7.7, delay: 1.5 },
  { kind: 'cube', color: PALETTE.purple, top: '40%', x: '4rem', size: 48, rot: -10, dur: 6.6, delay: 2.2 },
  { kind: 'icon', icon: 'icon-guitar', color: PALETTE.pink, top: '46%', x: '2.5rem', size: 92, rot: 22, dur: 8.8, delay: 0.8 },
  { kind: 'icon', icon: 'icon-bongos', color: PALETTE.orange, top: '53%', x: '5.5rem', size: 56, rot: -8, dur: 7.9, delay: 0.3 },
  { kind: 'prism', color: PALETTE.red, top: '58%', x: '1.2rem', size: 40, rot: 10, dur: 7.4, delay: 1.4 },
  { kind: 'cube', color: PALETTE.teal, top: '66%', x: '6rem', size: 44, rot: 16, dur: 7.9, delay: 0.5 },
  { kind: 'icon', icon: 'icon-drums', color: PALETTE.green, top: '77%', x: '2rem', size: 92, rot: -6, dur: 8.4, delay: 2.6 },
  { kind: 'palm', top: '87%', x: '5.5rem', size: 58, rot: -7, dur: 9.2, delay: 1 },
  { kind: 'octa', color: PALETTE.orange, top: '95%', x: '1.8rem', size: 36, rot: 0, dur: 6.9, delay: 0.7 },
]

const RIGHT2: Placed[] = [
  { kind: 'cube', color: PALETTE.green, top: '5%', x: '10.5rem', size: 40, rot: 9, dur: 7.3, delay: 1.1 },
  { kind: 'palm', top: '12%', x: '11rem', size: 66, rot: 6, dur: 8.9, delay: 0.3 },
  { kind: 'icon', icon: 'icon-headphones', color: PALETTE.teal, top: '23%', x: '11.5rem', size: 56, rot: -6, dur: 8.0, delay: 2.0 },
  { kind: 'cube', color: PALETTE.red, top: '31%', x: '10rem', size: 42, rot: 14, dur: 7.6, delay: 1.9 },
  { kind: 'icon', icon: 'icon-synth', color: PALETTE.red, top: '40%', x: '8.5rem', size: 116, rot: -7, dur: 8.3, delay: 0.6 },
  { kind: 'octa', color: PALETTE.purple, top: '55%', x: '10.5rem', size: 40, rot: 0, dur: 7.2, delay: 2.4 },
  { kind: 'palm', top: '64%', x: '11.5rem', size: 48, rot: -6, dur: 8.5, delay: 1.8 },
  { kind: 'icon', icon: 'icon-mic', color: PALETTE.pink, top: '73%', x: '12.5rem', size: 70, rot: 12, dur: 8.7, delay: 1.2 },
  { kind: 'prism', color: PALETTE.green, top: '88%', x: '10rem', size: 40, rot: -8, dur: 7.4, delay: 0.4 },
]

function itemHeight(item: Placed): number {
  return item.kind === 'palm' ? item.size * 1.3 : item.size
}

/**
 * Resolves each gutter as a vertical stack so items never overlap: the
 * designed percentage tops hold when the viewport is tall enough, items
 * get pushed down to clear the previous one (plus a gap) when it isn't,
 * and anything that runs off the bottom is hidden. The float animation
 * moves items ±7px, so the gap comfortably covers it. Runs after mount
 * (SSR keeps the raw percents — the layer is pure decor).
 */
function useStackedTops(items: Placed[]): (number | null)[] | null {
  const [tops, setTops] = useState<(number | null)[] | null>(null)
  useEffect(() => {
    const GAP = 22
    const compute = () => {
      const vh = window.innerHeight
      let cursor = 8
      const out: (number | null)[] = []
      for (const item of items) {
        const h = itemHeight(item)
        const desired = (parseFloat(item.top) / 100) * vh
        const top = Math.max(desired, cursor)
        if (top + h > vh - 4) {
          out.push(null)
          continue
        }
        out.push(top)
        cursor = top + h + GAP
      }
      setTops(out)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [items])
  return tops
}

function DecoItem({
  item,
  side,
  topPx,
}: {
  item: Placed
  side: 'left' | 'right'
  topPx?: number | null
}) {
  if (topPx === null) return null
  // Deeper items disappear first as the viewport narrows, so the scenery
  // recedes toward the edges instead of crowding the content column:
  // x >= 10rem (inner columns) need ~1800px, x >= 5rem need ~1560px.
  const xRem = parseFloat(item.x)
  const tier =
    xRem >= 10
      ? 'hidden min-[1800px]:block'
      : xRem >= 5
        ? 'hidden min-[1560px]:block'
        : ''
  const style: CSSProperties = {
    top: topPx !== undefined ? topPx : item.top,
    [side]: item.x,
    width: item.size,
    height: itemHeight(item),
    color: item.kind === 'icon' ? item.color : undefined,
    '--deco-rot': `${item.rot}deg`,
    animationDuration: `${item.dur}s`,
    animationDelay: `${item.delay}s`,
  } as CSSProperties
  return (
    <div className={`deco ${tier}`} style={style}>
      <DecoGraphic item={item} />
    </div>
  )
}

/** The actual artwork for one scenery item — shared by the fixed gutter
 * layer and the in-flow hero side strips. */
function DecoGraphic({ item }: { item: Deco }) {
  return item.kind === 'palm' ? (
    <Palm />
  ) : item.kind === 'icon' ? (
    <SpriteIcon name={item.icon} className="h-full w-full" />
  ) : item.kind === 'cube' ? (
    <Cube c={item.color ?? PALETTE.blue} />
  ) : item.kind === 'octa' ? (
    <Octa c={item.color ?? PALETTE.pink} />
  ) : (
    <Prism c={item.color ?? PALETTE.teal} />
  )
}


export function Decorations() {
  const leftTops = useStackedTops(LEFT)
  const rightTops = useStackedTops(RIGHT)
  // Each inner column stacks independently — items only ever collide
  // vertically within their own column.
  const left2Tops = useStackedTops(LEFT2)
  const right2Tops = useStackedTops(RIGHT2)
  // Until the stacker has produced pixel tops, the items sit at their raw
  // SSR percentages — keep the layer invisible (JS visitors only) so they
  // fade in at their settled positions instead of visibly snapping.
  const ready =
    leftTops !== null &&
    rightTops !== null &&
    left2Tops !== null &&
    right2Tops !== null
  return (
    <div
      className={`deco-layer hidden xl:block ${ready ? 'deco-ready' : ''}`}
      aria-hidden="true"
    >
      {LEFT.map((item, i) => (
        <DecoItem key={`l${i}`} item={item} side="left" topPx={leftTops?.[i]} />
      ))}
      {RIGHT.map((item, i) => (
        <DecoItem key={`r${i}`} item={item} side="right" topPx={rightTops?.[i]} />
      ))}
      {LEFT2.map((item, i) => (
        <DecoItem key={`l2${i}`} item={item} side="left" topPx={left2Tops?.[i]} />
      ))}
      {RIGHT2.map((item, i) => (
        <DecoItem key={`r2${i}`} item={item} side="right" topPx={right2Tops?.[i]} />
      ))}
    </div>
  )
}
