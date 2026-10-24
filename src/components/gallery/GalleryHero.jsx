import { motion, useScroll, useTransform } from 'framer-motion'
import TextReveal from '../ui/TextReveal.jsx'
import Kicker from '../ui/Kicker.jsx'
import Parallax from '../ui/Parallax.jsx'

export default function GalleryHero({ curtainRef }) {
  const { scrollYProgress } = useScroll({
    target: curtainRef,
    offset: ['start end', 'start start'],
  })
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.4, 0])

  return (
    <section className="sticky top-0 z-0 flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 lg:pb-0">
      <Parallax
        offset={100}
        className="pointer-events-none absolute -top-40 left-[-10%] h-[36rem] w-[36rem] rounded-full bg-brand/12 blur-[150px]"
      />

      <motion.div
        style={{ scale: contentScale, opacity: contentOpacity }}
        className="container-offora relative"
      >
        <Kicker>Selected Work</Kicker>
        <h1 className="font-display max-w-4xl text-4xl font-medium leading-[1.0] tracking-[-0.03em] text-bone sm:text-6xl lg:text-7xl">
          <TextReveal text="Proof, not promises." trigger="mount" />
        </h1>
      </motion.div>
    </section>
  )
}
