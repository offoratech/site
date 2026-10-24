import { cn } from '../../utils/cn.js'

const corner = 'absolute h-6 w-6 border-brand transition-all duration-500 ease-out'

export default function BracketFrame({ children, className, spread = false }) {
  const out = spread
    ? 'group-hover:-top-3.5 group-hover:-left-3.5'
    : ''

  return (
    <div className={cn('group relative', className)}>
      <span
        className={cn(
          corner,
          '-top-2 -left-2 border-l-2 border-t-2',
          spread && 'group-hover:-top-3.5 group-hover:-left-3.5',
        )}
      />
      <span
        className={cn(
          corner,
          '-top-2 -right-2 border-r-2 border-t-2',
          spread && 'group-hover:-top-3.5 group-hover:-right-3.5',
        )}
      />
      <span
        className={cn(
          corner,
          '-bottom-2 -left-2 border-b-2 border-l-2',
          spread && 'group-hover:-bottom-3.5 group-hover:-left-3.5',
        )}
      />
      <span
        className={cn(
          corner,
          '-bottom-2 -right-2 border-b-2 border-r-2',
          spread && 'group-hover:-bottom-3.5 group-hover:-right-3.5',
        )}
      />
      {children}
    </div>
  )
}
