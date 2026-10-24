import { motion, useScroll, useTransform } from 'framer-motion'
import TextReveal from '../ui/TextReveal.jsx'
import Parallax from '../ui/Parallax.jsx'
import Kicker from '../ui/Kicker.jsx'

export default function AboutHero({ curtainRef }) {
  const { scrollYProgress } = useScroll({
    target: curtainRef,
    offset: ['start end', 'start start'],
  })
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.4, 0])

  return (
    <section className="sticky top-0 z-0 flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 lg:pb-0">
      <Parallax
        offset={90}
        className="pointer-events-none absolute -top-40 right-[-15%] h-[36rem] w-[36rem] rounded-full bg-brand/14 blur-[150px]"
      />

      <motion.div
        style={{ scale: contentScale, opacity: contentOpacity }}
        className="container-offora relative"
      >
        <Kicker>About Offora Tech</Kicker>

        <h1 className="font-display w-[90vw] max-w-[1300px] text-4xl font-medium leading-[1.0] tracking-[-0.035em] text-bone sm:w-[80vw] sm:text-6xl lg:text-[clamp(3.75rem,5.6vw,6.5rem)]">
          <TextReveal text="We’re not a big agency. That’s kind of the point." trigger="mount" />
        </h1>

        <p className="mt-12 max-w-2xl text-lg leading-relaxed text-mute sm:text-xl">
          Offora Tech started because we got tired of watching good businesses get let down
          by slow websites and forgettable branding. We handle the technical side and the
          marketing side ourselves, so you're not stuck relaying messages between two
          agencies that have never spoken to each other.
        </p>
      </motion.div>
    </section>
  )
}
