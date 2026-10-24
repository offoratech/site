import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)

  // Dot: tight spring, tracks the pointer almost exactly.
  const dotX = useSpring(x, { stiffness: 900, damping: 50, mass: 0.2 })
  const dotY = useSpring(y, { stiffness: 900, damping: 50, mass: 0.2 })

  // Ring: looser spring, trails a beat behind.
  const ringX = useSpring(x, { stiffness: 200, damping: 24, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 200, damping: 24, mass: 0.5 })

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    setEnabled(mq.matches)
    const onChange = (e) => setEnabled(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!enabled) return

    document.body.classList.add('cursor-none-desktop')

    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const onOver = (e) => {
      const target = e.target.closest?.(
        'a, button, [data-cursor-hover], input, textarea, select',
      )
      setHovering(Boolean(target))
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeaveWindow = () => setVisible(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeaveWindow)

    return () => {
      document.body.classList.remove('cursor-none-desktop')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeaveWindow)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[200] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: hovering ? 42 : 28,
            height: hovering ? 42 : 28,
            scale: pressed ? 0.85 : 1,
            borderColor: hovering ? 'var(--color-brand)' : 'var(--color-line)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ borderWidth: 1 }}
          className="rounded-full border"
        />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ x: dotX, y: dotY, opacity: visible ? 1 : 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[201] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ scale: pressed ? 0.5 : hovering ? 0 : 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-1.5 w-1.5 rounded-full bg-brand"
        />
      </motion.div>
    </>
  )
}
