import { useCallback, useEffect, useMemo, useState, memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const distributeLogos = (allLogos, columnCount) => {
  const shuffled = shuffleArray(allLogos)
  const columns = Array.from({ length: columnCount }, () => [])

  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo)
  })

  const maxLength = Math.max(...columns.map((col) => col.length))
  columns.forEach((col) => {
    while (col.length < maxLength) {
      col.push(shuffled[Math.floor(Math.random() * shuffled.length)])
    }
  })

  return columns
}

/** `logo.img` may be an SVG-style component OR an image URL string. */
function LogoFace({ logo, className }) {
  if (typeof logo.img === 'string') {
    return <img src={logo.img} alt={logo.name} className={className} />
  }
  const Comp = logo.img
  return <Comp className={className} />
}

const LogoColumn = memo(function LogoColumn({ logos, index, currentTime, cardClassName }) {
  const cycleInterval = 2200
  const columnDelay = index * 200
  const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
  const currentIndex = Math.floor(adjustedTime / cycleInterval)
  const current = useMemo(() => logos[currentIndex], [logos, currentIndex])

  return (
    <motion.div
      className="relative flex flex-col items-center gap-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
    >
      <div className="relative h-24 w-40 overflow-hidden sm:h-28 sm:w-52">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.id}-${currentIndex}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: '12%', opacity: 0, filter: 'blur(8px)' }}
            animate={{
              y: '0%',
              opacity: 1,
              filter: 'blur(0px)',
              transition: { type: 'spring', stiffness: 300, damping: 20, mass: 1 },
            }}
            exit={{
              y: '-16%',
              opacity: 0,
              filter: 'blur(6px)',
              transition: { type: 'tween', ease: 'easeIn', duration: 0.3 },
            }}
          >
            <div className={cardClassName ?? 'flex h-full w-full items-center justify-center'}>
              <LogoFace logo={current} className="h-full w-full object-contain" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={`${current.id}-label`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="text-xs font-medium uppercase tracking-[0.2em] text-mute"
        >
          {current.name}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
})

export function LogoCarousel({ columnCount = 1, logos, cardClassName }) {
  const [logoSets, setLogoSets] = useState([])
  const [currentTime, setCurrentTime] = useState(0)

  const updateTime = useCallback(() => {
    setCurrentTime((prevTime) => prevTime + 100)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(updateTime, 100)
    return () => clearInterval(intervalId)
  }, [updateTime])

  useEffect(() => {
    setLogoSets(distributeLogos(logos, columnCount))
  }, [logos, columnCount])

  return (
    <div className="flex flex-wrap items-start justify-center gap-10 sm:gap-16">
      {logoSets.map((set, index) => (
        <LogoColumn
          key={index}
          logos={set}
          index={index}
          currentTime={currentTime}
          cardClassName={cardClassName}
        />
      ))}
    </div>
  )
}
