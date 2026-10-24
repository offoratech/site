import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION_OK, EASE } from './gsap'
import type { OneTeamField } from './OneTeamField'
import { publishHeroParticles } from './heroParticles'
import { webglAvailable } from './webgl'
import { contactEmail } from './content'
import { Eyebrow } from './Eyebrow'
import { Arrow } from './Arrow'
import { LocalTime } from './LocalTime'
import { CtaButton } from '../components/ui/CtaButton.jsx'
import logoIconUrl from '../assets/favicon-512.png'
import logoWordmarkUrl from '../assets/offora-logo-wordmark.png'

// The particle field's "merged" state forms this logo instead of a plain
// ring. Flip to `false` to instantly revert to the original torus if the
// logo doesn't read well as particles - no other change needed.
const LOGO_SHAPE = true

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const spacer = useRef<HTMLDivElement>(null)
  const canvasHost = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  // Decided on first render so the phone layout's particle band is reserved
  // up front (no layout shift), and never reserved when there's no WebGL.
  const [webgl] = useState(webglAvailable)
  const field = useRef<OneTeamField | null>(null)
  const buildTag = useRef<HTMLSpanElement>(null)
  const marketTag = useRef<HTMLSpanElement>(null)

  // WebGL scene: created once, only animates while the hero is on screen.
  useEffect(() => {
    const host = canvasHost.current
    if (!host || !webglAvailable()) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.innerWidth < 768
    let disposed = false
    let cleanup = () => {}

    // Three.js ships as its own chunk so the page paints before the scene loads.
    import('./OneTeamField').then(async ({ OneTeamField, loadLogoRingPositions }) => {
      if (disposed) return
      const count = small ? 7000 : 16000
      const [ringPositions, wordmarkPositions] = LOGO_SHAPE
        ? await Promise.all([loadLogoRingPositions(logoIconUrl, count), loadLogoRingPositions(logoWordmarkUrl, count)])
        : [null, null]
      if (disposed) return
      const f = new OneTeamField(host, { count, static: reduce, ringPositions, wordmarkPositions, stage: stage.current })
      field.current = f
      // The labels belong to the two clusters: shown whenever the clusters
      // are apart, faded only as they fuse - driven by the field's own merge
      // state every frame, so they always come back on scrolling up (a
      // scroll tween on the same opacity as the entrance could record
      // "hidden" as its start and lose them for good).
      let tagOpacity = ''
      f.onAnchors = (b, m, merge) => {
        buildTag.current?.style.setProperty('transform', `translate3d(${b.x}px, ${b.y}px, 0)`)
        marketTag.current?.style.setProperty('transform', `translate3d(${m.x}px, ${m.y}px, 0)`)
        const o = 1 - gsap.utils.clamp(0, 1, (merge - 0.15) / 0.3)
        const next = o.toFixed(3)
        if (next === tagOpacity) return
        tagOpacity = next
        buildTag.current?.style.setProperty('opacity', next)
        marketTag.current?.style.setProperty('opacity', next)
      }
      if (reduce) {
        cleanup = () => f.dispose()
        return
      }
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? f.play() : f.pause()), { rootMargin: '100px' })
      io.observe(host)
      // Hand the formed wordmark to the page-wide particle journey, which
      // carries these same particles on through the rest of the page.
      const { wordmark, ...shared } = f.shared
      const published = wordmark ? { ...shared, wordmark, formed: () => f.wordmark >= 0.98 } : null
      if (published) publishHeroParticles(published)
      cleanup = () => {
        if (published) publishHeroParticles(null)
        io.disconnect()
        f.dispose()
        field.current = null
      }
    })
    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  // Entrance once the intro has cleared.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const split = SplitText.create('.hero__title .line > span', { type: 'chars', charsClass: 'char' })
        const tl = gsap.timeline({ defaults: { ease: EASE } })
        tl.from(split.chars, { yPercent: 115, rotate: 8, duration: 1.3, stagger: 0.028 })
          .from('.hero .eyebrow', { autoAlpha: 0, y: 10, duration: 0.8 }, 0.1)
          .from('.hero__rule', { scaleX: 0, transformOrigin: 'left center', duration: 1.4, ease: 'power3.inOut' }, 0.3)
          .from('.hero__aside > *', { autoAlpha: 0, y: 24, duration: 1, stagger: 0.08 }, 0.55)
          .from('.hero__foot > *', { autoAlpha: 0, y: 12, duration: 0.9, stagger: 0.06 }, 0.8)
          .from('.hero__canvas', { autoAlpha: 0, scale: 1.08, duration: 2.2, ease: 'power2.out' }, 0)
          .from('.hero__tag-inner', { autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.1)
        return () => split.revert()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // Scroll scene: headline dissolves, the two teams fuse into one ring, then
  // the icon morphs into the full OFFORA wordmark. The hero itself is CSS
  // `position: sticky` (see .hero-pin-spacer in offora-home.css) rather than
  // GSAP-pinned, so it stays in place only for the spacer's extra height,
  // then releases right as the Difference section's rounded panel rises to
  // cover it - the wordmark is still finishing its morph at that exact
  // moment, bridging the hand-off into the next section.
  // This sequence exists to showcase the particle field — without WebGL
  // there's nothing to fill the gap while the text is faded out, so skip
  // the dissolve entirely and let the hero scroll past normally.
  useGSAP(
    () => {
      if (!webglAvailable()) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Only now - confirmed WebGL + motion-ok, the sequence will
        // actually run - does the spacer gain the extra scroll room that
        // holds the sticky hero in place. Reverted below if motion
        // preference changes live.
        if (spacer.current) spacer.current.style.height = 'calc(100svh + 190vh)'

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: spacer.current,
            start: 'top top',
            // The spacer is taller than the viewport by design (it's what
            // holds the sticky hero in place), so progress 0→1 must span
            // only that sticky-active window (spacer height minus one
            // viewport), not the spacer's full height - otherwise this
            // reads scroll at roughly half the intended rate.
            end: () => `+=${spacer.current!.offsetHeight - window.innerHeight}`,
            scrub: 0.8,
            onUpdate: (st) => {
              if (!field.current) return
              // Clusters converge into the icon first (straight, no
              // rotation) - only once that's fully settled does the tagline
              // appear, then hand off to the icon morphing into the full
              // OFFORA wordmark as the sequence's final resting image.
              field.current.merge = gsap.utils.clamp(0, 1, (st.progress - 0.12) / 0.62)
              field.current.wordmark = gsap.utils.clamp(0, 1, (st.progress - 0.82) / 0.16)
            },
          },
        })
        tl.to('.hero__title .line', { yPercent: -40, autoAlpha: 0, stagger: 0.04, duration: 0.3 }, 0.05)
          .to('.hero .eyebrow, .hero__rule, .hero__aside', { autoAlpha: 0, y: -40, duration: 0.25 }, 0.05)
          .to('.hero__foot', { autoAlpha: 0, duration: 0.2 }, 0.1)
          .fromTo('.hero__finale-line', { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.08, duration: 0.18, ease: 'power2.out' }, 0.6)
          .to('.hero__finale', { autoAlpha: 0, duration: 0.1 }, 0.84)
          .to({}, { duration: 0.06 })

        return () => {
          if (spacer.current) spacer.current.style.height = ''
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  useEffect(() => {
    // Fonts settle after first paint; pinned spacing must be measured after that.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <div ref={spacer} className="hero-pin-spacer">
    <section ref={root} className={webgl ? 'hero hero--webgl' : 'hero'} id="oh-hero" aria-labelledby="oh-hero-title">
      <div ref={canvasHost} className="hero__canvas" aria-hidden="true" />
      <span ref={buildTag} className="hero__tag" aria-hidden="true">
        <span className="hero__tag-inner">[ The build ]</span>
      </span>
      <span ref={marketTag} className="hero__tag" aria-hidden="true">
        <span className="hero__tag-inner">[ The marketing ]</span>
      </span>

      <div className="wrap hero__content">
        {/* Phones only: reserved band the two particle teams sit in, above the headline. */}
        <div ref={stage} className="hero__stage" aria-hidden="true" />
        <Eyebrow>Software + marketing · Tamil Nadu, India</Eyebrow>

        <h1 id="oh-hero-title" className="hero__title">
          <span className="line"><span>We build it.</span></span>
          <span className="line"><span>We market it.</span></span>
          <span className="line line--accent"><span>Same team.</span></span>
        </h1>

        <div className="hero__rule" aria-hidden="true" />

        <div className="hero__aside">
          <ul className="hero__caps" aria-label="What we do">
            <li><span>Build</span>Websites, apps, e-commerce, custom software</li>
            <li><span>Market</span>Social media, Meta ads, video, branding</li>
          </ul>
          <div className="hero__ctas">
            <CtaButton as="a" href={`mailto:${contactEmail}`} variant="outline">
              Start a project
            </CtaButton>
          </div>
        </div>
      </div>

      <p className="hero__finale" aria-hidden="true">
        <span className="hero__finale-mask"><span className="hero__finale-line">We don’t follow trends.</span></span>
        <span className="hero__finale-mask"><span className="hero__finale-line hero__finale-line--accent">We create them.</span></span>
      </p>

      <div className="wrap hero__foot">
        <LocalTime />
        <p>Two founders. Clients worldwide.</p>
        <p className="hero__scroll" aria-hidden="true">
          Scroll <Arrow direction="down" />
        </p>
      </div>
    </section>
    </div>
  )
}
