import { cn } from '../../utils/cn.js'

export default function Kicker({ children, className }) {
  return (
    <p
      className={cn(
        'mb-6 flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-mute',
        className,
      )}
    >
      <span className="text-brand">[</span>
      {children}
      <span className="text-brand">]</span>
    </p>
  )
}
