/**
 * Lazy-loaded three.js ambient sky: a starfield for the dark theme and soft
 * drifting clouds for the light theme, cross-fading when the theme changes.
 *
 * Deliberately frugal: one scene, points + a handful of sprites, DPR capped
 * at 2, paused while the tab is hidden, and fully disposed on unmount. It is
 * dynamically imported on idle, so none of this is on the critical path.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  Float32BufferAttribute,
  Group,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Sprite,
  SpriteMaterial,
  Texture,
  WebGLRenderer,
} from 'three'

export type AmbientSkyHandle = {
  setTheme: (dark: boolean) => void
  dispose: () => void
}

type CloudSprite = Sprite & { userData: { speed: number; baseOpacity: number } }

/** Soft round dot — without a sprite map, three.js points render as squares. */
function makeStarTexture(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.8)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  return new CanvasTexture(canvas)
}

function makeStarLayer(
  count: number,
  size: number,
  spread: number,
  map: Texture,
): Points {
  const geometry = new BufferGeometry()
  const positions: number[] = []
  const colors: number[] = []
  const tints = [
    new Color('#ffffff'),
    new Color('#dbe9ff'),
    new Color('#ffeed2'),
    new Color('#cfe0ff'),
  ]
  for (let i = 0; i < count; i++) {
    // Random point on a distant dome behind the content.
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = spread * (0.7 + 0.3 * Math.random())
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta) * 0.7,
      -Math.abs(radius * Math.cos(phi)) - spread * 0.35,
    )
    const tint = tints[Math.floor(Math.random() * tints.length)]
    colors.push(tint.r, tint.g, tint.b)
  }
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  const material = new PointsMaterial({
    size,
    map,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  return new Points(geometry, material)
}

function makeCloudTexture(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  // A few overlapping soft blobs make a puffy, hazy cloud.
  const blobs: Array<[number, number, number, number]> = [
    [128, 78, 64, 0.85],
    [78, 84, 44, 0.7],
    [182, 86, 46, 0.7],
    [110, 58, 38, 0.6],
    [156, 56, 34, 0.55],
  ]
  for (const [x, y, r, a] of blobs) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, `rgba(255,255,255,${a})`)
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  return new CanvasTexture(canvas)
}

export function mountAmbientSky(
  canvas: HTMLCanvasElement,
  options: { dark: boolean },
): AmbientSkyHandle | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    })
  } catch {
    return null
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new Scene()
  const camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200,
  )
  camera.position.z = 40

  // --- stars (dark theme) ----------------------------------------------
  const stars = new Group()
  const starTexture = makeStarTexture()
  const starLayers = [
    makeStarLayer(650, 0.55, 110, starTexture),
    makeStarLayer(250, 1.0, 85, starTexture),
  ]
  starLayers.forEach((layer) => stars.add(layer))
  scene.add(stars)

  // --- clouds (light theme) --------------------------------------------
  const clouds = new Group()
  const cloudTexture = makeCloudTexture()
  const cloudSprites: CloudSprite[] = []
  const CLOUD_COUNT = 11
  const SPAN = 130
  for (let i = 0; i < CLOUD_COUNT; i++) {
    const material = new SpriteMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    const sprite = new Sprite(material) as CloudSprite
    const scale = 26 + Math.random() * 34
    sprite.scale.set(scale, scale * 0.5, 1)
    sprite.position.set(
      (Math.random() - 0.5) * SPAN,
      -6 + Math.random() * 26,
      -20 - Math.random() * 30,
    )
    sprite.userData = {
      speed: 0.4 + Math.random() * 0.8,
      baseOpacity: 0.35 + Math.random() * 0.4,
    }
    cloudSprites.push(sprite)
    clouds.add(sprite)
  }
  scene.add(clouds)

  // --- animation ---------------------------------------------------------
  const clock = new Clock()
  let starTarget = options.dark ? 1 : 0
  let cloudTarget = options.dark ? 0 : 1
  let starFade = starTarget
  let cloudFade = cloudTarget
  let frame = 0
  let running = true

  const render = () => {
    if (!running) return
    frame = requestAnimationFrame(render)
    const dt = Math.min(clock.getDelta(), 0.1)
    const t = clock.elapsedTime

    starFade += (starTarget - starFade) * Math.min(dt * 2, 1)
    cloudFade += (cloudTarget - cloudFade) * Math.min(dt * 2, 1)

    stars.visible = starFade > 0.01
    clouds.visible = cloudFade > 0.01

    if (stars.visible) {
      stars.rotation.z += dt * 0.004
      stars.rotation.y += dt * 0.002
      starLayers.forEach((layer, i) => {
        const twinkle = 0.75 + 0.25 * Math.sin(t * (0.6 + i * 0.5) + i * 2)
        ;(layer.material as PointsMaterial).opacity = starFade * twinkle
      })
    }

    if (clouds.visible) {
      for (const sprite of cloudSprites) {
        sprite.position.x += dt * sprite.userData.speed
        if (sprite.position.x > SPAN / 2) sprite.position.x = -SPAN / 2
        sprite.position.y += Math.sin(t * 0.1 + sprite.position.z) * dt * 0.12
        ;(sprite.material as SpriteMaterial).opacity =
          cloudFade * sprite.userData.baseOpacity
      }
    }

    renderer.render(scene, camera)
  }
  frame = requestAnimationFrame(render)

  // --- events ------------------------------------------------------------
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  const onVisibility = () => {
    if (document.hidden) {
      running = false
      cancelAnimationFrame(frame)
    } else if (!running) {
      running = true
      clock.getDelta() // swallow the time spent hidden
      frame = requestAnimationFrame(render)
    }
  }
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)

  return {
    setTheme(dark: boolean) {
      starTarget = dark ? 1 : 0
      cloudTarget = dark ? 0 : 1
    },
    dispose() {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      starLayers.forEach((layer) => {
        layer.geometry.dispose()
        ;(layer.material as PointsMaterial).dispose()
      })
      cloudSprites.forEach((sprite) => sprite.material.dispose())
      cloudTexture.dispose()
      starTexture.dispose()
      renderer.dispose()
    },
  }
}
