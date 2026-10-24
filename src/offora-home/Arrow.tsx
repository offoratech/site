type Direction = 'right' | 'up-right' | 'left' | 'up' | 'down'

const ROTATION: Record<Direction, number> = { right: 0, 'up-right': -45, left: 180, up: -90, down: 90 }

export function Arrow({ direction = 'right' }: { direction?: Direction }) {
  return (
    <svg className={`arrow arrow--${direction}`} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <g transform={`rotate(${ROTATION[direction]} 8 8)`}>
        <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </g>
    </svg>
  )
}
