import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import Parallax from '../ui/Parallax.jsx'
import { CtaButton } from '../ui/CtaButton.jsx'

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// A small bracket-motif tag that tracks one of the particle field's two
// clusters on screen, positioned via the field's own camera projection
// (OneTeamField#onAnchors) rather than guessed CSS coordinates.
function ClusterTag({ anchor, children }) {
  if (!anchor) return null
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-[calc(100%+28px)] whitespace-nowrap rounded-full border border-line bg-ink/80 px-3 py-1 text-[10px] font-medium tracking-[0.3em] text-mute backdrop-blur lg:inline-flex"
      style={{ transform: `translate3d(${anchor.x}px, ${anchor.y}px, 0) translate(-50%, calc(-100% - 28px))` }}
    >
      <span className="mr-1.5 text-brand">[</span>
      {children}
      <span className="ml-1.5 text-brand">]</span>
    </span>
  )
}

const lines = [
  { words: 'We Don’t Follow'.split(' '), className: 'text-bone' },
  { words: 'Trends.'.split(' '), className: 'text-mute' },
  { words: 'We Create Them.'.split(' '), className: 'text-brand' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}

const word = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
}

export default function Hero({ curtainRef }) {
  const reduceMotion = useReducedMotion()
  const canvasHost = useRef(null)
  const field = useRef(null)
  const [anchors, setAnchors] = useState(null)
  const [canvasReady, setCanvasReady] = useState(false)

  const { scrollYProgress } = useScroll({
    target: curtainRef,
    offset: ['start end', 'start start'],
  })
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.4, 0])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])
  const finaleOpacity = useTransform(scrollYProgress, [0.78, 0.96], [0, 1])
  const finaleY = useTransform(scrollYProgress, [0.78, 0.96], [16, 0])

  // The particle field's "merge" is driven by the SAME scroll progress that
  // already fades/scales the rest of the hero as the curtain slides over it
  // - not an independent scroll-triggered pin - so it can never fight the
  // page's sticky curtain-reveal mechanic.
  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      if (field.current) field.current.merge = v
    })
  }, [scrollYProgress])

  useEffect(() => {
    const host = canvasHost.current
    if (!host || !webglAvailable() || window.innerWidth < 1024) return
    let disposed = false
    let cleanup = () => {}

    // Three.js ships as its own chunk so the rest of the page paints first.
    import('./OneTeamField.js').then(({ OneTeamField }) => {
      if (disposed) return
      const f = new OneTeamField(host, { count: 9000, static: reduceMotion })
      field.current = f
      f.merge = reduceMotion ? 1 : scrollYProgress.get()
      f.onAnchors = (build, market) => setAnchors({ build, market })
      setCanvasReady(true)

      if (reduceMotion) {
        cleanup = () => f.dispose()
        return
      }
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? f.play() : f.pause()), { rootMargin: '100px' })
      io.observe(host)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion])

  return (
    <section className="sticky top-0 z-0 flex min-h-[100svh] flex-col justify-center overflow-hidden pb-44 pt-24 lg:pb-0 lg:pt-16">
      <motion.div
        ref={canvasHost}
        aria-hidden
        initial={false}
        animate={{ opacity: canvasReady ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute inset-0 hidden lg:block"
      />
      <ClusterTag anchor={anchors?.build}>The Build</ClusterTag>
      <ClusterTag anchor={anchors?.market}>The Marketing</ClusterTag>

      <Parallax
        offset={120}
        className="pointer-events-none absolute -top-40 right-[-6%] h-[50rem] w-[50rem] rounded-full bg-brand/26 blur-[150px]"
      />
      <Parallax
        offset={-70}
        className="pointer-events-none absolute bottom-[-18%] left-[-14%] h-[30rem] w-[30rem] rounded-full bg-brand/8 blur-[140px]"
      />

      <motion.div
        style={{ scale: contentScale, opacity: contentOpacity }}
        className="container-offora relative"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          data-cursor-hover
          className="group mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-line bg-gradient-to-tr from-bone/[0.06] via-bone/[0.03] to-transparent px-5 py-2 text-xs font-medium tracking-[0.4em] text-mute sm:mb-8 lg:mb-6"
        >
          <span className="text-brand">[</span>
          Websites, Apps &amp; Marketing - Built By One Team
          <span className="text-brand">]</span>
          <ChevronRight size={14} className="text-brand transition-transform duration-300 group-hover:translate-x-1" />
        </motion.p>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-unbounded w-[92vw] max-w-[1400px] text-[clamp(2.5rem,13vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.01em] sm:w-[85vw] sm:text-[clamp(3.5rem,10vw,5.5rem)] lg:w-[65vw] lg:text-[clamp(3rem,4.6vw,5rem)] lg:leading-[1.0]"
        >
          {lines.map((line, li) => (
            <span key={li} className={`flex flex-wrap gap-x-[0.25em] ${line.className}`}>
              {line.words.map((w, wi) => (
                <span key={wi} className="overflow-hidden pb-[0.1em]">
                  <motion.span variants={word} className="inline-block">
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-mute sm:mt-8 sm:text-xl lg:mt-6 lg:max-w-md"
        >
          We build the site, then run the marketing that gets it found. One team,
          start to finish - no hand-offs between agencies who've never met.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 flex flex-wrap items-center gap-8 sm:mt-8 lg:mt-4"
        >
          <CtaButton as={Link} to="/contact" variant="outline" className="normal-case tracking-normal">
            Let's Talk About Your Project
          </CtaButton>
          <Link
            to="/services"
            data-cursor-hover
            className="inline-flex items-center gap-2 border-b border-bone/20 pb-1 text-sm font-medium text-mute transition-colors hover:border-brand hover:text-bone"
          >
            Explore Our Work
          </Link>
        </motion.div>
      </motion.div>

      <motion.p
        aria-hidden
        style={{ opacity: finaleOpacity, y: finaleY }}
        className="font-unbounded pointer-events-none absolute inset-x-0 bottom-28 hidden text-center text-2xl font-bold tracking-tight text-brand lg:block"
      >
        One team. Start to finish.
      </motion.p>

      <motion.div
        style={{ opacity: cueOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-8 hidden flex-col items-center gap-2 sm:flex"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-mute">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="text-brand"
        >
          <ChevronDown size={16} strokeWidth={2} />
        </motion.span>
      </motion.div>
    </section>
  )
}
