import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Play, ImageIcon } from 'lucide-react'

export default function Lightbox({ item, category, onClose, onNavigate }) {
  const isOpen = Boolean(item && category)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate(1)
      if (e.key === 'ArrowLeft') onNavigate(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose, onNavigate])

  const Icon = category?.id !== 'bts' ? Play : ImageIcon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md sm:p-10"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-line text-bone transition-colors hover:border-brand hover:text-brand"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(-1)
            }}
            aria-label="Previous"
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line text-bone transition-colors hover:border-brand hover:text-brand sm:left-8"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(1)
            }}
            aria-label="Next"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line text-bone transition-colors hover:border-brand hover:text-brand sm:right-8"
          >
            <ChevronRight size={22} />
          </button>

          {item?.video ? (
            <motion.div
              key={item?.id}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-3xl flex-col items-center gap-4"
            >
              <video
                key={item.video}
                src={item.video}
                poster={item.poster}
                controls
                playsInline
                preload="metadata"
                className="max-h-[75vh] w-auto max-w-full rounded-2xl border border-line bg-ink-soft"
              />
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-brand">
                  {category?.label}
                </p>
                <p className="font-display mt-1 text-lg font-medium text-bone">{item?.title}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={item?.id}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex aspect-video w-full max-w-4xl flex-col items-center justify-center rounded-3xl border border-line bg-gradient-to-br from-panel to-ink-soft"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-bone/20 bg-ink/40 text-brand">
                <Icon size={28} strokeWidth={1.75} />
              </span>
              <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-brand">
                {category?.label}
              </p>
              <p className="font-display mt-2 px-6 text-center text-2xl font-medium text-bone sm:text-3xl">
                {item?.title}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
