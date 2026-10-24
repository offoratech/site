import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import logo from '../../assets/offora-logo-wordmark.png'
import { CtaButton } from '../ui/CtaButton.jsx'
import { LimelightNav } from '../ui/LimelightNav.jsx'

const links = [
  { id: 'home', to: '/', label: 'Home' },
  { id: 'about', to: '/about', label: 'About' },
  { id: 'services', to: '/services', label: 'Services' },
  { id: 'gallery', to: '/gallery', label: 'Gallery' },
  { id: 'contact', to: '/contact', label: 'Contact' },
]

function isLinkActive(to, pathname) {
  return to === '/' ? pathname === '/' : pathname.startsWith(to)
}

const springConfig = { stiffness: 260, damping: 36, mass: 0.6 }
const logoSpringConfig = { stiffness: 80, damping: 24, mass: 0.9 }

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const rowRef = useRef(null)
  const logoRef = useRef(null)
  const [logoCenterShift, setLogoCenterShift] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')

    function measure() {
      if (!mq.matches || !rowRef.current || !logoRef.current) {
        setLogoCenterShift(0)
        return
      }
      const rowStyle = getComputedStyle(rowRef.current)
      const paddingLeft = parseFloat(rowStyle.paddingLeft) || 0
      const paddingRight = parseFloat(rowStyle.paddingRight) || 0
      const contentWidth = rowRef.current.clientWidth - paddingLeft - paddingRight
      const logoWidth = logoRef.current.offsetWidth
      setLogoCenterShift((contentWidth - logoWidth) / 2)
    }

    measure()

    const observer = new ResizeObserver(measure)
    if (rowRef.current) observer.observe(rowRef.current)
    if (logoRef.current) observer.observe(logoRef.current)

    window.addEventListener('resize', measure)
    mq.addEventListener('change', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      mq.removeEventListener('change', measure)
    }
  }, [])

  const logoX = useSpring(useTransform(scrollY, [0, 140], [0, logoCenterShift]), logoSpringConfig)

  const maxWidth = useSpring(useTransform(scrollY, [0, 140], [1600, 1152]), springConfig)
  const marginTop = useSpring(useTransform(scrollY, [0, 140], [0, 12]), springConfig)
  const borderRadius = useSpring(useTransform(scrollY, [0, 140], [0, 16]), springConfig)
  const background = useTransform(
    scrollY,
    [0, 140],
    ['rgba(10,10,11,0)', 'rgba(10,10,11,0.8)'],
  )
  const borderColor = useTransform(
    scrollY,
    [0, 140],
    ['rgba(42,42,46,0)', 'rgba(42,42,46,0.8)'],
  )
  const blur = useTransform(scrollY, [0, 140], ['blur(0px)', 'blur(20px)'])

  const activeIndex = links.findIndex((link) => isLinkActive(link.to, pathname))

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 sm:px-0">
      <motion.div
        style={{
          maxWidth,
          marginTop,
          borderRadius,
          backgroundColor: background,
          borderColor,
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
        }}
        className="w-full border"
      >
        <div ref={rowRef} className="container-offora flex h-20 items-center justify-between">
          <motion.div ref={logoRef} style={{ x: logoX }} className="flex items-center">
            <Link to="/" className="group flex items-center">
              <img
                src={logo}
                alt="Offora"
                className="h-12 w-auto transition-transform duration-500 group-hover:scale-105 sm:h-14"
              />
            </Link>
          </motion.div>

          <LimelightNav
            items={links}
            activeIndex={activeIndex}
            onItemClick={(_, item) => navigate(item.to)}
            className="hidden border-none bg-transparent px-0 backdrop-blur-none lg:inline-flex"
          />

          <CtaButton
            as={Link}
            to="/contact"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Start a Project
          </CtaButton>
        </div>
      </motion.div>
    </header>
  )
}
