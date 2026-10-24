import { useCallback, useRef, useState } from 'react'
import PageTransition from '../components/layout/PageTransition.jsx'
import GalleryHero from '../components/gallery/GalleryHero.jsx'
import GalleryMarqueeRow from '../components/gallery/GalleryMarqueeRow.jsx'
import Lightbox from '../components/gallery/Lightbox.jsx'
import { galleryCategories } from '../data/gallery.js'

export default function Gallery() {
  const [selected, setSelected] = useState(null)
  const curtainRef = useRef(null)

  const openItem = useCallback((item, category) => {
    setSelected({ item, category })
  }, [])

  const closeItem = useCallback(() => setSelected(null), [])

  const navigate = useCallback(
    (dir) => {
      if (!selected) return
      const { items } = selected.category
      const currentIndex = items.findIndex((i) => i.id === selected.item.id)
      const nextIndex = (currentIndex + dir + items.length) % items.length
      setSelected({ item: items[nextIndex], category: selected.category })
    },
    [selected],
  )

  return (
    <PageTransition>
      <GalleryHero curtainRef={curtainRef} />
      <div
        ref={curtainRef}
        className="relative z-10 rounded-t-[2rem] bg-ink shadow-[0_-50px_100px_-30px_rgba(0,0,0,0.8)] sm:rounded-t-[3rem]"
      >
        {galleryCategories.map((category, i) => (
          <GalleryMarqueeRow
            key={category.id}
            category={category}
            reverse={i % 2 === 1}
            onOpen={openItem}
          />
        ))}
      </div>
      <Lightbox
        item={selected?.item}
        category={selected?.category}
        onClose={closeItem}
        onNavigate={navigate}
      />
    </PageTransition>
  )
}
