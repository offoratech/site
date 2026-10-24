import { useEffect, useRef } from 'react'
import type { GlyphField as GlyphFieldType } from './GlyphField'
import { gsap, useGSAP, EASE } from './gsap'

export { webglAvailable } from './webgl'
import { webglAvailable } from './webgl'

type GetPoints = (count: number) => Float32Array | null | Promise<Float32Array | null>

/**
 * A small particle accent any section can drop in: scattered dust that
 * collapses into whatever shape `getPoints` resolves to once the element
 * scrolls into view. Self-contained and one-shot - no scroll pinning, no
 * cross-section choreography. Silently renders nothing without WebGL or
 * under reduced motion (the shape just holds its formed state, no
 * animation), so it's always safe to add as a decorative extra.
 */
export function SectionGlyph({
  getPoints,
  count = 2200,
  className,
  entrance = true,
}: {
  getPoints: GetPoints
  count?: number
  className?: string
  /** Scroll-triggered fade/scale-in of the host. Turn off when a parent already animates it (e.g. a fixed, cursor-following panel, where a scroll trigger may never fire). */
  entrance?: boolean
}) {
  const host = useRef<HTMLDivElement>(null)
  const field = useRef<GlyphFieldType | null>(null)

  useEffect(() => {
    const el = host.current
    if (!el || !webglAvailable()) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let disposed = false
    let cleanup = () => {}

    Promise.all([import('./GlyphField'), getPoints(count)]).then(([{ GlyphField }, target]) => {
      if (disposed || !target) return
      const f = new GlyphField(el, { count, target, static: reduce })
      if (reduce) {
        f.progress = 1
        f.renderOnce()
        cleanup = () => f.dispose()
        return
      }
      field.current = f
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            f.progress = 1
            f.play()
          } else {
            f.pause()
          }
        },
        { threshold: 0.25 },
      )
      io.observe(el)
      cleanup = () => {
        io.disconnect()
        f.dispose()
        field.current = null
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [count, getPoints])

  // Ease the reveal in smoothly rather than snapping to visible the instant
  // it enters the viewport.
  useGSAP(() => {
    if (!entrance) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(host.current, {
        autoAlpha: 0,
        scale: 0.92,
        duration: 1,
        ease: EASE,
        scrollTrigger: { trigger: host.current, start: 'top 80%', once: true },
      })
    })
    return () => mm.revert()
  }, { scope: host, dependencies: [entrance] })

  return <div ref={host} aria-hidden="true" className={className} />
}
