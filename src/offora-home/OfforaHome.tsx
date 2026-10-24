import { useRef, useState } from 'react'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource/space-grotesk/700.css'
import '@fontsource-variable/unbounded'
import './offora-home.css'
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION_OK, EASE } from './gsap'
import { Hero } from './Hero'
import { Difference } from './Difference'
import { Clients } from './Clients'
import { Testimonials } from './Testimonials'
import { ParticleJourney, webglAvailable } from './ParticleJourney'
import ExpertiseList from '../components/home/ExpertiseList.jsx'

/**
 * Offora Tech home page. Self-contained: every style is scoped under `.offora-home`,
 * so it can be dropped into any React page without affecting the rest of the site.
 */
export default function OfforaHome() {
  const root = useRef<HTMLDivElement>(null)
  // Whether the particle journey will run - decided on first render so the
  // small in-flow particle spots on phones are reserved up front (no layout
  // shift) and never left as empty gaps without WebGL or with reduced motion.
  const [journeyOn] = useState(() => webglAvailable() && window.matchMedia(MOTION_OK).matches)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Headlines: masked lines, words rising in sequence. Re-splits on resize.
        const splits = gsap.utils.toArray<HTMLElement>('[data-split]').map((el) =>
          SplitText.create(el, {
            type: 'lines,words',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.words, {
                yPercent: 110,
                duration: 1.2,
                ease: EASE,
                stagger: 0.035,
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
              }),
          }),
        )

        // Everything else marked data-reveal fades up in batches.
        const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]').filter((el) => !el.closest('.hero'))
        gsap.set(targets, { autoAlpha: 0, y: 32 })
        const batch = ScrollTrigger.batch(targets, {
          start: 'top 90%',
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.08, overwrite: true }),
        })

        return () => {
          splits.forEach((s) => s.revert())
          batch.forEach((t) => t.kill())
        }
      })

      // Fonts and images shift layout after first paint; re-measure scroll positions.
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
      const onLoad = () => ScrollTrigger.refresh()
      window.addEventListener('load', onLoad, { once: true })
      return () => {
        window.removeEventListener('load', onLoad)
        mm.revert()
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className={journeyOn ? 'offora-home journey-on' : 'offora-home'}>
      <Hero />
      {/* The hero is CSS `position: sticky` (see .hero-pin-spacer) rather
          than pinned via GSAP, so this panel - rounded top, solid bg,
          raised shadow - naturally rises and covers it once the spacer's
          extra scroll room runs out, the same curtain-reveal hand-off used
          elsewhere on this site. The hero's wordmark-formation animation is
          timed to still be finishing at that exact moment. */}
      <div className="relative z-10 rounded-t-[2rem] bg-ink shadow-[0_-50px_100px_-30px_rgba(0,0,0,0.8)] sm:rounded-t-[3rem]">
        <Difference />
        {/* Kept from the existing home page per explicit request: the detailed
            Technical/Marketing service breakdown has no equivalent elsewhere
            on this page, so it stays rather than being dropped. */}
        <div className="border-t border-line">
          <ExpertiseList />
        </div>
        <Clients />
        <Testimonials />
      </div>
      {/* Above the curtain: the hero's particles travel on through every section. */}
      <ParticleJourney />
    </div>
  )
}
