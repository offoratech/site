import { motion } from 'framer-motion'
import { cn } from '../../utils/cn.js'

const container = {
  hidden: {},
  show: (custom) => ({
    transition: { staggerChildren: custom.stagger, delayChildren: custom.delay },
  }),
}

const wordVariant = {
  hidden: { y: '110%' },
  show: {
    y: '0%',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  trigger = 'view',
  once = true,
}) {
  const words = text.split(' ')

  const triggerProps =
    trigger === 'view'
      ? { initial: 'hidden', whileInView: 'show', viewport: { once, margin: '-100px' } }
      : { initial: 'hidden', animate: 'show' }

  return (
    <motion.span
      variants={container}
      custom={{ stagger, delay }}
      {...triggerProps}
      className={cn('inline-flex flex-wrap', className)}
    >
      {words.map((w, i) => (
        <span key={i} className="overflow-hidden pb-[0.18em] pr-[0.28em] last:pr-0">
          <motion.span variants={wordVariant} className="inline-block">
            {w}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
