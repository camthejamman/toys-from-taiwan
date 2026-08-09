/**
 * The brand rainbow, shared by every gradient renderer: the CSS lettering
 * (Wordmark3D), the three.js hero title, and the three.js 果酱 glyph.
 * Ported from the Shorts! cover generators — maps linear progress (0..1)
 * to a hue turn with the muddy yellow band compressed and the green/blue
 * span stretched.
 */
const HUE_CURVE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.0], // red
  [0.13, 0.07], // red-orange
  [0.22, 0.27], // skip past yellow into green
  [0.4, 0.4], // teal
  [0.55, 0.52], // cyan
  [0.7, 0.63], // blue
  [0.85, 0.73], // indigo
  [1.0, 0.83], // violet
]

export function gradientHue(t: number): number {
  for (let i = 1; i < HUE_CURVE.length; i++) {
    if (t <= HUE_CURVE[i][0]) {
      const [t0, h0] = HUE_CURVE[i - 1]
      const [t1, h1] = HUE_CURVE[i]
      return h0 + ((h1 - h0) * (t - t0)) / (t1 - t0)
    }
  }
  return HUE_CURVE[HUE_CURVE.length - 1][1]
}

/** Vibrant-but-visible icon tints for light mode (dark mode renders icons
 * white via currentColor). Distinct hues, all dark enough to read on the
 * pale sky and white glass cards. Cycle by index for icon rows. */
export const ICON_COLORS = [
  '#d6437f', // pink
  '#2a92c4', // blue
  '#2f9e53', // green
  '#d97e2e', // orange
  '#7a63d8', // purple
  '#2fa39a', // teal
  '#c94747', // red
  '#9b7d18', // gold
] as const

/** Face lightness for the extruded three.js pieces. The site's light sky
 * is much paler than the covers' blue, so the mid-band greens/cyans dip
 * darker — the covers' own lightnessFn trick, retuned. Dark mode stays
 * well below white so lit faces keep their chroma under ACES. */
export function extrudedFaceLightness(t: number, dark: boolean): number {
  const dist = Math.abs(t - 0.5)
  const dip = Math.max(0, 1 - (dist / 0.42) ** 2)
  return dark ? 0.62 - 0.04 * dip : 0.52 - 0.16 * dip
}
