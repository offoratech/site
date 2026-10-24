import { Mail, Phone, Clock, MapPin } from 'lucide-react'
import { team } from '../../data/team.js'
import TextReveal from '../ui/TextReveal.jsx'
import Kicker from '../ui/Kicker.jsx'

export default function ContactInfo() {
  return (
    <div className="flex flex-col gap-16">
      <div>
        <Kicker>Get In Touch</Kicker>
        <h1 className="font-display max-w-xl text-4xl font-medium leading-[1.02] tracking-[-0.03em] text-bone sm:text-5xl lg:text-6xl">
          <TextReveal text="Tell us what you're building." trigger="mount" />
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-mute">
          Call or email either of us directly - we're a two-person team, so you'll always be
          talking to someone who can actually make a decision. Or just fill out the form below.
        </p>
      </div>

      <div className="divide-y divide-line border-y border-line">
        {team.map((member) => (
          <div key={member.id} className="py-8">
            <p className="text-xs font-semibold tracking-[0.12em] text-brand">
              {member.role}
            </p>
            <p className="font-display mt-2 text-2xl font-medium text-bone">{member.name}</p>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
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
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 text-sm text-bone/80 sm:flex-row sm:gap-10">
        <div className="flex items-center gap-3">
          <Clock size={15} className="text-mute" />
          Mon – Sat, 9:00 AM – 7:00 PM IST
        </div>
        <div className="flex items-center gap-3">
          <MapPin size={15} className="text-mute" />
          Tamil Nadu, India - Serving clients worldwide
        </div>
      </div>
    </div>
  )
}
