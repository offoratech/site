import { motion } from 'framer-motion'

export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y = 32,
  duration = 0.8,
  className,
  once = true,
  ...rest
}) {
  const Component = motion[as] ?? motion.div

  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  )
}
