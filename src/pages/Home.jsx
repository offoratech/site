import { motion } from 'framer-motion'
import OfforaHome from '../offora-home/OfforaHome.tsx'

// This page intentionally does not use the shared <PageTransition> wrapper:
// that component animates `y`, which Framer Motion keeps as a persistent
// inline `transform` on its root element even at rest. GSAP's ScrollTrigger
// pin (the hero) and the testimonial cards' `position: sticky` both require
// every ancestor to be transform-free, so this page uses an opacity-only
// fade instead. Every other page keeps <PageTransition> unchanged.
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

export default function Home() {
  return (
    <motion.main variants={fade} initial="initial" animate="animate" exit="exit">
      <OfforaHome />
    </motion.main>
  )
}
