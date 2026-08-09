import { useEffect, useRef, useState } from 'react'
import { THEME_EVENT } from './ThemeToggle'
import { SpriteIcon } from './SpriteIcon'
import { Wordmark3D } from './Wordmark3D'
import type { HeroTitleHandle } from '../three/heroTitle'

/**
 * Landing-page wordmark block: title + "100% Live-Looping…" subtitle +
 * 果酱, exactly like the Shorts! covers. The CSS lettering renders
 * immediately (and is what prerender, no-JS, and failed-WebGL visitors
 * keep — it also sizes the box), then the extruded three.js version loads
 * on idle and cross-fades in on top. Under reduced motion the 3D title
 * still mounts but renders a single static frame.
 */
export function HeroTitle({
  text,
  subtitle,
}: {
  text: string
  subtitle: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hasIdleCallback = typeof window.requestIdleCallback === 'function'
    let handle: HeroTitleHandle | null = null
    let idleId: number | null = null
    let disposed = false

    const start = () => {
      idleId = null
      import('../three/heroTitle')
        .then((mod) => {
          if (disposed || handle) return
          handle = mod.mountHeroTitle(canvas, {
            text,
            subtitle,
            dark: document.documentElement.classList.contains('dark'),
            reduceMotion: reduceMotion.matches,
          })
          if (handle) setLive(true)
          else setFailed(true)
        })
        .catch(() => {
          // WebGL/context failure — bring the CSS lettering back.
          if (!disposed) setFailed(true)
        })
    }

    idleId = hasIdleCallback
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1200)

    const onTheme = (event: Event) => {
      handle?.setTheme((event as CustomEvent<{ dark: boolean }>).detail.dark)
    }
    window.addEventListener(THEME_EVENT, onTheme)

    // Honor reduced-motion changes live, not just at mount (same contract
    // as AmbientSky): flipping it on freezes the title on a resting frame.
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
  }, [text, subtitle])

  return (
    <div
      className={`hero3d hero3d-tall ${live ? 'is-live' : ''} ${failed ? 'no3d' : ''}`}
    >
      <div className="hero3d-fallback">
        <h1 className="m-0 text-[clamp(1.55rem,7.8vw,2.25rem)] leading-tight sm:text-6xl lg:text-7xl">
          <Wordmark3D text={text} />
        </h1>
        <p className="m-0 mt-1 flex items-center justify-center gap-[0.4em] text-[clamp(0.9rem,4.4vw,1.3rem)] sm:text-[2.1rem] lg:text-[2.5rem]">
          <Wordmark3D text={subtitle} />
          {/* Explicit width: sprite <svg>s have no intrinsic ratio, so
              w-auto would balloon to the 300px SVG default and blow the
              hero box (and the canvas centered on it) off small screens. */}
          <SpriteIcon
            name="icon-jam-cn"
            className="h-[1.5em] w-[3.06em] icon-3d"
            tint="#d6437f"
            label="果酱"
          />
        </p>
      </div>
      <canvas ref={canvasRef} className="hero3d-canvas" aria-hidden="true" />
    </div>
  )
}
