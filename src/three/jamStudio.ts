/**
 * Lazy-loaded three.js "jam studio" hero scene — the instrument tableau
 * from the Solune poster generators: Jam's actual gear (speakers, guitar,
 * keyboard, handsonic, loop stations) extruded from the jam/svg artwork,
 * standing on a wireframe grid floor. The canvas is transparent, so the
 * site's own sky (clouds by day, stars by night) is the backdrop.
 *
 * The posters strobe their colors every 350ms; here the materials *drift*
 * — each eases toward a palette color and picks a new one on arrival —
 * which keeps the toy-box feel without flashing. Same frugal contract as
 * the other scenes: DPR capped, ACES, paused off-screen/hidden, honors
 * reduced-motion live (static deterministic colors), disposed on unmount.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  GridHelper,
  Group,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import speakerLeftRaw from '../assets/instruments/speaker-left.svg?raw'
import speakerRightRaw from '../assets/instruments/speaker-right.svg?raw'
import guitarRaw from '../assets/instruments/guitar.svg?raw'
import keyboardRaw from '../assets/instruments/keyboard.svg?raw'
import handsonicRaw from '../assets/instruments/handsonic.svg?raw'
import loopstationRaw from '../assets/instruments/loopstation.svg?raw'

export type JamStudioHandle = {
  setTheme: (dark: boolean) => void
  setReduceMotion: (reduce: boolean) => void
  dispose: () => void
}

/** Vivid toy-box palette for light mode — brighter than the day poster's
 * crayon set, so the gear reads fun against the pale sky. */
const LIGHT_PALETTE = [
  '#ff4655', // red
  '#2f9dff', // blue
  '#ffd23f', // yellow
  '#2fe07a', // green
  '#ff9432', // orange
  '#c05bff', // purple
  '#7d6bff', // violet
  '#ff5fb4', // pink
]

/** Luminous pastels for the night poster look. */
const DARK_PALETTE = [
  '#ff9d9d',
  '#9fb5ff',
  '#ffe89e',
  '#9df0b2',
  '#ffc48f',
  '#d9a3f0',
  '#b8a8ff',
  '#ff9fd4',
]

/** Materials glow a fraction of their own color (the vol1 lettering trick)
 * so they stay vibrant under ACES instead of dimming in shadow. */
const GLOW = 0.22

const GRID_LIGHT = '#1a3a8a'
const GRID_DARK = '#66ff33' // bright lime — gridMat is toneMapped:false, so this renders as-is

type CyclingMat = { mat: MeshStandardMaterial; target: Color }

export function mountJamStudio(
  canvas: HTMLCanvasElement,
  options: { dark: boolean; reduceMotion: boolean },
): JamStudioHandle | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new Scene()
  const camera = new PerspectiveCamera(40, 1, 1, 30000)

  scene.add(new AmbientLight(0xffffff, 0.7))
  const key = new DirectionalLight(0xffffff, 1.1)
  key.position.set(200, 400, 350)
  const fillL = new DirectionalLight(0xc8d4ff, 0.4)
  fillL.position.set(-300, 200, 200)
  const rim = new DirectionalLight(0xffe4b5, 0.5)
  rim.position.set(0, 150, -400)
  scene.add(key, fillL, rim)

  let dark = options.dark
  let palette = dark ? DARK_PALETTE : LIGHT_PALETTE
  const cycling: CyclingMat[] = []
  const disposables: { dispose: () => void }[] = [renderer]
  const loader = new SVGLoader()

  /** Deterministic-ish next target; random is fine here (client-only). */
  function nextTarget(current: Color): Color {
    let pick: string
    do {
      pick = palette[Math.floor(Math.random() * palette.length)]
    } while (new Color(pick).equals(current))
    return new Color(pick)
  }

  /** Port of the poster's loadSvgGroup, parsing raw SVG text synchronously:
   * first painted path = beveled body extrusion, later paths = thin
   * overlays stacked forward in paint order. */
  function svgGroup(
    raw: string,
    opts: {
      depth?: number
      pathColors?: string[]
      cycleColors?: boolean
    } = {},
  ): Group {
    const { depth = 8, pathColors = null, cycleColors = true } = opts
    const bevelThickness = 0.6
    const bevelSize = 0.3
    const overlayDepth = 1.2
    const layerSpacing = 0.4
    const data = loader.parse(raw)
    const group = new Group()

    const matCache = new Map<string, MeshStandardMaterial>()
    function getMat(fillStr: string): MeshStandardMaterial {
      let m = matCache.get(fillStr)
      if (!m) {
        const base = new Color(fillStr)
        m = new MeshStandardMaterial({
          color: base,
          emissive: base.clone().multiplyScalar(GLOW),
          roughness: 0.45,
          metalness: 0.05,
          side: DoubleSide,
        })
        matCache.set(fillStr, m)
        disposables.push(m)
        if (cycleColors) cycling.push({ mat: m, target: nextTarget(m.color) })
      }
      return m
    }

    const bodyFrontZ = depth / 2 + bevelThickness
    let painted = 0
    for (let i = 0; i < data.paths.length; i++) {
      const path = data.paths[i]
      const style = path.userData?.style as { fill?: string } | undefined
      const fill = style?.fill
      if (fill === undefined || fill === 'none') continue
      const colorKey = pathColors?.[painted] !== undefined ? pathColors[painted] : fill
      const mat = getMat(colorKey)
      const isBody = painted === 0
      painted++

      for (const shape of SVGLoader.createShapes(path)) {
        if (isBody) {
          const geo = new ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: true,
            bevelThickness,
            bevelSize,
            bevelSegments: 3,
            curveSegments: 12,
          })
          geo.translate(0, 0, -depth / 2)
          disposables.push(geo)
          group.add(new Mesh(geo, mat))
        } else {
          const geo = new ExtrudeGeometry(shape, {
            depth: overlayDepth,
            bevelEnabled: false,
            curveSegments: 12,
          })
          geo.translate(0, 0, bodyFrontZ + (painted - 2) * layerSpacing + 0.01)
          disposables.push(geo)
          group.add(new Mesh(geo, mat))
        }
      }
    }

    // SVGs are Y-down; flip so they stand upright (DoubleSide handles the
    // reversed winding, matching the poster generators).
    group.scale.y = -1

    const box = new Box3().setFromObject(group)
    const center = new Vector3()
    const size = new Vector3()
    box.getCenter(center)
    box.getSize(size)
    const pivot = new Group()
    group.position.sub(center)
    pivot.add(group)
    pivot.userData.size = size
    return pivot
  }

  function fitToHeight(pivot: Group, target: number) {
    pivot.scale.setScalar(target / pivot.userData.size.y)
  }
  function fitToWidth(pivot: Group, target: number) {
    pivot.scale.setScalar(target / pivot.userData.size.x)
  }

  // --- build the tableau (positions straight from the poster) ---
  const C = {
    pink: '#ff4fb0',
    blue: '#2098ff',
    yellow: '#ffe93b',
    green: '#44e87a',
    orange: '#ff913d',
  }
  const speakerL = svgGroup(speakerLeftRaw, { pathColors: [C.pink] })
  const speakerR = svgGroup(speakerRightRaw, { pathColors: [C.pink] })
  const guitar = svgGroup(guitarRaw, {
    depth: 10,
    pathColors: [C.green, C.pink, C.pink, C.pink],
  })
  const keyboard = svgGroup(keyboardRaw, {
    pathColors: [C.blue, C.blue, C.yellow, C.orange],
  })
  const handsonic = svgGroup(handsonicRaw, {
    pathColors: [C.yellow, C.orange, C.pink],
  })
  const loopColors = ['#ff3b3b', '#ff3b3b', '#ff3b3b', '#ff3b3b']
  const loop1 = svgGroup(loopstationRaw, { depth: 6, pathColors: loopColors, cycleColors: false })
  const loop2 = svgGroup(loopstationRaw, { depth: 6, pathColors: loopColors, cycleColors: false })

  fitToHeight(speakerL, 400)
  fitToHeight(speakerR, 400)
  fitToHeight(guitar, 940)
  fitToHeight(keyboard, 410)
  fitToHeight(handsonic, 620)
  fitToWidth(loop1, 305)
  fitToWidth(loop2, 305)

  // -545, not the poster's -620: the grid compacts around its own center
  // (x=60) faster than instrument positions compact around the origin, so
  // any further left and the tripod feet land off-grid on narrow layouts.
  speakerL.position.set(-545, -260 + 400 / 2, 760)
  speakerR.position.set(640, -260 + 400 / 2, 760)
  keyboard.position.set(-430, -260 + 410 / 2, 240)
  keyboard.rotation.y = -0.04
  keyboard.scale.x *= -1
  handsonic.position.set(615, -260 + 620 / 2, 200)
  handsonic.rotation.y = -0.08
  guitar.position.set(-120, 435, 100)
  guitar.rotation.z = (51 * Math.PI) / 180
  loop1.position.set(-100, -230, 260)
  loop2.position.set(220, -230, 260)

  const studio = new Group()
  studio.add(speakerL, speakerR, guitar, keyboard, handsonic, loop1, loop2)
  scene.add(studio)

  // Poster placement assumes a wide frame. Narrow screens compact the
  // stage instead: instruments slide toward center and the grid narrows,
  // the same move the portrait posters make. Base positions are the
  // design; fitCamera interpolates from them per aspect.
  const pivots = [speakerL, speakerR, keyboard, handsonic, guitar, loop1, loop2]
  const basePositions = pivots.map((p) => p.position.clone())

  const grid = new GridHelper(1640, 27, GRID_LIGHT, GRID_LIGHT)
  grid.position.set(60, -260, 0)
  const gridMat = grid.material as LineBasicMaterial
  // GridHelper bakes its constructor colors in as VERTEX colors; leaving
  // vertexColors on multiplies them into the material color and muddies
  // every theme tint. Paint with the material color alone.
  gridMat.vertexColors = false
  gridMat.transparent = true
  gridMat.opacity = 0.95
  gridMat.toneMapped = false
  disposables.push(grid.geometry, gridMat)
  scene.add(grid)

  function applyTheme() {
    palette = dark ? DARK_PALETTE : LIGHT_PALETTE
    gridMat.color.set(dark ? GRID_DARK : GRID_LIGHT)
    // Snap every drifting material onto the new palette (deterministic by
    // index) so a theme flip reads instantly, then let the drift resume.
    cycling.forEach((c, i) => {
      c.mat.color.set(palette[i % palette.length])
      c.mat.emissive.copy(c.mat.color).multiplyScalar(GLOW)
      c.target = nextTarget(c.mat.color)
    })
  }
  applyTheme()

  // --- camera framing (slight look-down, projection-verified fit) ---
  const fitBox = new Box3()
  const size = new Vector3()
  const center = new Vector3()

  /** Largest |NDC| extent of the fit box's corners under the current
   * camera — the honest measure of what actually lands on screen. */
  function projectedExtent(): { x: number; y: number } {
    let mx = 0
    let my = 0
    const v = new Vector3()
    for (const cx of [fitBox.min.x, fitBox.max.x])
      for (const cy of [fitBox.min.y, fitBox.max.y])
        for (const cz of [fitBox.min.z, fitBox.max.z]) {
          v.set(cx, cy, cz).project(camera)
          mx = Math.max(mx, Math.abs(v.x))
          my = Math.max(my, Math.abs(v.y))
        }
    return { x: mx, y: my }
  }

  function fitCamera() {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    camera.aspect = width / height

    // Compact the stage as the frame narrows: 1 at desktop 2.15:1 down to
    // ~0.55/0.65 on portrait phones.
    const t = Math.min(1, Math.max(0, (camera.aspect - 0.7) / (2.15 - 0.7)))
    const kx = 0.55 + 0.45 * t
    const kz = 0.65 + 0.35 * t
    pivots.forEach((p, i) => {
      const base = basePositions[i]
      p.position.set(base.x * kx, base.y, base.z * kz)
    })
    grid.scale.set(kx, 1, kz)

    scene.updateMatrixWorld()
    fitBox.setFromObject(studio)
    fitBox.expandByObject(grid)
    fitBox.getSize(size)
    fitBox.getCenter(center)

    // Flat first guess, then refine against the true projection: the
    // speakers and the grid's near edge sit far forward, so they project
    // wider than any flat fit predicts — especially on narrow frames.
    const fov = (camera.fov * Math.PI) / 180
    const distH = size.y / (2 * Math.tan(fov / 2))
    const distW = size.x / (2 * Math.tan(fov / 2) * camera.aspect)
    let dist = Math.max(distH, distW)
    for (let i = 0; i < 4; i++) {
      camera.position.set(center.x, center.y + dist * 0.1, center.z + dist)
      camera.lookAt(center)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      const e = projectedExtent()
      const scale = Math.max(e.x, e.y) / 0.96
      if (Math.abs(scale - 1) < 0.01) break
      dist *= scale
    }
    renderer.setSize(width, height, false)
  }
  fitCamera()

  let frame = 0
  let running = false
  let reduceMotion = options.reduceMotion
  const start = performance.now()
  let last = start

  function renderFrame() {
    renderer.render(scene, camera)
  }

  const scratch = new Color()
  function tick() {
    frame = requestAnimationFrame(tick)
    const now = performance.now()
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    const t = (now - start) / 1000
    // Ease each material toward its palette target; new target on arrival.
    const k = 1 - Math.exp(-dt * 0.9)
    for (const c of cycling) {
      c.mat.color.lerp(c.target, k)
      c.mat.emissive.copy(c.mat.color).multiplyScalar(GLOW)
      scratch.copy(c.mat.color)
      if (
        Math.abs(scratch.r - c.target.r) +
          Math.abs(scratch.g - c.target.g) +
          Math.abs(scratch.b - c.target.b) <
        0.03
      ) {
        c.target = nextTarget(c.target)
      }
    }
    // Gentle life: the guitar floats, the whole studio breathes.
    guitar.position.y = 435 + Math.sin(t * 0.6) * 16
    guitar.rotation.z = (51 * Math.PI) / 180 + Math.sin(t * 0.35) * 0.03
    studio.rotation.y = Math.sin(t * 0.16) * 0.02
    renderFrame()
  }

  function play() {
    if (running || reduceMotion) return
    running = true
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }

  function pause() {
    running = false
    cancelAnimationFrame(frame)
  }

  function restPose() {
    guitar.position.y = 435
    guitar.rotation.z = (51 * Math.PI) / 180
    studio.rotation.y = 0
  }

  const onVisibility = () => {
    if (document.hidden) pause()
    else if (visible) play()
  }
  document.addEventListener('visibilitychange', onVisibility)

  let visible = true
  const io = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1]
    visible = entry?.isIntersecting ?? true
    if (visible && !document.hidden) play()
    else pause()
  })
  io.observe(canvas)

  // Render synchronously after every refit — the buffer resize clears the
  // canvas, and ResizeObserver fires after rAF, so deferring the render
  // paints a blank frame per resize step (resize blink).
  const ro = new ResizeObserver(() => {
    fitCamera()
    renderFrame()
  })
  ro.observe(canvas)

  renderFrame()
  if (!options.reduceMotion) play()

  return {
    setTheme(isDark: boolean) {
      dark = isDark
      applyTheme()
      if (!running) renderFrame()
    },
    setReduceMotion(reduce: boolean) {
      reduceMotion = reduce
      if (reduce) {
        pause()
        restPose()
        applyTheme()
        renderFrame()
      } else if (visible && !document.hidden) {
        play()
      }
    },
    dispose() {
      pause()
      document.removeEventListener('visibilitychange', onVisibility)
      io.disconnect()
      ro.disconnect()
      for (const d of disposables) d.dispose()
    },
  }
}
