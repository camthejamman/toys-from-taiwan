/**
 * Lazy-loaded three.js hero wordmark: the landing page's "Toys From Taiwan"
 * with the "100% Live-Looping with JAM 果酱" subtitle beneath it — a direct
 * port of the Shorts! cover lettering (vol1/vol2 generators): bold
 * helvetiker title with the violet→red gradient, thinner regular-weight
 * subtitle running the gradient the opposite way (red→violet) with the
 * mid-band lightness dip, and the 果酱 SVG extruded oversized at the end.
 *
 * Deliberately frugal, mirroring ambientSky.ts: one scene, ~40 meshes, DPR
 * capped at 2, paused while the tab is hidden or the hero is scrolled
 * away, single static frame under reduced motion, fully disposed on
 * unmount. Dynamically imported on idle so the typeface JSONs and text
 * geometry never touch the critical path.
 */
import {
  ACESFilmicToneMapping,
  Box3,
  BufferAttribute,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { extrudedFaceLightness, gradientHue } from '../lib/rainbow'
import boldTypeface from './fonts/helvetiker_bold.typeface.json'
import regularTypeface from './fonts/helvetiker_regular.typeface.json'
import jamSvgRaw from '../assets/jam-standard.svg?raw'

export type HeroTitleHandle = {
  setTheme: (dark: boolean) => void
  setReduceMotion: (reduce: boolean) => void
  dispose: () => void
}

const SIZE = 10
const SUB_SIZE = SIZE * 0.57 // vol1 ratio (2.85 / 5)
const SATURATION = 0.95

type RowMesh = {
  mesh: Mesh
  /** Left edge in row space, for gradient position + recoloring. */
  cursorX: number
}

/** vol1's subtitle lightnessFn, retuned for the site's paler sky: darken
 * the middle range where the gradient passes through teal/cyan. */
function subtitleLightness(t: number, dark: boolean): number {
  const dist = Math.abs(t - 0.4)
  const dip = Math.max(0, 1 - (dist / 0.32) ** 2)
  return dark ? 0.66 - 0.05 * dip : 0.52 - 0.18 * dip
}

export function mountHeroTitle(
  canvas: HTMLCanvasElement,
  options: {
    text: string
    subtitle: string
    dark: boolean
    reduceMotion: boolean
  },
): HeroTitleHandle | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // Same filmic curve as the cover generators — without it the lit faces
  // clip toward white and the gradient reads washed out.
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new Scene()
  const camera = new PerspectiveCamera(30, 1, 0.1, 500)

  // Lighting straight from the cover generators: warm hemisphere, hard sun,
  // cool fill. Dark mode cools the hemisphere so faces read moonlit.
  const hemi = new HemisphereLight(0xfff6e8, 0x88aacc, 0.85)
  const sun = new DirectionalLight(0xffffff, 1.2)
  sun.position.set(40, 60, 30)
  const fill = new DirectionalLight(0xbfdfff, 0.4)
  fill.position.set(-30, 20, -20)
  scene.add(hemi, sun, fill)

  function makeMaterial() {
    return new MeshStandardMaterial({
      vertexColors: true,
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.05,
    })
  }

  /** Per-letter extruded text row laid along +X from 0. */
  function buildRow(
    fontData: typeof boldTypeface,
    text: string,
    size: number,
    opts: { depthRatio: number; bevelT: number; bevelS: number; bevelSeg: number },
  ): { meshes: RowMesh[]; width: number; group: Group } {
    const font = new FontLoader().parse(fontData)
    const rowGroup = new Group()
    const meshes: RowMesh[] = []
    let cursor = 0
    for (const ch of text) {
      if (ch === ' ') {
        cursor += size * 0.55
        continue
      }
      const geo = new TextGeometry(ch, {
        font,
        size,
        depth: size * opts.depthRatio,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: size * opts.bevelT,
        bevelSize: size * opts.bevelS,
        bevelOffset: 0,
        bevelSegments: opts.bevelSeg,
      })
      geo.computeBoundingBox()
      geo.translate(-geo.boundingBox!.min.x, 0, 0)
      geo.computeBoundingBox()
      const w = geo.boundingBox!.max.x - geo.boundingBox!.min.x
      const mesh = new Mesh(geo, makeMaterial())
      mesh.position.x = cursor
      rowGroup.add(mesh)
      meshes.push({ mesh, cursorX: cursor })
      cursor += w + size * 0.05
    }
    return { meshes, width: cursor || 1, group: rowGroup }
  }

  // ---- title row (bold) ----
  const title = buildRow(boldTypeface, options.text, SIZE, {
    depthRatio: 0.25,
    bevelT: 0.04,
    bevelS: 0.025,
    bevelSeg: 3,
  })

  // ---- subtitle row (regular weight, vol1's thinner profile) ----
  const sub = buildRow(regularTypeface, options.subtitle, SUB_SIZE, {
    depthRatio: 0.2,
    bevelT: 0.02,
    bevelS: 0.015,
    bevelSeg: 2,
  })

  // ---- 果酱, extruded from the SVG and dropped after the subtitle text,
  // noticeably larger than the surrounding caps (vol1: 1.66×) ----
  const svgData = new SVGLoader().parse(jamSvgRaw)
  const svgShapes = svgData.paths.flatMap((p) => SVGLoader.createShapes(p))
  const svgGeo = new ExtrudeGeometry(svgShapes, {
    depth: SUB_SIZE * 0.25,
    bevelEnabled: true,
    bevelThickness: SUB_SIZE * 0.04,
    bevelSize: SUB_SIZE * 0.025,
    bevelSegments: 3,
    curveSegments: 12,
  })
  // SVG y is down; flip to y-up, then fix the reversed winding + normals.
  svgGeo.scale(1, -1, 1)
  {
    const idx = svgGeo.index
    if (idx) {
      const a = idx.array
      for (let i = 0; i < a.length; i += 3) {
        const tmp = a[i + 1]
        a[i + 1] = a[i + 2]
        a[i + 2] = tmp
      }
      idx.needsUpdate = true
    }
    svgGeo.computeVertexNormals()
  }
  svgGeo.computeBoundingBox()
  {
    const bb = svgGeo.boundingBox!
    const scale = (SUB_SIZE * 1.66) / (bb.max.y - bb.min.y)
    svgGeo.scale(scale, scale, 1)
    svgGeo.computeBoundingBox()
    svgGeo.translate(-svgGeo.boundingBox!.min.x, -svgGeo.boundingBox!.min.y, 0)
    svgGeo.computeBoundingBox()
  }
  const svgWidth = svgGeo.boundingBox!.max.x
  const svgMesh = new Mesh(svgGeo, makeMaterial())
  // vol1 gets its breathing room from a trailing space in the source
  // string plus a small gap — fold both into the gap here.
  const svgGap = SUB_SIZE * 0.62
  svgMesh.position.set(sub.width + svgGap, -(SUB_SIZE * 1.66 - SUB_SIZE) / 2, 0)
  sub.group.add(svgMesh)
  const subTotalWidth = sub.width + svgGap + svgWidth

  // ---- assemble: title centered at y=0, subtitle centered beneath ----
  const group = new Group()
  title.group.position.x = -title.width / 2
  sub.group.position.set(-subTotalWidth / 2, -SIZE * 1.16, 0)
  group.add(title.group, sub.group)
  group.position.z = -SIZE * 0.125
  scene.add(group)

  const allMeshes: Mesh[] = [
    ...title.meshes.map((m) => m.mesh),
    ...sub.meshes.map((m) => m.mesh),
    svgMesh,
  ]

  function paintVertexColors(
    mesh: Mesh,
    hueAt: (t: number) => number,
    lightAt: (t: number) => number,
    localMin: number,
    range: number,
    offset: number,
  ) {
    const geo = mesh.geometry
    const positions = geo.attributes.position
    const colors = new Float32Array(positions.count * 3)
    const tmp = new Color()
    for (let i = 0; i < positions.count; i++) {
      const t = Math.min(
        1,
        Math.max(0, (offset + positions.getX(i) - localMin) / range),
      )
      tmp.setHSL(hueAt(t), SATURATION, lightAt(t))
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3))
  }

  function colorize(dark: boolean) {
    // Title: violet on the left running to red — the cover title gradient.
    for (const { mesh, cursorX } of title.meshes) {
      paintVertexColors(
        mesh,
        (t) => gradientHue(1 - t),
        (t) => extrudedFaceLightness(t, dark),
        0,
        title.width,
        cursorX,
      )
    }
    // Subtitle: the gradient runs the opposite way (red → violet), with
    // the vol1 mid-band dip so teal/cyan letters hold against the sky.
    for (const { mesh, cursorX } of sub.meshes) {
      paintVertexColors(
        mesh,
        (t) => gradientHue(t),
        (t) => subtitleLightness(t, dark),
        0,
        sub.width,
        cursorX,
      )
    }
    // 果酱: rainbow across the glyph's own width (vol1 verbatim).
    {
      const bb = svgGeo.boundingBox!
      paintVertexColors(
        svgMesh,
        (t) => gradientHue(1 - t),
        (t) => subtitleLightness(t, dark),
        bb.min.x,
        bb.max.x - bb.min.x || 1,
        0,
      )
    }
    hemi.color.set(dark ? 0xdde8ff : 0xfff6e8)
    hemi.intensity = dark ? 0.9 : 0.85
    sun.intensity = dark ? 1.15 : 1.2
  }
  colorize(options.dark)

  // World-space bounds of the assembled block (title + subtitle + 果酱),
  // used for both the distance fit and the projected centering.
  scene.updateMatrixWorld()
  const bounds = new Box3().setFromObject(group)
  const blockSize = new Vector3()
  bounds.getSize(blockSize)

  /** Screen-space (NDC) center of every mesh's bounding box. */
  function projectedCenter(): { x: number; y: number } {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const v = new Vector3()
    for (const mesh of allMeshes) {
      const bb = mesh.geometry.boundingBox!
      for (const cx of [bb.min.x, bb.max.x])
        for (const cy of [bb.min.y, bb.max.y])
          for (const cz of [bb.min.z, bb.max.z]) {
            v.set(cx, cy, cz)
            mesh.localToWorld(v)
            v.project(camera)
            minX = Math.min(minX, v.x)
            maxX = Math.max(maxX, v.x)
            minY = Math.min(minY, v.y)
            maxY = Math.max(maxY, v.y)
          }
    }
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
  }

  // Slight side-on camera like the covers (azim ~9°) so the extrusion shows.
  function fitCamera() {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    // Re-read DPR: browser zoom or a monitor hop changes it after mount.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    camera.aspect = width / height
    const vFov = (camera.fov * Math.PI) / 180
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)
    // The side-on azimuth brings the block's near end closer to the camera,
    // so it projects wider than a straight-on fit — pad generously.
    const fitW = (blockSize.x / 2 / Math.tan(hFov / 2)) * 1.3
    const fitH = (blockSize.y / 2 / Math.tan(vFov / 2)) * 1.12
    const dist = Math.max(fitW, fitH)
    const azim = 0.16
    const elev = 0.06
    camera.position.set(
      Math.sin(azim) * dist,
      Math.sin(elev) * dist,
      Math.cos(azim) * dist,
    )
    const target = new Vector3(0, 0, 0)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    // The angled view projects asymmetrically (the near end reads wider),
    // so the world-space center is NOT the optical center. Pan the camera
    // along its own right/up axes until the projected bounds sit
    // dead-center; two passes converge well within a pixel.
    for (let i = 0; i < 2; i++) {
      scene.updateMatrixWorld()
      camera.updateMatrixWorld()
      const c = projectedCenter()
      const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
      const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1)
      const pan = right
        .multiplyScalar(c.x * dist * Math.tan(hFov / 2))
        .add(up.multiplyScalar(c.y * dist * Math.tan(vFov / 2)))
      camera.position.add(pan)
      target.add(pan)
      camera.lookAt(target)
    }
    renderer.setSize(width, height, false)
  }
  fitCamera()

  let frame = 0
  let running = false
  let reduceMotion = options.reduceMotion
  const start = performance.now()

  function renderFrame() {
    renderer.render(scene, camera)
  }

  function tick() {
    frame = requestAnimationFrame(tick)
    const t = (performance.now() - start) / 1000
    // Gentle per-letter bob on the title with a phase stagger, plus a slow
    // group sway — enough life to read as a jam, quiet enough to leave the
    // copy readable. The subtitle stays put, like the covers.
    title.meshes.forEach((letter, i) => {
      letter.mesh.position.y = Math.sin(t * 1.3 + i * 0.55) * 0.32
    })
    group.rotation.y = Math.sin(t * 0.24) * 0.045
    renderFrame()
  }

  function play() {
    if (running || reduceMotion) return
    running = true
    frame = requestAnimationFrame(tick)
  }

  function pause() {
    running = false
    cancelAnimationFrame(frame)
  }

  /** Reset the bob/sway pose so a paused frame is the clean resting one. */
  function restPose() {
    for (const letter of title.meshes) letter.mesh.position.y = 0
    group.rotation.y = 0
  }

  const onVisibility = () => {
    if (document.hidden) pause()
    else if (visible) play()
  }
  document.addEventListener('visibilitychange', onVisibility)

  // Pause the loop once the hero scrolls out of view. Coalesced records
  // arrive oldest-first, so the CURRENT state is the last entry.
  let visible = true
  const io = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1]
    visible = entry?.isIntersecting ?? true
    if (visible && !document.hidden) play()
    else pause()
  })
  io.observe(canvas)

  // Render synchronously after every refit: resizing the drawing buffer
  // clears it, and ResizeObserver fires AFTER this frame's rAF callbacks —
  // waiting for the next tick would paint one blank frame per resize step
  // (visible as blinking while dragging the window edge).
  const ro = new ResizeObserver(() => {
    fitCamera()
    renderFrame()
  })
  ro.observe(canvas)

  renderFrame()
  if (!options.reduceMotion) play()

  return {
    setTheme(dark: boolean) {
      colorize(dark)
      if (!running) renderFrame()
    },
    setReduceMotion(reduce: boolean) {
      reduceMotion = reduce
      if (reduce) {
        pause()
        restPose()
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
      for (const mesh of allMeshes) {
        mesh.geometry.dispose()
        ;(mesh.material as MeshStandardMaterial).dispose()
      }
      renderer.dispose()
    },
  }
}
