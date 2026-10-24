/**
 * Shared point-cloud sampling for every particle shape on this page - the
 * Offora mark/wordmark in the hero, and the small per-section glyphs
 * (VS, a client logo, a service icon, a quote mark). Every sampler draws
 * onto an offscreen canvas and reads back the alpha channel: opaque pixels
 * become candidate points, picked with replacement up to `count`.
 */

const DEFAULT_SAMPLE_SIZE = 180
const DEFAULT_R = 2.4 // matches the hero ring's footprint so every shape sits at a comparable scale

function pointsFromCanvas(canvas: HTMLCanvasElement, count: number, R = DEFAULT_R): Float32Array | null {
  const size = canvas.width
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const { data } = ctx.getImageData(0, 0, size, size)
  const candidates: number[] = [] // flat [x0,y0, x1,y1, ...] of opaque pixels
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3] > 80) candidates.push(x, y)
    }
  }
  if (!candidates.length) return null

  const positions = new Float32Array(count * 3)
  const pairs = candidates.length / 2
  for (let i = 0; i < count; i++) {
    const p = (Math.random() * pairs | 0) * 2
    const nx = (candidates[p] / size) * 2 - 1
    const ny = -((candidates[p + 1] / size) * 2 - 1) // canvas Y-down -> GL Y-up
    positions[i * 3] = nx * R + (Math.random() - 0.5) * 0.02
    positions[i * 3 + 1] = ny * R + (Math.random() - 0.5) * 0.02
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.14
  }
  return positions
}

/**
 * Samples an image's (e.g. a logo PNG's) alpha channel. Async: waits for decode.
 * `keyBackground` is for opaque images (the client logo JPGs): the top-left
 * pixel's colour is treated as the background and everything that differs
 * from it becomes the shape - works for white, navy or brand-coloured grounds alike.
 */
export async function loadImagePoints(
  src: string,
  count: number,
  sampleSize = DEFAULT_SAMPLE_SIZE,
  opts: { keyBackground?: boolean } = {},
): Promise<Float32Array | null> {
  try {
    const img = new Image()
    img.src = src
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = sampleSize
    canvas.height = sampleSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const scale = Math.min(sampleSize / img.width, sampleSize / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, (sampleSize - w) / 2, (sampleSize - h) / 2, w, h)
    if (opts.keyBackground) keyOutBackground(ctx, sampleSize)

    return pointsFromCanvas(canvas, count)
  } catch {
    return null
  }
}

/** Rewrites alpha so pixels near the corner colour drop out (JPEG noise tolerant). */
function keyOutBackground(ctx: CanvasRenderingContext2D, size: number) {
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  const [br, bg, bb] = [d[0], d[1], d[2]]
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.abs(d[i] - br) + Math.abs(d[i + 1] - bg) + Math.abs(d[i + 2] - bb)
    d[i + 3] = d[i + 3] > 80 && dist > 90 ? 255 : 0
  }
  ctx.putImageData(img, 0, 0)
}

/** Samples a short run of text (e.g. "VS", a quote mark) set in the display font. Sync. */
export function textPoints(
  text: string,
  count: number,
  opts: { fontWeight?: number | string; fontFamily?: string; sampleSize?: number } = {},
): Float32Array | null {
  const sampleSize = opts.sampleSize ?? DEFAULT_SAMPLE_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = sampleSize
  canvas.height = sampleSize
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const weight = opts.fontWeight ?? 800
  const family = opts.fontFamily ?? 'Space Grotesk, sans-serif'
  // Fit and centre on the glyphs' actual ink, not the em box - a lone quote
  // mark sits high and narrow in its em box and would otherwise come out
  // small and off-centre.
  const fit = sampleSize * 0.86
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `${weight} 100px ${family}`
  let m = ctx.measureText(text)
  const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight || m.width
  const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || 100
  const fontSize = 100 * Math.min(fit / inkW, fit / inkH)
  ctx.font = `${weight} ${fontSize}px ${family}`
  m = ctx.measureText(text)
  ctx.fillStyle = '#fff'
  ctx.fillText(
    text,
    sampleSize / 2 + (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2,
    sampleSize / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
  )

  return pointsFromCanvas(canvas, count)
}

/**
 * `textPoints`, after the webfont it draws with has actually loaded - canvas
 * text never triggers a font load itself, so on a cold visit it would
 * otherwise silently sample the system fallback.
 */
export async function fontTextPoints(
  text: string,
  count: number,
  opts: { fontWeight?: number | string; fontFamily?: string; sampleSize?: number } = {},
): Promise<Float32Array | null> {
  const weight = opts.fontWeight ?? 800
  const family = opts.fontFamily ?? 'Space Grotesk, sans-serif'
  try {
    await document.fonts?.load(`${weight} 100px ${family}`, text)
  } catch {
    // Fall through and sample whatever face is available.
  }
  return textPoints(text, count, opts)
}

/**
 * Samples a set of lucide-style stroked SVG paths (viewBox 0 0 24 24,
 * round caps/joins, strokeWidth 2 by default - lucide-react's own
 * defaults), so a service icon can form in particles without shipping a
 * rasterized copy of it.
 */
export function svgStrokePoints(
  paths: string[],
  count: number,
  opts: { viewBox?: number; strokeWidth?: number; sampleSize?: number } = {},
): Float32Array | null {
  const sampleSize = opts.sampleSize ?? DEFAULT_SAMPLE_SIZE
  const viewBox = opts.viewBox ?? 24
  const canvas = document.createElement('canvas')
  canvas.width = sampleSize
  canvas.height = sampleSize
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const scale = (sampleSize * 0.82) / viewBox
  ctx.translate((sampleSize - viewBox * scale) / 2, (sampleSize - viewBox * scale) / 2)
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = opts.strokeWidth ?? 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const d of paths) ctx.stroke(new Path2D(d))

  return pointsFromCanvas(canvas, count)
}
