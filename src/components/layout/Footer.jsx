import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion'
import logo from '../../assets/offora-logo-wordmark.png'
import { InstagramIcon, LinkedinIcon } from '../ui/SocialIcons.jsx'
import TextReveal from '../ui/TextReveal.jsx'
import Parallax from '../ui/Parallax.jsx'
import Kicker from '../ui/Kicker.jsx'
import { CtaButton } from '../ui/CtaButton.jsx'
import { clients } from '../../data/clients.js'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const nav = [
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

export default function Footer() {
  const spotX = useMotionValue(-999)
  const spotY = useMotionValue(-999)
  const springX = useSpring(spotX, { stiffness: 120, damping: 25, mass: 0.6 })
  const springY = useSpring(spotY, { stiffness: 120, damping: 25, mass: 0.6 })
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${springX}px ${springY}px, color-mix(in srgb, var(--color-brand) 12%, transparent), transparent 70%)`
  const ctaRef = useRef(null)

  const handleMove = (e) => {
    const rect = ctaRef.current?.getBoundingClientRect()
    if (!rect) return
    spotX.set(e.clientX - rect.left)
    spotY.set(e.clientY - rect.top)
  }

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-soft">
      <Parallax
        offset={60}
        className="pointer-events-none absolute -top-24 left-[-10%] h-[30rem] w-[30rem] rounded-full bg-brand/14 blur-[150px]"
      />

      <div className="container-offora relative py-32 sm:py-48">
        <div
          ref={ctaRef}
          onMouseMove={handleMove}
          onMouseLeave={() => {
            spotX.set(-999)
            spotY.set(-999)
          }}
          className="relative"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-x-20 -inset-y-24 hidden opacity-70 lg:block"
            style={{ background: spotlight }}
          />

          <Kicker>Let&rsquo;s Build</Kicker>
          <h2 className="font-space max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.02em] text-bone sm:text-6xl lg:text-7xl">
            <TextReveal text="Got a project in mind? Let's hear it." />
          </h2>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="relative mt-14 flex flex-wrap items-center gap-8"
          >
            <CtaButton
              as={Link}
              to="/contact"
              className="normal-case tracking-normal hover:shadow-[0_0_45px_-8px_var(--color-brand)]"
            >
              Book a Strategy Call
            </CtaButton>
            <a
              href="mailto:ceo@offoratech.com"
              data-cursor-hover
              className="inline-flex items-center gap-2 text-base font-medium text-mute transition-colors hover:text-bone"
            >
              <Mail size={18} />
              ceo@offoratech.com
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="relative mt-8 text-sm text-mute"
          >
            Trusted by {clients.length}+ businesses across healthcare, hospitality, retail &amp; education.
          </motion.p>
        </div>

        <div className="mt-32 grid grid-cols-2 gap-10 border-t border-line pt-12 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="inline-flex items-center">
              <img src={logo} alt="Offora" className="h-9 w-auto" />
            </Link>
            <p className="mt-4 max-w-[220px] text-sm leading-relaxed text-mute">
              We don&rsquo;t follow trends. We create them.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mute">
              Navigate
            </p>
            <ul className="space-y-3">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-bone/80 transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mute">
              Contact
            </p>
            <ul className="space-y-3 text-sm text-bone/80">
              <li>
                <a href="tel:+916369492510" className="transition-colors hover:text-brand">
                  +91 63694 92510
                </a>
              </li>
              <li>
                <a href="mailto:ceo@offoratech.com" className="transition-colors hover:text-brand">
                  ceo@offoratech.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mute">
              Follow
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/offora_tech?igsi=dm1zdzNwOTV1Zmlx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                data-cursor-hover
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-bone transition-colors hover:border-brand hover:text-brand"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://www.linkedin.com/company/offora-private-limited/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                data-cursor-hover
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-bone transition-colors hover:border-brand hover:text-brand"
              >
                <LinkedinIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-line pb-24 pt-8 text-xs text-mute sm:flex-row lg:pb-0">
          <p>© {new Date().getFullYear()} Offora Tech. All rights reserved.</p>
          <p>
            Built with <span aria-hidden="true">❤️</span> by Offora Tech
          </p>
        </div>
      </div>

      <span className="font-display pointer-events-none absolute -bottom-[6%] left-1/2 hidden -translate-x-1/2 select-none whitespace-nowrap text-[clamp(8.5rem,14vw,13rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1px_var(--color-line)] lg:block">
        OFFORA TECH
      </span>
    </footer>
  )
}
