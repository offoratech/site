import { useState } from 'react'
import GalleryItem from './GalleryItem.jsx'
import Parallax from '../ui/Parallax.jsx'

export default function GalleryMarqueeRow({ category, reverse, onOpen }) {
  const [paused, setPaused] = useState(false)
  const isVideo = category.id !== 'bts'
  const loop = [...category.items, ...category.items]

  return (
    <section className="py-10 sm:py-14">
      <div className="container-offora mb-6 flex items-baseline gap-4 sm:mb-8">
        <h2 className="font-display text-2xl font-medium text-bone sm:text-3xl">
          {category.label}
        </h2>
        <span className="h-px flex-1 bg-line" />
        <span className="hidden text-sm text-mute sm:block">{category.items.length} pieces</span>
      </div>

      <Parallax offset={reverse ? -24 : 24} className="group/row relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-32" />

        <div
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          className="flex w-max gap-4 group-hover/row:[animation-play-state:paused] sm:gap-6"
          style={{
            animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${category.items.length * 6}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {loop.map((item, i) => (
            <GalleryItem
              key={`${item.id}-${i}`}
              item={item}
              index={i}
              categoryLabel={category.label}
              isVideo={isVideo}
              onOpen={() => onOpen(item, category)}
            />
          ))}
        </div>
      </Parallax>
    </section>
  )
}
