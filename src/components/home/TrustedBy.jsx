import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { clients } from '../../data/clients.js'
import Reveal from '../ui/Reveal.jsx'

const half = Math.ceil(clients.length / 2)
// Duplicated so each row is guaranteed wider than the viewport regardless of
// screen size or how many clients there are - same technique the Gallery
// page's marquee rows already use to guarantee overflow.
const rowTop = [...clients.slice(0, half), ...clients.slice(0, half)]
const rowBottom = [...clients.slice(half), ...clients.slice(half)]

function LogoCard({ client }) {
  return (
    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl shadow-[0_20px_45px_-20px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out hover:-translate-y-1.5 sm:h-40 sm:w-40 lg:h-56 lg:w-56">
      <img src={client.logo} alt={client.name} className="h-full w-full object-cover" />
    </div>
  )
}

function useRowShift(scrollYProgress, viewportRef, direction) {
  const rowRef = useRef(null)
  const [maxShift, setMaxShift] = useState(0)

  useEffect(() => {
    function measure() {
      if (!viewportRef.current || !rowRef.current) return
      const containerWidth = viewportRef.current.clientWidth
      const rowWidth = rowRef.current.scrollWidth
      setMaxShift(Math.max(0, rowWidth - containerWidth))
    }

    measure()

    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)
    if (rowRef.current) observer.observe(rowRef.current)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [viewportRef])

  const range = direction === 'left' ? [0, -maxShift] : [-maxShift, 0]
  const x = useSpring(useTransform(scrollYProgress, [0, 1], range), {
    stiffness: 200,
    damping: 40,
    mass: 0.5,
  })

  return { rowRef, x }
}

export default function TrustedBy() {
  const trackRef = useRef(null)
  const viewportRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  })

  const top = useRowShift(scrollYProgress, viewportRef, 'left')
  const bottom = useRowShift(scrollYProgress, viewportRef, 'right')

  return (
    <section ref={trackRef} className="relative border-y border-line bg-ink py-14 sm:py-16 lg:py-20">
      <Reveal className="container-offora mb-8 flex items-center gap-4 sm:mb-10">
        <span className="text-xs font-semibold tracking-[0.15em] text-mute">
          Brands We&rsquo;ve Worked With
        </span>
        <span className="h-px flex-1 bg-line" />
      </Reveal>

      <div ref={viewportRef} className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-32" />

        <motion.div ref={top.rowRef} style={{ x: top.x }} className="flex w-max items-center gap-6 sm:gap-8 lg:gap-12">
          <div aria-hidden className="w-6 shrink-0 sm:w-10 lg:w-16" />
          {rowTop.map((client, i) => (
            <LogoCard key={`${client.id}-${i}`} client={client} />
          ))}
          <div aria-hidden className="w-6 shrink-0 sm:w-10 lg:w-16" />
        </motion.div>

        <motion.div
          ref={bottom.rowRef}
          style={{ x: bottom.x }}
          className="mt-8 flex w-max items-center gap-6 sm:mt-10 sm:gap-8 lg:mt-12 lg:gap-12"
        >
          <div aria-hidden className="w-6 shrink-0 sm:w-10 lg:w-16" />
          {rowBottom.map((client, i) => (
            <LogoCard key={`${client.id}-${i}`} client={client} />
          ))}
          <div aria-hidden className="w-6 shrink-0 sm:w-10 lg:w-16" />
        </motion.div>
      </div>
    </section>
  )
}
