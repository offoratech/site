import { Link } from 'react-router-dom'
import { Mail, Phone, ArrowUpRight } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition.jsx'
import TextReveal from '../components/ui/TextReveal.jsx'
import BracketFrame from '../components/ui/BracketFrame.jsx'
import Kicker from '../components/ui/Kicker.jsx'
import { CtaButton } from '../components/ui/CtaButton.jsx'
import { team } from '../data/team.js'
import { serviceGroups } from '../data/services.js'

// Each founder's page, route-to-member-id, mirrored in App.jsx.
const focusGroupId = { hariharaprabu: 'marketing', mugilan: 'technical' }
const otherPath = { hariharaprabu: '/mugilan', mugilan: '/prabu' }

export default function Founder({ memberId }) {
  const member = team.find((m) => m.id === memberId)
  const other = team.find((m) => m.id !== memberId)
  const focusGroup = serviceGroups.find((g) => g.id === focusGroupId[memberId])

  if (!member) return null

  return (
    <PageTransition>
      <section className="container-offora pt-44 pb-32 sm:pt-56 sm:pb-48">
        <Kicker>The Founders</Kicker>

        <div className="grid items-start gap-14 sm:grid-cols-[320px_1fr] sm:gap-16 lg:grid-cols-[380px_1fr]">
          <div className="relative mx-auto w-full max-w-[320px] sm:mx-0">
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-3xl border border-brand/40"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-3xl bg-brand/[0.06]"
            />
            <BracketFrame spread>
              <div className="aspect-square w-full overflow-hidden rounded-3xl bg-paper shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              </div>
            </BracketFrame>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-brand">{member.role}</p>
            <h1 className="font-display mt-3 text-5xl font-semibold uppercase leading-[1.0] tracking-tight text-bone sm:text-6xl lg:text-7xl">
              <TextReveal text={member.name} trigger="mount" />
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-mute">{member.bio}</p>

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
            </div>

            <div className="mt-10">
              <CtaButton as={Link} to="/contact" variant="outline" className="normal-case tracking-normal">
                Work With {member.name.split(' ')[0]}
              </CtaButton>
            </div>
          </div>
        </div>

        {focusGroup && (
          <div className="mt-24 border-t border-line pt-16 sm:mt-32">
            <Kicker>{focusGroup.kicker}</Kicker>
            <h2 className="font-display max-w-2xl text-3xl font-medium leading-[1.1] tracking-tight text-bone sm:text-4xl">
              {focusGroup.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-mute">{focusGroup.description}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {focusGroup.services.map((s) => (
                <span
                  key={s.title}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-mute/80"
                >
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {other && (
          <div className="mt-24 border-t border-line pt-10 sm:mt-32">
            <Link
              to={otherPath[memberId]}
              data-cursor-hover
              className="group inline-flex items-center gap-3 text-sm font-medium text-mute transition-colors hover:text-bone"
            >
              Meet {other.name}
              <ArrowUpRight
                size={16}
                className="text-brand transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>
        )}
      </section>
    </PageTransition>
  )
}
