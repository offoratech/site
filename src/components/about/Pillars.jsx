import { motion } from 'framer-motion'
import { Target, Layers, Rocket } from 'lucide-react'
import Reveal from '../ui/Reveal.jsx'

const pillars = [
  {
    icon: Target,
    number: '01',
    title: 'No Cookie-Cutter Playbooks',
    description:
      'We actually look at your business before we start. What works for a restaurant won’t work for a hospital, so we don’t pretend it will.',
    offset: 'sm:mt-0',
  },
  {
    icon: Layers,
    number: '02',
    title: 'One Team, Start to Finish',
    description:
      'The people who build your site are the same people running your ads. Nothing gets lost between departments, because there aren’t any.',
    offset: 'sm:mt-16',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Built to Last',
    description:
      'We’d rather spend an extra week getting it right than hand you something you’ll need to rebuild in six months.',
    offset: 'sm:mt-32',
  },
]

export default function Pillars() {
  return (
    <section className="container-offora py-24 sm:py-36">
      <div className="relative pt-16">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 top-0 h-px origin-left bg-brand"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-line" />

        <div className="grid gap-16 sm:grid-cols-3 sm:gap-10">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <Reveal key={pillar.title} delay={i * 0.12} className={pillar.offset}>
                <div className="flex items-center justify-between">
                  <Icon size={26} strokeWidth={1.25} className="text-brand" />
                  <span className="font-display text-sm text-mute">{pillar.number}</span>
                </div>
                <h2 className="font-display mt-10 text-2xl font-medium tracking-tight text-bone">
                  {pillar.title}
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-mute">{pillar.description}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
