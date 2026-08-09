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
  { kind: 'palm', top: '4%', x: '1.2rem', size: 92, rot: -5, dur: 8, delay: 0 },
  { kind: 'cube', color: PALETTE.orange, top: '9%', x: '6.5rem', size: 40, rot: 14, dur: 7, delay: 1.2 },
  { kind: 'icon', icon: 'icon-keys', color: PALETTE.blue, top: '19%', x: '2rem', size: 74, rot: -8, dur: 9, delay: 0.6 },
  { kind: 'octa', color: PALETTE.pink, top: '30%', x: '5.5rem', size: 46, rot: 0, dur: 6.5, delay: 2 },
  { kind: 'prism', color: PALETTE.teal, top: '40%', x: '1rem', size: 38, rot: -12, dur: 7.5, delay: 0.3 },
  { kind: 'icon', icon: 'icon-guitar', color: PALETTE.purple, top: '48%', x: '3.5rem', size: 84, rot: -24, dur: 8.5, delay: 1.6 },
  { kind: 'cube', color: PALETTE.green, top: '62%', x: '1.5rem', size: 52, rot: 8, dur: 7, delay: 0.9 },
  { kind: 'palm', top: '70%', x: '5rem', size: 64, rot: 6, dur: 9.5, delay: 2.4 },
  { kind: 'octa', color: PALETTE.yellow, top: '84%', x: '2.2rem', size: 42, rot: 0, dur: 6.8, delay: 0.2 },
  { kind: 'icon', icon: 'icon-bongos', color: PALETTE.red, top: '91%', x: '6rem', size: 58, rot: 10, dur: 8, delay: 1.1 },
]

const RIGHT: Placed[] = [
  { kind: 'icon', icon: 'icon-synth', color: PALETTE.orange, top: '5%', x: '2rem', size: 76, rot: 7, dur: 8.2, delay: 0.4 },
  { kind: 'octa', color: PALETTE.blue, top: '15%', x: '7rem', size: 38, rot: 0, dur: 7.2, delay: 1.8 },
  { kind: 'palm', top: '23%', x: '1.2rem', size: 84, rot: 4, dur: 9, delay: 0.1 },
  { kind: 'cube', color: PALETTE.purple, top: '37%', x: '5.5rem', size: 48, rot: -10, dur: 6.6, delay: 2.2 },
  { kind: 'icon', icon: 'icon-guitar', color: PALETTE.pink, top: '46%', x: '2.5rem', size: 80, rot: 22, dur: 8.8, delay: 0.8 },
  { kind: 'prism', color: PALETTE.red, top: '58%', x: '1.2rem', size: 40, rot: 10, dur: 7.4, delay: 1.4 },
  { kind: 'cube', color: PALETTE.teal, top: '66%', x: '6rem', size: 44, rot: 16, dur: 7.9, delay: 0.5 },
  { kind: 'icon', icon: 'icon-drums', color: PALETTE.green, top: '77%', x: '2rem', size: 64, rot: -6, dur: 8.4, delay: 2.6 },
  { kind: 'palm', top: '87%', x: '5.5rem', size: 58, rot: -7, dur: 9.2, delay: 1 },
  { kind: 'octa', color: PALETTE.orange, top: '95%', x: '1.8rem', size: 36, rot: 0, dur: 6.9, delay: 0.7 },
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
    <div className="deco" style={style}>
      {item.kind === 'palm' ? (
        <Palm />
      ) : item.kind === 'icon' ? (
        <SpriteIcon
          name={item.icon}
          className="h-full w-full"
        />
      ) : item.kind === 'cube' ? (
        <Cube c={item.color ?? PALETTE.blue} />
      ) : item.kind === 'octa' ? (
        <Octa c={item.color ?? PALETTE.pink} />
      ) : (
        <Prism c={item.color ?? PALETTE.teal} />
      )}
    </div>
  )
}

export function Decorations() {
  const leftTops = useStackedTops(LEFT)
  const rightTops = useStackedTops(RIGHT)
  return (
    <div className="deco-layer hidden xl:block" aria-hidden="true">
      {LEFT.map((item, i) => (
        <DecoItem key={`l${i}`} item={item} side="left" topPx={leftTops?.[i]} />
      ))}
      {RIGHT.map((item, i) => (
        <DecoItem key={`r${i}`} item={item} side="right" topPx={rightTops?.[i]} />
      ))}
    </div>
  )
}
