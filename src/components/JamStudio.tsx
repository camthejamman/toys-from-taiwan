import { useEffect, useRef, useState } from 'react'
import { LoadingGears } from './LoadingGears'
import { THEME_EVENT } from './ThemeToggle'
import type { JamStudioHandle } from '../three/jamStudio'

/**
 * The jam-studio tableau on the landing page: Jam's gear as extruded 3D
 * SVGs on a wireframe grid (see src/three/jamStudio.ts), lazy-mounted on
 * idle and faded in. Purely decorative — the canvas is aria-hidden and
 * the SEO copy lives in regular HTML right below it.
 */
export function JamStudio({
  className = 'mx-auto -mt-8 max-w-5xl sm:-mt-24',
}: {
  /** Wrapper layout classes; the default is the landing-hero placement.
   * The scene itself always fills the box (aspect via .jam-studio). */
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hasIdleCallback = typeof window.requestIdleCallback === 'function'
    let handle: JamStudioHandle | null = null
    let idleId: number | null = null
    let disposed = false

    const start = () => {
      idleId = null
      import('../three/jamStudio')
        .then((mod) => {
          if (disposed || handle) return
          handle = mod.mountJamStudio(canvas, {
            dark: document.documentElement.classList.contains('dark'),
            reduceMotion: reduceMotion.matches,
          })
          if (handle) setLive(true)
          else setFailed(true)
        })
        .catch(() => {
          // WebGL/context failure — drop the gears, leave open sky.
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
    <div
      className={`jam-studio w-full ${className} ${live ? 'is-live' : ''} ${failed ? 'no3d' : ''}`}
      aria-hidden="true"
    >
      <div className="jam-studio-loading">
        <LoadingGears className="h-16 sm:h-28" />
      </div>
      <canvas ref={canvasRef} className="jam-studio-canvas" />
    </div>
  )
}
