import { useEffect, useRef } from 'react'
import { MOTION_OK } from './gsap'
import { onHeroParticles, type HeroParticles } from './heroParticles'
import { fontTextPoints, loadImagePoints, svgStrokePoints } from './particlePoints'
import logoWordmarkUrl from '../assets/offora-logo-wordmark.png'
import type { JourneyField, StopFrame } from './JourneyField'

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// Lucide's path data (v1.31.0) for Code2 (code-xml) and Megaphone - the
// same icons the Services rows use.
const CODE = ['m18 16 4-4-4-4', 'm6 8-4 4 4 4', 'm14.5 4-5 16']
const MEGAPHONE = [
  'M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
  'M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14',
  'M8 6v8',
]

/** "Two skill sets": the two service icons side by side, each at half size. */
function servicesPoints(n: number) {
  const half = n >> 1
  const a = svgStrokePoints(CODE, half, { sampleSize: SHARP })
  const b = svgStrokePoints(MEGAPHONE, n - half, { sampleSize: SHARP })
  if (!a || !b) return null
  const out = new Float32Array(n * 3)
  const place = (src: Float32Array, at: number, dx: number) => {
    for (let i = 0; i < src.length; i += 3) {
      out[at + i] = src[i] * 0.5 + dx
      out[at + i + 1] = src[i + 1] * 0.5
      out[at + i + 2] = src[i + 2]
    }
  }
  place(a, 0, -1.2)
  place(b, half * 3, 1.2)
  return out
}

// Section shapes are sampled at a much finer grid than the hero's default
// (180px) so their edges stay crisp; the hero-sized default leaves each
// source pixel a visible clump once spread across a small anchor.
const SHARP = 480

/** Half-size of a point cloud's actual footprint, for fitting it to its anchor box. */
function bounds(pts: Float32Array): [number, number] {
  let x = 0
  let y = 0
  for (let i = 0; i < pts.length; i += 3) {
    x = Math.max(x, Math.abs(pts[i]))
    y = Math.max(y, Math.abs(pts[i + 1]))
  }
  return [x || 2.4, y || 2.4]
}

/**
 * Shapes by `data-journey-stop` value. `extent` is the shape's half-size in
 * sampler units (every sampler fits ±2.4), used to fit it to its anchor box;
 * null means measure it from the points. `logo` is the same OFFORA wordmark
 * the hero forms, resampled finer for its smaller size.
 */
const SHAPES: Record<
  string,
  { points: (n: number, hero: HeroParticles) => Float32Array | null | Promise<Float32Array | null>; extent: [number, number] | null }
> = {
  vs: { points: (n) => fontTextPoints('VS', n, { fontWeight: 800, sampleSize: SHARP }), extent: [2.4, 2.4] },
  services: { points: servicesPoints, extent: [2.4, 1.2] },
  logo: { points: (n) => loadImagePoints(logoWordmarkUrl, n, SHARP), extent: null },
  quote: { points: (n) => fontTextPoints('“', n, { fontWeight: 700, sampleSize: SHARP }), extent: [2.4, 2.4] },
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** The hero's own on-screen wordmark scale (px per shape unit) - mirrors OneTeamField.resize(). */
function heroScale(w: number, h: number) {
  return w / h < 0.9 ? w * 0.17 : Math.min(h * 0.15, w * 0.11)
}

type Stop = { el: HTMLElement; shape: number; extent: [number, number] }
type Live = StopFrame & { shape: number; c: number; hold: number }

function runJourney(layer: HTMLElement, hero: HeroParticles, isCurrent: () => boolean) {
  let disposed = false
  let raf = 0
  let field: JourneyField | null = null

  const root = layer.closest('.offora-home') ?? document
  const anchors = Array.from(root.querySelectorAll<HTMLElement>('[data-journey-stop]')).filter((el) => SHAPES[el.dataset.journeyStop!])

  Promise.all([
    import('./JourneyField'),
    Promise.all(anchors.map((el) => SHAPES[el.dataset.journeyStop!].points(hero.count, hero))),
  ]).then(([{ JourneyField }, sampled]) => {
    if (disposed || !isCurrent()) return
    const shapes = [hero.wordmark]
    const stops: Stop[] = []
    anchors.forEach((el, i) => {
      const pts = sampled[i]
      if (!pts || pts.length !== hero.count * 3) return
      stops.push({ el, shape: shapes.length, extent: SHAPES[el.dataset.journeyStop!].extent ?? bounds(pts) })
      shapes.push(pts)
    })
    if (!stops.length) return
    const f = new JourneyField(layer, { rand: hero.rand, start: hero.start, shapes })
    field = f

    let pNow = 0
    let shown = false
    let heroHidden = false
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const vh = window.innerHeight

      // Every anchor is measured fresh each frame, so section pins and
      // layout shifts are followed for free. `c` is how far a stop is from
      // being "home": for the hero, its top (0 while it's sticky); for the
      // sections, their anchor's distance from the viewport's centre line.
      const hr = hero.host.getBoundingClientRect()
      const k0 = heroScale(hr.width, hr.height)
      const live: Live[] = [{ shape: 0, c: hr.top, hold: 0, x: hr.left + hr.width / 2, y: hr.top + hr.height / 2, k: k0, d: 1 }]
      for (const s of stops) {
        const r = s.el.getBoundingClientRect()
        if (!r.width || !r.height) continue // hidden at this breakpoint - skip this stop
        const k = Math.min(r.width / 2 / s.extent[0], r.height / 2 / s.extent[1])
        const y = r.top + r.height / 2
        live.push({ shape: s.shape, c: y - vh / 2, hold: vh * 0.18, x: r.left + r.width / 2, y, k, d: Math.min(1, Math.max(0.08, 1.8 * (k / k0) ** 2)) })
      }

      // Journey position: n.t = between stop n and n+1. Each section shape
      // holds fully formed for a short band around the centre line.
      let p = live.length - 1
      for (let j = 0; j < live.length - 1; j++) {
        const a = live[j]
        const b = live[j + 1]
        if (b.c <= 0) continue
        const gap = b.c - a.c
        const ha = Math.min(a.hold, gap * 0.25)
        const hb = Math.min(b.hold, gap * 0.25)
        p = j + clamp01((-a.c - ha) / Math.max(gap - ha - hb, 1))
        break
      }

      // The hero draws its own particles until it un-sticks; from then on
      // this layer takes the same particles over.
      const released = hr.top < -0.5
      pNow = released ? pNow + (p - pNow) * 0.1 : 0
      const seg = Math.max(0, Math.min(Math.floor(pNow), live.length - 2))
      const t = live.length > 1 ? clamp01(pNow - seg) : 0
      const a = live[seg]
      const b = live[Math.min(seg + 1, live.length - 1)]
      const onScreen = Math.max(a.y, b.y) > -vh * 0.5 && Math.min(a.y, b.y) < vh * 1.5
      const show = released && onScreen

      if (show !== shown) {
        shown = show
        layer.style.visibility = show ? 'visible' : 'hidden'
      }
      if (released !== heroHidden) {
        heroHidden = released
        hero.canvas.style.opacity = released ? '0' : ''
      }
      if (!show) return
      // OneTeamField breathes 0.045 world units; in px that depends on the hero's height.
      const breath = (0.045 * hr.height) / (2 * Math.tan((35 * Math.PI) / 360) * 14)
      f.render(a.shape, b.shape, t, a, b, breath, k0)
    }
    raf = requestAnimationFrame(tick)
  })

  return () => {
    disposed = true
    cancelAnimationFrame(raf)
    hero.canvas.style.opacity = ''
    layer.style.visibility = 'hidden'
    field?.dispose()
    field = null
  }
}

/**
 * Fixed full-viewport layer that carries the hero's particles on through
 * every section: OFFORA wordmark → "VS" → the two service icons → the OFFORA
 * wordmark again → a quote mark. Each section marks where its shape forms with an
 * empty `[data-journey-stop]` anchor.
 *
 * Every screen size; motion-OK and WebGL only. Without those the anchors
 * reserve no space (see `.journey-on` in offora-home.css) and the hero
 * behaves exactly as it does on its own.
 */
export function ParticleJourney() {
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = layer.current
    if (!el || !webglAvailable()) return
    const mq = window.matchMedia(MOTION_OK)
    let hero: HeroParticles | null = null
    let stop = () => {}
    const restart = () => {
      stop()
      stop = () => {}
      if (!hero || !mq.matches) return
      const h = hero
      stop = runJourney(el, h, () => hero === h)
    }
    const unsubscribe = onHeroParticles((h) => {
      hero = h
      restart()
    })
    mq.addEventListener('change', restart)
    return () => {
      mq.removeEventListener('change', restart)
      unsubscribe()
      stop()
    }
  }, [])

  return <div ref={layer} className="journey" aria-hidden="true" />
}
