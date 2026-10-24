import { useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Code2, Megaphone } from 'lucide-react'
import { serviceGroups } from '../../data/services.js'

const panelTone = {
  technical: 'from-[#7fa3c9]/25 via-ink-soft to-ink',
  marketing: 'from-brand/20 via-ink-soft to-ink',
}

export default function ServicesList() {
  const [hovered, setHovered] = useState(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 30, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 260, damping: 30, mass: 0.5 })

  const handleMove = (e) => {
    x.set(e.clientX)
    y.set(e.clientY)
  }

  return (
    <section className="container-offora relative py-24 sm:py-36" onMouseMove={handleMove}>
      <motion.div
        aria-hidden
        style={{ left: springX, top: springY }}
        animate={{
          opacity: hovered ? 1 : 0,
          scale: hovered ? 1 : 0.85,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed z-30 hidden -translate-x-[110%] -translate-y-1/2 lg:block"
      >
        <div
          className={`flex h-64 w-52 flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-gradient-to-br ${
            hovered ? panelTone[hovered.group] : panelTone.technical
          }`}
        >
          {hovered?.group === 'marketing' ? (
            <Megaphone size={32} strokeWidth={1.5} className="text-brand" />
          ) : (
            <Code2 size={32} strokeWidth={1.5} className="text-bone/70" />
          )}
          <p className="px-6 text-center font-display text-sm font-medium text-bone">
            {hovered?.title}
          </p>
        </div>
      </motion.div>

      {serviceGroups.map((group) => (
        <div key={group.id} className="mb-20 last:mb-0">
          <div className="mb-8 flex items-baseline gap-4 sm:mb-12">
            <p className="text-xs font-semibold tracking-[0.15em] text-brand">
              {group.kicker}
            </p>
            <span className="h-px flex-1 bg-line" />
          </div>

          <h2 className="font-display mb-12 max-w-2xl text-3xl font-medium leading-tight tracking-tight text-bone sm:text-5xl">
            {group.title}
          </h2>

          <div className="border-t border-line">
            {group.services.map((service, i) => (
              <motion.div
                key={service.title}
                data-cursor-hover
                onMouseEnter={() => setHovered({ ...service, group: group.id })}
                onMouseLeave={() => setHovered(null)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex cursor-default flex-col gap-2 border-b border-line py-6 transition-colors sm:flex-row sm:items-center sm:gap-8 sm:py-8"
              >
                <span className="font-display w-10 shrink-0 text-sm text-mute">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display flex-1 text-2xl font-medium text-bone transition-all duration-300 group-hover:translate-x-3 group-hover:text-brand sm:text-3xl lg:text-4xl">
                  {service.title}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-mute transition-opacity duration-300 lg:opacity-0 lg:text-right lg:group-hover:opacity-100">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
