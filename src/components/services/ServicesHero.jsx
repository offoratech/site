import { motion, useScroll, useTransform } from 'framer-motion'
import TextReveal from '../ui/TextReveal.jsx'
import Kicker from '../ui/Kicker.jsx'
import Parallax from '../ui/Parallax.jsx'

export default function ServicesHero({ curtainRef }) {
  const { scrollYProgress } = useScroll({
    target: curtainRef,
    offset: ['start end', 'start start'],
  })
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.4, 0])

  return (
    <section className="sticky top-0 z-0 flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 lg:pb-0">
      <Parallax
        offset={-80}
        className="pointer-events-none absolute -bottom-40 left-[-15%] h-[36rem] w-[36rem] rounded-full bg-brand/12 blur-[150px]"
      />

      <motion.div
        style={{ scale: contentScale, opacity: contentOpacity }}
        className="container-offora relative"
      >
        <Kicker>What We Do</Kicker>
        <h1 className="font-display max-w-4xl text-4xl font-medium leading-[1.02] tracking-[-0.03em] text-bone sm:text-6xl lg:text-7xl">
          <TextReveal text="Everything you need, minus the extra agency." trigger="mount" />
        </h1>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-mute">
          From the software running your business to the marketing that sells it. Tap or
          hover a line below to see what's actually involved.
        </p>
      </motion.div>
    </section>
  )
}
