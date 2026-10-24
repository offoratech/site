let cached: boolean | null = null

/**
 * Whether this browser can create a WebGL context. Probed once per page
 * session, and the probe's context is released immediately: browsers cap
 * live WebGL contexts per tab (Chrome: 16) and silently kill the oldest
 * beyond that - which, after a few visits to this page, was the hero's own
 * particle canvas.
 */
export function webglAvailable() {
  if (cached !== null) return cached
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    cached = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}
