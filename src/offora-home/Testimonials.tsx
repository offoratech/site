import { testimonials } from './content'
import { gsap, useGSAP, MOTION_OK } from './gsap'
import { useRef } from 'react'
import { Eyebrow } from './Eyebrow'

export function Testimonials() {
  const root = useRef<HTMLElement>(null)

  // Each card settles under the next one: scales back and dims as it gets covered.
  // Dimming fades a dark overlay's opacity rather than animating `filter` -
  // a scrubbed filter repaints the whole card every frame and stutters;
  // opacity and scale stay on the compositor. `scrub: 0.6` smooths out
  // wheel steps instead of jumping with each one.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>('.stack__card')
        cards.forEach((card, i) => {
          const next = cards[i + 1]
          if (!next) return
          const scrollTrigger = { trigger: next, start: 'top bottom', end: 'top 20%', scrub: 0.6 }
          gsap.to(card.querySelector('.stack__inner'), { scale: 0.92, ease: 'none', force3D: true, scrollTrigger })
          gsap.to(card.querySelector('.stack__shade'), { opacity: 0.55, ease: 'none', scrollTrigger })
        })
        gsap.from('.stack__card:first-child .stack__inner', {
          y: 80,
          autoAlpha: 0,
          duration: 1.2,
          ease: 'offora',
          scrollTrigger: { trigger: '.stack', start: 'top 85%' },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section testimonials" id="oh-testimonials" aria-labelledby="oh-testimonials-title">
      <div className="wrap">
        <div className="section-head testimonials__head">
          {/* Where the particle journey forms a quote mark. */}
          <div className="testimonials__glyph" data-journey-stop="quote" aria-hidden="true" />
          <Eyebrow>In Their Words</Eyebrow>
          <h2 id="oh-testimonials-title" className="section-title" data-split>
            What clients say.
          </h2>
        </div>

        <ol className="stack">
          {testimonials.map((t, i) => (
            <li key={t.org} className="stack__card" style={{ '--i': i } as React.CSSProperties}>
              <figure className={`stack__inner quote${i === 0 ? ' quote--featured' : ''}`}>
                <span className="stack__count" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                </span>
                <blockquote>
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption>
                  <span className="quote__org">{t.org}</span>
                  <span className="quote__role">{t.role}</span>
                </figcaption>
                <span className="stack__shade" aria-hidden="true" />
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
