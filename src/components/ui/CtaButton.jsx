import { useCallback, useLayoutEffect, useRef } from 'react'
import { useAnimate } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../utils/cn.js'

const paddings = {
  sm: 'h-11 pl-5 pr-1.5 text-sm',
  lg: 'h-14 pl-7 pr-2 text-sm',
}

const badgeSizes = { sm: 32, lg: 44 }
const badgeInset = { sm: 6, lg: 6 }
const iconPx = { sm: 14, lg: 16 }

const EASE = [0.44, 0, 0.56, 1]
const TRANSITION = { duration: 0.46, ease: EASE }

/**
 * A CTA pill whose icon badge dynamically scales — computed from the
 * button's real dimensions, not a CSS trick — to cover the whole pill on
 * hover, covering the label rather than fading it. Adapted from the
 * Originkit "Arrow Reveal Button" (a Framer code component using
 * `motion/react` and Framer's Border/Image controls); ported to plain JS +
 * this project's existing `framer-motion` dependency, with the 12-angle
 * rotation system, image/symbol icon modes, and Framer-canvas scaffolding
 * dropped since none of that applies outside the Framer platform.
 */
export function CtaButton({
  children,
  icon: Icon = ArrowUpRight,
  variant = 'filled',
  size = 'lg',
  as: Comp = 'button',
  className,
  ...props
}) {
  const isFilled = variant === 'filled'
  const badgeSize = badgeSizes[size]
  const inset = badgeInset[size]

  const [scope, animate] = useAnimate()
  const badgeRef = useRef(null)
  const iconRef = useRef(null)
  const metrics = useRef({ scale: 1, x: 0 })

  const measure = useCallback(() => {
    const btn = scope.current
    if (!btn) return
    const w = btn.offsetWidth
    const h = btn.offsetHeight
    const rb = badgeSize / 2
    const cx = w - inset - rb
    const cy = h / 2

    // Cover-scale: distance from the badge's own center to the farthest
    // corner of the pill, doubled (diameter) with a small safety margin.
    const far = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy))
    const coverD = Math.ceil(2 * far * 1.05)

    metrics.current = {
      scale: badgeSize > 0 ? coverD / badgeSize : 1,
      x: w / 2 - cx,
    }
  }, [scope, badgeSize, inset])

  useLayoutEffect(() => {
    measure()
    const btn = scope.current
    if (!btn) return
    const ro = new ResizeObserver(measure)
    ro.observe(btn)
    return () => ro.disconnect()
  }, [measure, scope])

  const onEnter = () => {
    animate(badgeRef.current, { scale: metrics.current.scale }, TRANSITION)
    animate(iconRef.current, { x: metrics.current.x }, TRANSITION)
  }

  const onLeave = () => {
    animate(badgeRef.current, { scale: 1 }, TRANSITION)
    animate(iconRef.current, { x: 0 }, TRANSITION)
  }

  const onDown = () => animate(scope.current, { scale: 0.97 }, { duration: 0.15 })
  const onUp = () => animate(scope.current, { scale: 1 }, { duration: 0.15 })

  return (
    <Comp
      ref={scope}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      onPointerUp={onUp}
      className={cn(
        'relative inline-flex items-center gap-3 overflow-hidden rounded-full font-semibold uppercase tracking-[0.1em] transition-colors duration-300',
        paddings[size],
        isFilled
          ? 'bg-brand text-ink'
          : 'border border-bone/25 text-bone hover:border-brand hover:text-brand',
        className,
      )}
      {...props}
    >
      <span className="relative z-[1]">{children}</span>

      {/* Reserves the badge's footprint in normal flow so padding/gap lay
          out correctly; the badge itself is absolutely positioned so it can
          scale independently of this slot. */}
      <span aria-hidden className="shrink-0" style={{ width: badgeSize, height: badgeSize }} />

      <span
        ref={badgeRef}
        aria-hidden
        className={cn(
          'pointer-events-none absolute z-[2] rounded-full',
          isFilled ? 'bg-ink' : 'bg-brand',
        )}
        style={{
          width: badgeSize,
          height: badgeSize,
          right: inset,
          top: '50%',
          marginTop: -badgeSize / 2,
        }}
      />

      <span
        ref={iconRef}
        aria-hidden
        className="pointer-events-none absolute z-[3] flex items-center justify-center"
        style={{
          width: badgeSize,
          height: badgeSize,
          right: inset,
          top: '50%',
          marginTop: -badgeSize / 2,
        }}
      >
        <Icon
          size={iconPx[size]}
          strokeWidth={2}
          className={isFilled ? 'text-brand' : 'text-ink'}
        />
      </span>
    </Comp>
  )
}
