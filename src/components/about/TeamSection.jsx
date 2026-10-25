import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, Phone, ArrowUpRight } from 'lucide-react'
import { team } from '../../data/team.js'
import TextReveal from '../ui/TextReveal.jsx'
import Magnetic from '../ui/Magnetic.jsx'
import BracketFrame from '../ui/BracketFrame.jsx'
import Kicker from '../ui/Kicker.jsx'

const profilePath = { hariharaprabu: '/prabu', mugilan: '/mugilan' }

export default function TeamSection() {
  return (
    <section className="container-offora py-32 sm:py-44">
      <Kicker>The Founders</Kicker>
      <h2 className="font-display max-w-2xl text-4xl font-medium leading-[1.05] tracking-tight text-bone sm:text-6xl">
        <TextReveal text="The two of us, actually doing the work." />
      </h2>

      <div className="mt-24 flex flex-col gap-24 sm:gap-32">
        {team.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid items-center gap-14 border-t border-line pt-16 sm:grid-cols-[300px_1fr] sm:gap-16 lg:grid-cols-[360px_1fr]"
          >
            <div className="relative mx-auto w-full max-w-[300px] sm:mx-0">
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-3xl border border-brand/40"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-3xl bg-brand/[0.06]"
              />

              <Link to={profilePath[member.id]} data-cursor-hover aria-label={`View ${member.name}'s profile`}>
                <BracketFrame spread>
                  <div className="aspect-square w-full overflow-hidden rounded-3xl bg-paper shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </BracketFrame>
              </Link>

              <span className="font-display absolute -top-9 left-0 flex items-center gap-1 text-xs text-mute">
                <span className="text-brand">[</span>
                {String(i + 1).padStart(2, '0')} / {String(team.length).padStart(2, '0')}
                <span className="text-brand">]</span>
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-brand">
                {member.role}
              </p>
              <h3 className="font-display mt-3 text-4xl font-semibold uppercase leading-[1.02] tracking-tight text-bone sm:text-5xl lg:text-6xl">
                <Link to={profilePath[member.id]} data-cursor-hover className="transition-colors hover:text-brand">
                  {member.name}
                </Link>
              </h3>
              <p className="mt-6 max-w-md text-base leading-relaxed text-mute">{member.bio}</p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <a
                  href={`tel:${member.phone.replace(/\s/g, '')}`}
                  data-cursor-hover
                  className="flex items-center gap-2 text-sm text-bone/80 transition-colors hover:text-brand"
                >
                  <Phone size={14} />
                  {member.phone}
                </a>
                <a
                  href={`mailto:${member.email}`}
                  data-cursor-hover
                  className="flex items-center gap-2 text-sm text-bone/80 transition-colors hover:text-brand"
                >
                  <Mail size={14} />
                  {member.email}
                </a>
                <Magnetic>
                  <a
                    href={`mailto:${member.email}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-bone transition-colors hover:border-brand hover:text-brand"
                  >
                    <ArrowUpRight size={18} strokeWidth={2} />
                  </a>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
