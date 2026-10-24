/**
 * Hand-off point between the hero's particle field and the page-wide
 * particle journey (ParticleJourney.tsx). The hero publishes its formed
 * wordmark - the exact point cloud, per-particle random seeds and clock -
 * so the journey can pick up the very same particles where the hero leaves
 * them, instead of starting a new, look-alike cloud.
 *
 * Kept separate from OneTeamField.ts so it ships in the main chunk: both
 * sides can subscribe before Three.js has loaded.
 */

export type HeroParticles = {
  count: number
  rand: Float32Array
  wordmark: Float32Array
  /** performance.now() the hero's clock started at - shared so idle breathing lines up. */
  start: number
  /** The hero's canvas host (.hero__canvas): its rect is where the wordmark sits on screen. */
  host: HTMLElement
  canvas: HTMLCanvasElement
  /** True once the hero's scroll sequence has the wordmark fully formed - the journey never takes over before that. */
  formed: () => boolean
}

let current: HeroParticles | null = null
const listeners = new Set<(h: HeroParticles | null) => void>()

export function publishHeroParticles(h: HeroParticles | null) {
  current = h
  listeners.forEach((l) => l(h))
}

export function onHeroParticles(fn: (h: HeroParticles | null) => void) {
  listeners.add(fn)
  fn(current)
  return () => {
    listeners.delete(fn)
  }
}
