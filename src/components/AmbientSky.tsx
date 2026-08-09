import { useEffect, useRef } from 'react'
import { THEME_EVENT } from './ThemeToggle'
import type { AmbientSkyHandle } from '../three/ambientSky'

/**
 * Full-viewport ambient background: drifting clouds by day, a twinkling
 * starfield by night. The three.js scene is loaded lazily on idle so it
 * costs nothing on first paint — until then (and whenever WebGL is
 * unavailable or reduced motion is requested) the static CSS sky shows.
 */
export function AmbientSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hasIdleCallback = typeof window.requestIdleCallback === 'function'
    let handle: AmbientSkyHandle | null = null
    let idleId: number | null = null
    let disposed = false

    const start = () => {
      idleId = null
      import('../three/ambientSky')
        .then((mod) => {
          if (disposed || reduceMotion.matches || handle) return
          handle = mod.mountAmbientSky(canvas, {
            dark: document.documentElement.classList.contains('dark'),
          })
          if (handle) document.documentElement.classList.add('sky-live')
        })
        .catch(() => {
          // WebGL/context failure — the CSS sky stays, nothing to do.
        })
    }

    // Load on idle so the scene never competes with first paint.
    const schedule = () => {
      if (idleId !== null || handle) return
      idleId = hasIdleCallback
        ? window.requestIdleCallback(start, { timeout: 2500 })
        : window.setTimeout(start, 1200)
    }

    const unschedule = () => {
      if (idleId === null) return
      if (hasIdleCallback) window.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
      idleId = null
    }

    const teardown = () => {
      document.documentElement.classList.remove('sky-live')
      handle?.dispose()
      handle = null
    }

    // Honor reduced-motion changes live, not just at mount.
    const onMotionChange = () => {
      if (reduceMotion.matches) {
        unschedule()
        teardown()
      } else {
        schedule()
      }
    }
    reduceMotion.addEventListener('change', onMotionChange)

    const onTheme = (event: Event) => {
      handle?.setTheme((event as CustomEvent<{ dark: boolean }>).detail.dark)
    }
    window.addEventListener(THEME_EVENT, onTheme)

    if (!reduceMotion.matches) schedule()

    return () => {
      disposed = true
      unschedule()
      reduceMotion.removeEventListener('change', onMotionChange)
      window.removeEventListener(THEME_EVENT, onTheme)
      teardown()
    }
  }, [])

  return <canvas ref={canvasRef} className="ambient-canvas" aria-hidden="true" />
}
