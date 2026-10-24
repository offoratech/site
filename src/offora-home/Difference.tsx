import { useRef } from 'react'
import { gsap, useGSAP, MOTION_OK } from './gsap'
import { Eyebrow } from './Eyebrow'

const usual = [
  'You brief the developers.',
  'You brief the marketers. Again.',
  'The ads promise something the site doesn’t do.',
  'Both teams are waiting on each other. You’re in the middle.',
]

const ours = [
  'You brief one team, once.',
  'The people building your site plan the campaign with the people running it.',
  'The ads send people to pages that were built for them.',
  'When something changes, one conversation sorts it out.',
]

const SEGMENTS = 14

export function Difference() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Desktop: pin the comparison and let scroll tell the story step by step.
      mm.add(`${MOTION_OK} and (min-width: 821px)`, () => {
        const segs = gsap.utils.toArray<HTMLElement>('.flow--usual .flow__seg')
        // Pin the cards centred in the space *below* the floating navbar,
        // never under it - on short viewports they sit just beneath it, and
        // only then does the line start flowing down. The navbar is always
        // in its scrolled state by here: 12px top margin + h-20 + 2px border.
        const NAV_BOTTOM = 94
        const grid = root.current!.querySelector<HTMLElement>('.difference__grid')!
        const pinTop = () => Math.max(NAV_BOTTOM + 24, (NAV_BOTTOM + window.innerHeight - grid.offsetHeight) / 2)
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: grid, start: () => `top ${pinTop()}px`, end: '+=130%', pin: '.difference__pin', scrub: 0.6 },
        })
        const usualItems = gsap.utils.toArray<HTMLElement>('.flow--usual li')
        const ourItems = gsap.utils.toArray<HTMLElement>('.flow--ours li')
        usualItems.forEach((li, i) => {
          tl.from([li, ourItems[i]], { autoAlpha: 0.12, duration: 0.12 }, i * 0.2)
          tl.from(ourItems[i], { '--node': 0, duration: 0.12 }, i * 0.2 + 0.04)
        })
        tl.from('.flow--ours .flow__track-fill', { scaleY: 0, transformOrigin: 'top center', duration: 0.75 }, 0)
          // The usual thread snaps around step three.
          .to(segs, {
            y: () => gsap.utils.random(20, 120),
            x: () => gsap.utils.random(-30, 30),
            rotate: () => gsap.utils.random(-70, 70),
            autoAlpha: 0,
            duration: 0.35,
            stagger: { each: 0.02, from: 'center' },
            ease: 'power2.in',
          }, 0.45)
          .to('.flow--usual li:nth-child(n+3)', { x: () => gsap.utils.random(-6, 6), duration: 0.05, repeat: 5, yoyo: true }, 0.45)
          .from('.difference__verdict', { autoAlpha: 0, y: 16, duration: 0.15, stagger: 0.05 }, 0.85)
      })

      // Small screens: light per-item reveals, no pinning.
      mm.add(`${MOTION_OK} and (max-width: 820px)`, () => {
        gsap.from('.flow--ours .flow__track-fill', {
          scaleY: 0,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: { trigger: '.flow--ours', start: 'top 75%', end: 'bottom 60%', scrub: 0.6 },
        })
        gsap.utils.toArray<HTMLElement>('.flow li, .difference__verdict').forEach((li) =>
          gsap.from(li, { autoAlpha: 0, x: -14, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: li, start: 'top 88%' } }),
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section difference" id="oh-difference" aria-labelledby="oh-difference-title">
      <div className="wrap">
        <Eyebrow>The Difference</Eyebrow>
        <h2 id="oh-difference-title" className="section-title" data-split>
          Most businesses hire one agency to build and another to market. Then they become the translator.
        </h2>
      </div>

      <div className="difference__pin">
        <div className="wrap">
          <div className="difference__grid">
            {/* Where the particle journey (ParticleJourney.tsx) forms "VS". */}
            <div className="difference__vs" data-journey-stop="vs" aria-hidden="true" />
            <article className="difference__col">
              <h3 className="difference__label">The usual way</h3>
              <div className="flow flow--usual">
                <span className="flow__track" aria-hidden="true">
                  {Array.from({ length: SEGMENTS }, (_, i) => (
                    <span key={i} className="flow__seg" />
                  ))}
                </span>
                <ol>
                  {usual.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </div>
              <p className="difference__verdict">Context lost: somewhere around step two.</p>
            </article>

            <article className="difference__col difference__col--ours">
              <h3 className="difference__label">With Offora</h3>
              <div className="flow flow--ours">
                <span className="flow__track" aria-hidden="true">
                  <span className="flow__track-fill" />
                </span>
                <ol>
                  {ours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </div>
              <p className="difference__verdict difference__verdict--ours">Context kept: all of it.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
