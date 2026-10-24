import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn.js'

/**
 * A route-driven navigation bar with a glowing "limelight" bar that slides
 * to whichever item is active. `activeIndex` is controlled by the caller
 * (usually derived from the current route) rather than internal click state,
 * so browser back/forward and direct links keep it in sync.
 */
export function LimelightNav({ items, activeIndex, onItemClick, className, itemClassName }) {
  const itemRefs = useRef([])
  const limelightRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  const position = useCallback(() => {
    const limelight = limelightRef.current
    const activeItem = itemRefs.current[activeIndex]
    if (!limelight || !activeItem || !activeItem.offsetWidth) return

    const left = activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2
    limelight.style.left = `${left}px`
  }, [activeIndex])

  useLayoutEffect(() => {
    position()

    if (!isReady) {
      const id = requestAnimationFrame(() => setIsReady(true))
      return () => cancelAnimationFrame(id)
    }
  }, [position, items.length, isReady])

  // The desktop and mobile nav instances are each `hidden` at the other's
  // breakpoint, so a live resize across that breakpoint (or a tablet
  // rotating) won't re-measure via the effect above - re-check on resize.
  useLayoutEffect(() => {
    window.addEventListener('resize', position)
    return () => window.removeEventListener('resize', position)
  }, [position])

  if (!items.length) return null

  return (
    <nav
      className={cn(
        'relative inline-flex h-14 items-center gap-1 rounded-full border border-line bg-ink-soft/90 px-2 backdrop-blur',
        className,
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        const isActive = index === activeIndex

        return (
          <button
            key={item.id}
            ref={(el) => (itemRefs.current[index] = el)}
            type="button"
            data-cursor-hover
            onClick={() => onItemClick(index, item)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative z-20 flex h-full items-center justify-center gap-2 rounded-full px-4 transition-colors',
              isActive ? 'text-bone' : 'text-mute hover:text-bone/80',
              itemClassName,
            )}
          >
            {Icon && (
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                strokeWidth={isActive ? 2.25 : 1.75}
              />
            )}
            {item.iconOnly ? (
              <span className="sr-only">{item.label}</span>
            ) : (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        )
      })}

      <div
        ref={limelightRef}
        style={{ left: 0 }}
        className={cn(
          'absolute top-0 z-10 h-[3px] w-9 rounded-full bg-brand shadow-[0_0_12px_2px_var(--color-brand)]',
          isReady && 'transition-[left] duration-400 ease-in-out',
        )}
      >
        <div className="pointer-events-none absolute left-1/2 top-[3px] h-12 w-24 -translate-x-1/2 bg-gradient-to-b from-brand/25 to-transparent [clip-path:polygon(15%_100%,35%_0,65%_0,85%_100%)]" />
      </div>
    </nav>
  )
}
