import { useEffect, useRef, useState } from 'react'
import { THEME_EVENT } from './ThemeToggle'
import { SpriteIcon } from './SpriteIcon'
import type { JamGlyphHandle } from '../three/jamGlyph'

/**
 * The big 果酱 mark (footer): renders the sprite's icon-jam-cn with the
 * rainbow/3D icon treatment immediately, then the real extruded three.js
 * glyph loads on idle and cross-fades in on top — the HeroTitle pattern.
 * The 2.04 aspect matches the glyph's tight viewBox (203.4 × 99.6).
 */
export function JamGlyph3D({
  className = '',
  label,
}: {
  className?: string
  label: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hasIdleCallback = typeof window.requestIdleCallback === 'function'
    let handle: JamGlyphHandle | null = null
    let idleId: number | null = null
    let disposed = false

    const start = () => {
      idleId = null
      import('../three/jamGlyph')
        .then((mod) => {
          if (disposed || handle) return
          handle = mod.mountJamGlyph(canvas, {
            dark: document.documentElement.classList.contains('dark'),
            reduceMotion: reduceMotion.matches,
          })
          if (handle) setLive(true)
        })
        .catch(() => {
          // WebGL/context failure — the sprite fallback stays.
        })
    }

    idleId = hasIdleCallback
      ? window.requestIdleCallback(start, { timeout: 3000 })
      : window.setTimeout(start, 1500)

    const onTheme = (event: Event) => {
      handle?.setTheme((event as CustomEvent<{ dark: boolean }>).detail.dark)
    }
    window.addEventListener(THEME_EVENT, onTheme)

    const onMotionChange = () => {
      handle?.setReduceMotion(reduceMotion.matches)
    }
    reduceMotion.addEventListener('change', onMotionChange)

    return () => {
      disposed = true
      if (idleId !== null) {
        if (hasIdleCallback) window.cancelIdleCallback(idleId)
        else window.clearTimeout(idleId)
      }
      window.removeEventListener(THEME_EVENT, onTheme)
      reduceMotion.removeEventListener('change', onMotionChange)
      handle?.dispose()
      handle = null
    }
  }, [])

  return (
    <span
      className={`hero3d ${live ? 'is-live' : ''} ${className}`}
      style={{ aspectRatio: '2.04' }}
    >
      <SpriteIcon
        name="icon-jam-cn"
        className="h-full w-full icon-3d hero3d-fallback"
        tint="#d6437f"
        label={label}
      />
      <canvas ref={canvasRef} className="hero3d-canvas" aria-hidden="true" />
    </span>
  )
}
