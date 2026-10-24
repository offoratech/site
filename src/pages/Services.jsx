import { useRef } from 'react'
import PageTransition from '../components/layout/PageTransition.jsx'
import ServicesHero from '../components/services/ServicesHero.jsx'
import ServicesList from '../components/services/ServicesList.jsx'

export default function Services() {
  const curtainRef = useRef(null)

  return (
    <PageTransition>
      <ServicesHero curtainRef={curtainRef} />
      <div
        ref={curtainRef}
        className="relative z-10 rounded-t-[2rem] bg-ink shadow-[0_-50px_100px_-30px_rgba(0,0,0,0.8)] sm:rounded-t-[3rem]"
      >
        <ServicesList />
      </div>
    </PageTransition>
  )
}
