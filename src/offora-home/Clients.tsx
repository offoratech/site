import { useEffect, useRef } from 'react'
import { clients } from './content'
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, EASE, isTouch } from './gsap'
import { Eyebrow } from './Eyebrow'

export function Clients() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Logo tiles wipe up into place, row by row.
        gsap.fromTo(
          '.clients__logo',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1,
            ease: EASE,
            stagger: { each: 0.05, grid: 'auto', from: 'start' },
            scrollTrigger: { trigger: '.clients', start: 'top 80%' },
          },
        )
        gsap.from('.clients figcaption', {
          autoAlpha: 0,
          y: 8,
          duration: 0.8,
          stagger: 0.04,
          delay: 0.3,
          scrollTrigger: { trigger: '.clients', start: 'top 80%' },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // 3D tilt on logo tiles (pointer devices only).
  useEffect(() => {
    if (isTouch() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tiles = root.current!.querySelectorAll<HTMLElement>('.clients__logo')
    const cleanups: (() => void)[] = []
    tiles.forEach((tile) => {
      const rx = gsap.quickTo(tile, 'rotateX', { duration: 0.6, ease: 'power3' })
      const ry = gsap.quickTo(tile, 'rotateY', { duration: 0.6, ease: 'power3' })
      const move = (e: PointerEvent) => {
        const b = tile.getBoundingClientRect()
        ry(((e.clientX - b.left) / b.width - 0.5) * 22)
        rx(-((e.clientY - b.top) / b.height - 0.5) * 22)
      }
      const leave = () => {
        rx(0)
        ry(0)
      }
      tile.addEventListener('pointermove', move)
      tile.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        tile.removeEventListener('pointermove', move)
        tile.removeEventListener('pointerleave', leave)
      })
    })
    return () => cleanups.forEach((c) => c())
  }, [])

  return (
    <section ref={root} className="section work" id="oh-work" aria-labelledby="oh-work-title">
      <div className="wrap">
        <div className="section-head work__head">
          {/* Where the particle journey re-forms the OFFORA logo. */}
          <div className="work__glyph" data-journey-stop="logo" aria-hidden="true" />
          <Eyebrow>Selected Work</Eyebrow>
          <h2 id="oh-work-title" className="section-title" data-split>
            Businesses we’ve worked with.
          </h2>
          <p className="section-intro" data-reveal>
            A biryani kitchen, a hospital, an engineering college, fashion, beauty and retail. Different industries,
            different problems. Same team on each one.
          </p>
        </div>
      </div>

      <Marquee />

      <div className="wrap">
        <ul className="clients" aria-label="Client list">
          {clients.map((c) => (
            <li key={c.name} className="clients__item">
              <figure>
                <div className="clients__logo">
                  <img src={c.logo} alt="" loading="lazy" decoding="async" width="700" height="700" />
                </div>
                <figcaption>{c.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

    </section>
  )
}

/** Two rows of client names drifting in opposite directions; scroll speed pushes and skews them. */
function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const rows = gsap.utils.toArray<HTMLElement>('.marquee__track')
        const loops = rows.map((row, i) =>
          gsap.fromTo(row, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 48, ease: 'none', repeat: -1 }),
        )
        const skew = gsap.quickTo(rows, 'skewX', { duration: 0.5, ease: 'power3' })
        let decay: gsap.core.Tween | null = null
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = self.getVelocity()
            const boost = gsap.utils.clamp(-6, 6, v / 300)
            loops.forEach((l) => l.timeScale(1 + Math.abs(boost)))
            skew(gsap.utils.clamp(-8, 8, -v / 400))
            decay?.kill()
            decay = gsap.to({}, {
              duration: 0.4,
              onComplete: () => {
                loops.forEach((l) => gsap.to(l, { timeScale: 1, duration: 1, ease: 'power2.out' }))
                skew(0)
              },
            })
          },
        })
        return () => {
          st.kill()
          decay?.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const names = clients.map((c) => c.name)
  const half = Math.ceil(names.length / 2)
  const rows = [names.slice(0, half), names.slice(half)]

  return (
    <div ref={root} className="marquee" aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="marquee__row">
          <div className="marquee__track">
            {[0, 1].map((copy) => (
              <span key={copy} className="marquee__group">
                {row.map((n) => (
                  <span key={n} className="marquee__item">
                    {n}
                    <span className="marquee__sep">/</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
