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
  /* Landing hero: the box (and with it the scene — it refits on resize)
   * steps up with the viewport. The camera fit is height-bound in this
   * wide box, so the lg+ 2/1 aspect is what actually grows the
   * instruments; the svh cap hands short laptop screens a scene that
   * still fits under the title instead of overflowing the fold. */
  className = 'mx-auto -mt-10 max-w-5xl sm:-mt-28 lg:max-w-6xl lg:-mt-40 lg:[--studio-aspect:2/1] lg:max-h-[calc(100svh-18rem)] xl:max-w-7xl 2xl:max-w-[84rem] min-[1800px]:max-w-[92rem] min-[1800px]:-mt-48',
  onSettled,
  reveal,
}: {
  /** Wrapper layout classes; the default is the landing-hero placement.
   * The scene itself always fills the box (aspect via .jam-studio). */
  className?: string
  /** Fires once when the scene has painted its first frame OR failed —
   * lets the page gate several scenes into one simultaneous reveal. */
  onSettled?: () => void
  /** When provided, a ready scene stays hidden until this turns true. */
  reveal?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const live = ready && (reveal ?? true)
  const onSettledRef = useRef(onSettled)
  onSettledRef.current = onSettled

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
          if (handle) {
            // Double-rAF: let the first (shader-compiling) frame land and
            // paint while the canvas is still invisible, so the gears
            // cross-fade starts stutter-free.
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                if (disposed) return
                setReady(true)
                onSettledRef.current?.()
              }),
            )
          } else {
            setFailed(true)
            onSettledRef.current?.()
          }
        })
        .catch(() => {
          // WebGL/context failure — drop the gears, leave open sky.
          if (!disposed) {
            setFailed(true)
            onSettledRef.current?.()
          }
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
      {/* -translate lifts the cluster above the box's centerline — the
          box hangs below the title, so dead-center reads too low */}
      <div className="jam-studio-loading -translate-y-[10%]">
        <LoadingGears className="h-44 sm:h-56 md:h-72 lg:h-[28rem] min-[1800px]:h-[36rem]" />
      </div>
      <canvas ref={canvasRef} className="jam-studio-canvas" />
    </div>
  )
}
