import type { ReactNode } from 'react'

/** The `[ LABEL ]` section marker. Brackets are decorative; screen readers get the label only. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`eyebrow ${className}`} data-reveal>
      <span className="eyebrow__bracket" aria-hidden="true">[</span>
      <span className="eyebrow__label">{children}</span>
      <span className="eyebrow__bracket" aria-hidden="true">]</span>
    </p>
  )
}
