import { useRef } from 'react'
import PageTransition from '../components/layout/PageTransition.jsx'
import AboutHero from '../components/about/AboutHero.jsx'
import Pillars from '../components/about/Pillars.jsx'
import TeamSection from '../components/about/TeamSection.jsx'

export default function About() {
  const curtainRef = useRef(null)

  return (
    <PageTransition>
      <AboutHero curtainRef={curtainRef} />
      <div
        ref={curtainRef}
        className="relative z-10 rounded-t-[2rem] bg-ink shadow-[0_-50px_100px_-30px_rgba(0,0,0,0.8)] sm:rounded-t-[3rem]"
      >
        <Pillars />
        <TeamSection />
      </div>
    </PageTransition>
  )
}
