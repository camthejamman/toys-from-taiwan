/**
 * Lazy-loaded three.js 果酱: the footer's JAM glyph as real extruded,
 * beveled geometry with the brand rainbow painted across it — the same
 * treatment the Shorts! covers give the SVG (SVGLoader → ExtrudeGeometry
 * → per-vertex gradient), sharing the hue curve with the hero title.
 *
 * Same frugal contract as heroTitle.ts: DPR capped, ACES tone mapping,
 * paused off-screen/hidden, honors reduced-motion live, disposed on
 * unmount, dynamically imported on idle.
 */
import {
  ACESFilmicToneMapping,
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
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { extrudedFaceLightness, gradientHue } from '../lib/rainbow'
import jamSvgRaw from '../assets/jam-standard.svg?raw'

export type JamGlyphHandle = {
  setTheme: (dark: boolean) => void
  setReduceMotion: (reduce: boolean) => void
  dispose: () => void
}

export function mountJamGlyph(
  canvas: HTMLCanvasElement,
  options: { dark: boolean; reduceMotion: boolean },
): JamGlyphHandle | null {
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
  const camera = new PerspectiveCamera(30, 1, 0.1, 2000)

  const hemi = new HemisphereLight(0xfff6e8, 0x88aacc, 0.85)
  const sun = new DirectionalLight(0xffffff, 1.2)
  sun.position.set(40, 60, 30)
  const fill = new DirectionalLight(0xbfdfff, 0.4)
  fill.position.set(-30, 20, -20)
  scene.add(hemi, sun, fill)

  // ---- extruded 果酱 (straight from the cover generators) ----
  const data = new SVGLoader().parse(jamSvgRaw)
  const shapes = data.paths.flatMap((path) => SVGLoader.createShapes(path))
  // Deliberately much thinner than the vol1 cover's 0.15× proportions
  // (Cam dialed this down three times): depth ≈ 0.05× the glyph height
  // (~99.6 svg units) with a minimal bevel — a slim wafer, not a block.
  const geo = new ExtrudeGeometry(shapes, {
    depth: 5,
    bevelEnabled: true,
    bevelThickness: 1.1,
    bevelSize: 0.7,
    bevelSegments: 2,
    curveSegments: 12,
  })
  // SVG y points down; flip to three.js y-up. The negative scale mirrors
  // the geometry and reverses triangle winding, so swap each triangle's
  // index order and recompute normals so lighting stays correct.
  geo.scale(1, -1, 1)
  {
    const idx = geo.index
    if (idx) {
      const a = idx.array
      for (let i = 0; i < a.length; i += 3) {
        const tmp = a[i + 1]
        a[i + 1] = a[i + 2]
        a[i + 2] = tmp
      }
      idx.needsUpdate = true
    }
    geo.computeVertexNormals()
  }
  // Center on the origin.
  geo.computeBoundingBox()
  const bb = geo.boundingBox!
  const glyphW = bb.max.x - bb.min.x
  const glyphH = bb.max.y - bb.min.y
  geo.translate(
    -(bb.min.x + bb.max.x) / 2,
    -(bb.min.y + bb.max.y) / 2,
    -(bb.min.z + bb.max.z) / 2,
  )
  geo.computeBoundingBox()

  const material = new MeshStandardMaterial({
    vertexColors: true,
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.05,
  })
  const mesh = new Mesh(geo, material)
  const group = new Group()
  group.add(mesh)
  scene.add(group)

  /** Rainbow across the glyph: vertex hue from its normalized X. */
  function colorize(dark: boolean) {
    const positions = geo.attributes.position
    const colors = new Float32Array(positions.count * 3)
    const tmp = new Color()
    const bbox = geo.boundingBox!
    const range = bbox.max.x - bbox.min.x || 1
    for (let i = 0; i < positions.count; i++) {
      const t = (positions.getX(i) - bbox.min.x) / range
      tmp.setHSL(gradientHue(1 - t), 0.95, extrudedFaceLightness(t, dark))
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3))
    hemi.color.set(dark ? 0xdde8ff : 0xfff6e8)
    hemi.intensity = dark ? 0.9 : 0.85
    sun.intensity = dark ? 1.15 : 1.2
  }
  colorize(options.dark)

  /** Screen-space (NDC) center of the glyph's bounding box. */
  function projectedCenter(): { x: number; y: number } {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const v = new Vector3()
    const bbox = geo.boundingBox!
    for (const cx of [bbox.min.x, bbox.max.x])
      for (const cy of [bbox.min.y, bbox.max.y])
        for (const cz of [bbox.min.z, bbox.max.z]) {
          v.set(cx, cy, cz)
          mesh.localToWorld(v)
          v.project(camera)
          minX = Math.min(minX, v.x)
          maxX = Math.max(maxX, v.x)
          minY = Math.min(minY, v.y)
          maxY = Math.max(maxY, v.y)
        }
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
  }

  function fitCamera() {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    camera.aspect = width / height
    const vFov = (camera.fov * Math.PI) / 180
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)
    const fitW = (glyphW / 2 / Math.tan(hFov / 2)) * 1.25
    const fitH = (glyphH / 2 / Math.tan(vFov / 2)) * 1.25
    const dist = Math.max(fitW, fitH)
    const azim = 0.1
    const elev = 0.04
    camera.position.set(
      Math.sin(azim) * dist,
      Math.sin(elev) * dist,
      Math.cos(azim) * dist,
    )
    const target = new Vector3(0, 0, 0)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
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
    group.rotation.y = Math.sin(t * 0.35) * 0.16
    group.position.y = Math.sin(t * 0.9) * glyphH * 0.015
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

  function restPose() {
    group.rotation.y = 0
    group.position.y = 0
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
      geo.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}
