import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight, Code2, Megaphone } from 'lucide-react'
import TextReveal from '../ui/TextReveal.jsx'
import Kicker from '../ui/Kicker.jsx'
import { serviceGroups } from '../../data/services.js'

const icons = { technical: Code2, marketing: Megaphone }

const panelTone = {
  technical: 'from-[#7fa3c9]/25 via-ink-soft to-ink',
  marketing: 'from-brand/20 via-ink-soft to-ink',
}

const expertise = [
  {
    id: 'technical',
    number: '01',
    title: 'Technical',
    subtitle: 'The Build',
    description:
      'Websites, apps, online stores, internal tools - built properly, not off a template.',
    // Technical only has 5 real services, so this shows all of them.
    services: serviceGroups.find((g) => g.id === 'technical').services,
  },
  {
    id: 'marketing',
    number: '02',
    title: 'Digital Marketing',
    subtitle: 'The Marketing',
    description:
      'Social media, ads, video, and branding that actually sounds like your business.',
    // Marketing has 12 real services - a representative spread for this
    // teaser, not the full list (that's what the Services page is for).
    services: serviceGroups
      .find((g) => g.id === 'marketing')
      .services.filter((s) =>
        ['Social Media Management', 'Meta Ads Management', 'Content Creation', 'Video Shoot', 'Graphic Design', 'Personal Branding'].includes(s.title),
      ),
    moreCount: serviceGroups.find((g) => g.id === 'marketing').services.length - 6,
  },
]

export default function ExpertiseList() {
  const [hovered, setHovered] = useState(null)
  const [hoveredService, setHoveredService] = useState(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 30, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 260, damping: 30, mass: 0.5 })

  const handleMove = (e) => {
    x.set(e.clientX)
    y.set(e.clientY)
  }

  return (
    <section className="container-offora relative py-32 sm:py-44" onMouseMove={handleMove}>
      <motion.div
        aria-hidden
        style={{ left: springX, top: springY }}
        animate={{
          opacity: hoveredService ? 1 : 0,
          scale: hoveredService ? 1 : 0.85,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed z-30 hidden -translate-x-[110%] -translate-y-1/2 lg:block"
      >
        <div
          className={`flex h-56 w-48 flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-gradient-to-br ${
            hoveredService ? panelTone[hoveredService.group] : panelTone.technical
          }`}
        >
          {hoveredService?.group === 'marketing' ? (
            <Megaphone size={30} strokeWidth={1.5} className="text-brand" />
          ) : (
            <Code2 size={30} strokeWidth={1.5} className="text-bone/70" />
          )}
          <p className="px-5 text-center font-display text-sm font-medium text-bone">
            {hoveredService?.title}
          </p>
        </div>
      </motion.div>

      {/* Where the home page's particle journey forms the two service
          icons (styled in offora-home.css; inert anywhere else). */}
      <div className="services__glyph" data-journey-stop="services" aria-hidden="true" />

      <Kicker>What We Actually Do</Kicker>
      <h2 className="font-display max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-bone sm:text-6xl">
        <TextReveal text="Two skill sets. One team you can actually reach." />
      </h2>

      <div className="mt-20 border-t border-line">
        {expertise.map((item) => {
          const Icon = icons[item.id]
          return (
            <div key={item.id} className="group/row relative border-b border-line py-10 sm:py-14">
              <Link
                to="/services"
                data-cursor-hover
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:gap-10"
              >
                <span className="font-display flex shrink-0 items-center gap-3 text-sm text-mute">
                  {item.number}
                  <Icon size={16} strokeWidth={1.75} className="text-brand/70" />
                </span>

                <motion.h3
                  animate={{ x: hovered === item.id ? 24 : 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display flex-1 text-4xl font-medium leading-tight tracking-tight text-bone transition-colors duration-300 group-hover/row:text-brand sm:text-6xl lg:text-7xl"
                >
                  {item.title}
                </motion.h3>

                <div className="max-w-xs shrink-0 sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                    {item.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-mute">{item.description}</p>
                </div>

                <motion.span
                  animate={{
                    opacity: hovered === item.id ? 1 : 0,
                    x: hovered === item.id ? 0 : -8,
                  }}
                  transition={{ duration: 0.3 }}
                  className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand text-brand sm:flex"
                >
                  <ArrowUpRight size={20} strokeWidth={2} />
                </motion.span>
              </Link>

              <div className="mt-6 flex flex-wrap gap-2 sm:ml-[3.75rem]">
                {item.services.map((service) => (
                  <span
                    key={service.title}
                    data-cursor-hover
                    onMouseEnter={() => setHoveredService({ ...service, group: item.id })}
                    onMouseLeave={() => setHoveredService(null)}
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-mute/80 transition-colors hover:border-brand/50 hover:text-bone"
                  >
                    {service.title}
                  </span>
                ))}
                {item.moreCount ? (
                  <Link
                    to="/services"
                    data-cursor-hover
                    className="rounded-full border border-dashed border-line px-3 py-1.5 text-xs text-mute/60 transition-colors hover:border-brand/50 hover:text-brand"
                  >
                    +{item.moreCount} more
                  </Link>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
