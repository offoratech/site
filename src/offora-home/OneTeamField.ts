import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

/**
 * "One team" particle field.
 * Two clusters — a structured lattice (the build) and an orbiting shell (the marketing) —
 * fuse into a single ring as `merge` goes 0 → 1. All motion runs in the vertex shader.
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uMerge;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  uniform float uMouseForce;
  uniform vec3 uBuildCenter;
  uniform vec3 uMarketCenter;
  uniform float uClusterScale;
  uniform float uRingScale;
  uniform float uFlatShape;
  uniform float uWordmark;

  attribute vec3 aBuild;
  attribute vec3 aMarket;
  attribute vec3 aRing;
  attribute vec3 aWordmark;
  attribute vec4 aRand;   // x: size, y: delay, z: phase, w: team (0 build, 1 market)

  varying float vAccent;
  varying float vAlpha;

  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
  mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0., -s, c, 0., 0., 0., 1.); }

  void main() {
    float team = aRand.w;

    // Before: each particle belongs to one of two separate teams.
    vec3 build = rotY(uTime * 0.18) * rotX(0.55) * aBuild * uClusterScale + uBuildCenter;
    vec3 market = rotY(-uTime * 0.12) * rotZ(0.35) * aMarket * uClusterScale + uMarketCenter;
    vec3 before = mix(build, market, team);

    // After: everyone on the same ring - or, with uFlatShape, a flat logo
    // silhouette that can keep morphing into the full wordmark as uWordmark
    // goes 0 → 1. A torus reads fine tumbling on any axis; the logo/wordmark
    // does not, so it gets zero rotation - it faces the camera dead-on,
    // exactly like the source mark, every single time it forms.
    vec3 ringTorus = rotZ(uTime * 0.06) * rotX(1.15 + sin(uTime * 0.3) * 0.08) * aRing * uRingScale;

    // Icon -> wordmark isn't a straight glide: each particle collapses away
    // from the icon, scatters, then reassembles into the OFFORA wordmark -
    // staggered per-particle (via aRand.z) so it reads as breaking apart
    // and reforming, not a synchronized slide.
    float wt = smoothstep(aRand.z * 0.4, aRand.z * 0.4 + 0.6, uWordmark);
    wt = wt * wt * (3.0 - 2.0 * wt);
    vec3 wordmarkMix = mix(aRing, aWordmark, wt);
    float collapse = sin(wt * 3.14159);
    vec3 scatterDir = vec3(aRand.y - 0.5, aRand.x - 0.5, aRand.z - 0.5);
    vec3 ringLogo = (wordmarkMix + scatterDir * collapse * 1.3) * uRingScale;

    vec3 ring = mix(ringTorus, ringLogo, uFlatShape);

    // Staggered, eased hand-off with a swirl through the middle of the journey.
    float t = smoothstep(aRand.y * 0.45, aRand.y * 0.45 + 0.55, uMerge);
    t = t * t * (3.0 - 2.0 * t);
    vec3 pos = mix(before, ring, t);
    float swirl = sin(t * 3.14159);
    pos = rotZ(swirl * (team - 0.5) * 1.6) * pos;
    pos.z += swirl * sin(aRand.z * 6.2831 + uTime) * 1.2;

    // Idle breathing so nothing is ever perfectly still.
    pos += 0.045 * vec3(sin(uTime * 0.9 + aRand.z * 40.0), cos(uTime * 0.7 + aRand.z * 31.0), sin(uTime * 0.8 + aRand.z * 17.0));

    // Cursor pushes particles aside.
    vec2 d = pos.xy - uMouse.xy;
    float dist = length(d);
    float push = uMouseForce * (1.0 - smoothstep(0.0, 1.6, dist));
    pos.xy += normalize(d + 1e-4) * push * 0.9;
    pos.z += push * 0.6;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.x) * uPixelRatio * (12.0 / -mv.z);

    // Green is rare: a few particles before, more once the teams are one.
    vAccent = step(0.86 - t * 0.22, fract(aRand.z * 7.13));
    vAlpha = 0.5 + 0.5 * aRand.x;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uText;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vAccent;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float edge = 1.0 - smoothstep(0.32, 0.5, r);
    gl_FragColor = vec4(mix(uText, uAccent, vAccent), edge * vAlpha * uOpacity);
  }
`

function randomOnSphere(r: number) {
  const u = Math.random() * 2 - 1
  const th = Math.random() * Math.PI * 2
  const s = Math.sqrt(1 - u * u)
  return [r * s * Math.cos(th), r * u, r * s * Math.sin(th)]
}

/** Points sitting on the edges and face grid lines of a cube: reads as "engineered". */
function latticePoint() {
  const g = 4 // grid divisions per face
  const axis = Math.floor(Math.random() * 3)
  const p = [0, 0, 0]
  // pick a grid line on a face, then a position along it
  const fixed = (Math.random() < 0.5 ? -1 : 1) * 1.15
  const line = (Math.round(Math.random() * g) / g) * 2.3 - 1.15
  const along = Math.random() * 2.3 - 1.15
  const others = [0, 1, 2].filter((a) => a !== axis)
  p[axis] = fixed
  if (Math.random() < 0.5) {
    p[others[0]] = line
    p[others[1]] = along
  } else {
    p[others[0]] = along
    p[others[1]] = line
  }
  return p.map((v) => v + (Math.random() - 0.5) * 0.03)
}

/** A shell plus two orbit rings: reads as "reach". */
function marketPoint() {
  const roll = Math.random()
  if (roll < 0.62) return randomOnSphere(1.25 + (Math.random() - 0.5) * 0.05)
  const a = Math.random() * Math.PI * 2
  const r = roll < 0.82 ? 1.85 : 2.25
  const tilt = roll < 0.82 ? 0.4 : -0.7
  const x = Math.cos(a) * r
  const z = Math.sin(a) * r
  return [x, Math.sin(tilt) * z * 0.6 + (Math.random() - 0.5) * 0.04, Math.cos(tilt) * z]
}

function ringPoint() {
  const R = 2.2
  const tube = 0.36 + (Math.random() - 0.5) * 0.08
  const u = Math.random() * Math.PI * 2
  const v = Math.random() * Math.PI * 2
  const spread = Math.random() < 0.85 ? tube : tube * (1.6 + Math.random() * 1.4)
  return [(R + spread * Math.cos(v)) * Math.cos(u), (R + spread * Math.cos(v)) * Math.sin(u), spread * Math.sin(v)]
}

// `loadLogoRingPositions` used to live here as its own copy; it's now the
// shared `loadImagePoints` sampler (also used by the per-section particle
// glyphs), re-exported under its original name so Hero.tsx's import keeps
// working unchanged.
export { loadImagePoints as loadLogoRingPositions } from './particlePoints'

export class OneTeamField {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(35, 1, 0.1, 100)
  private material: ShaderMaterial
  private points: Points
  private raf = 0
  private running = false
  private mouseTarget = new Vector2(99, 99)
  private mouseNow = new Vector3(99, 99, 0)
  private forceTarget = 0
  private start = performance.now()
  private host: HTMLElement
  /** Optional reserved band (phones) the two clusters sit in, clear of the headline. */
  private stage?: HTMLElement
  /** World units the label anchors sit above each cluster's centre (0 = centre, the desktop default). */
  private tagLift = 0
  private ro: ResizeObserver
  /** Scroll-driven 0 → 1. Set from outside; eased internally. */
  merge = 0
  private mergeNow = 0
  /** Scroll-driven 0 → 1: morphs the formed logo into the full wordmark. Eased internally, like `merge`. */
  wordmark = 0
  private wordmarkNow = 0
  /**
   * The formed wordmark's raw data (null when no wordmark was supplied), so
   * the page-wide particle journey can carry these exact particles onward.
   */
  readonly shared: { count: number; rand: Float32Array; wordmark: Float32Array | null; start: number; host: HTMLElement; canvas: HTMLCanvasElement }
  /** Screen-space anchors (px) for the cluster labels, plus the eased merge progress, updated every frame. */
  onAnchors?: (build: { x: number; y: number }, market: { x: number; y: number }, merge: number) => void

  constructor(
    host: HTMLElement,
    opts: {
      count: number
      static?: boolean
      ringPositions?: Float32Array | null
      wordmarkPositions?: Float32Array | null
      stage?: HTMLElement | null
    },
  ) {
    this.host = host
    this.stage = opts.stage ?? undefined
    this.renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.setClearColor(0x000000, 0)
    host.appendChild(this.renderer.domElement)
    this.camera.position.set(0, 0, 14)

    const n = opts.count
    const build = new Float32Array(n * 3)
    const market = new Float32Array(n * 3)
    const ring = opts.ringPositions && opts.ringPositions.length === n * 3 ? opts.ringPositions : new Float32Array(n * 3)
    const usingSuppliedRing = ring === opts.ringPositions
    // Only ever sampled while uWordmark > 0, which only happens when the
    // caller also drives `wordmark` - safe to alias `ring` as a no-op
    // fallback rather than allocate a second buffer nobody will read.
    const wordmark = opts.wordmarkPositions && opts.wordmarkPositions.length === n * 3 ? opts.wordmarkPositions : ring
    const rand = new Float32Array(n * 4)
    for (let i = 0; i < n; i++) {
      build.set(latticePoint(), i * 3)
      market.set(marketPoint(), i * 3)
      if (!usingSuppliedRing) ring.set(ringPoint(), i * 3)
      rand.set([Math.random() ** 2, Math.random(), Math.random(), i % 2], i * 4)
    }
    this.shared = {
      count: n,
      rand,
      wordmark: wordmark === opts.wordmarkPositions ? wordmark : null,
      start: this.start,
      host,
      canvas: this.renderer.domElement,
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(ring.slice(), 3))
    geo.setAttribute('aBuild', new BufferAttribute(build, 3))
    geo.setAttribute('aMarket', new BufferAttribute(market, 3))
    geo.setAttribute('aRing', new BufferAttribute(ring, 3))
    geo.setAttribute('aWordmark', new BufferAttribute(wordmark, 3))
    geo.setAttribute('aRand', new BufferAttribute(rand, 4))

    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uMerge: { value: 0 },
        uSize: { value: 2.4 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uMouse: { value: this.mouseNow },
        uMouseForce: { value: 0 },
        uBuildCenter: { value: new Vector3(-3, 0, 0) },
        uMarketCenter: { value: new Vector3(3, 0, 0) },
        uClusterScale: { value: 1 },
        uRingScale: { value: 1 },
        uFlatShape: { value: usingSuppliedRing ? 1 : 0 },
        uWordmark: { value: 0 },
        uText: { value: new Color('#e9e7df') },
        uAccent: { value: new Color('#7ed957') },
        uOpacity: { value: 1 },
      },
    })
    this.points = new Points(geo, this.material)
    this.points.frustumCulled = false
    this.scene.add(this.points)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    if (this.stage) this.ro.observe(this.stage)
    this.resize()
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)

    if (opts.static) this.renderOnce()
  }

  private worldSize() {
    const h = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z
    return { w: h * this.camera.aspect, h }
  }

  /**
   * The stage band's box relative to the host, from layout offsets rather
   * than getBoundingClientRect - the hero's entrance scales the canvas host,
   * and a rect measured mid-tween would misplace the clusters for good.
   */
  private stageBox() {
    const stage = this.stage!
    const until = this.host.offsetParent
    let left = 0
    let top = 0
    let el: HTMLElement | null = stage
    while (el && el !== until) {
      left += el.offsetLeft
      top += el.offsetTop
      el = el.offsetParent as HTMLElement | null
    }
    return { left: left - this.host.offsetLeft, top: top - this.host.offsetTop, width: stage.offsetWidth, height: stage.offsetHeight }
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.host
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    const world = this.worldSize()
    const u = this.material.uniforms
    const portrait = w / h < 0.9
    const stage = this.stage?.clientWidth ? this.stageBox() : null
    this.tagLift = 0
    if (portrait && stage) {
      // Phones with a reserved stage band: the two teams sit side by side
      // inside it, sized to fit, so they never overlap the headline.
      const pxPerWorld = h / world.h
      const sx = stage.left + stage.width / 2
      const sy = stage.top + stage.height * 0.6
      const scalePx = Math.min(stage.width / 4 / 2.2, (stage.height * 0.4) / 2)
      const toWorldX = (px: number) => (px / w - 0.5) * world.w
      const toWorldY = (py: number) => -(py / h - 0.5) * world.h
      u.uClusterScale.value = scalePx / pxPerWorld
      u.uBuildCenter.value.set(toWorldX(sx - stage.width / 4), toWorldY(sy), 0)
      u.uMarketCenter.value.set(toWorldX(sx + stage.width / 4), toWorldY(sy), 0)
      u.uRingScale.value = world.w * 0.17
      // Labels ride just above each cluster rather than a fixed px offset.
      this.tagLift = u.uClusterScale.value * 1.9
    } else if (portrait) {
      // Phones: stack the two teams in the upper half, above the headline.
      u.uClusterScale.value = world.w * 0.13
      u.uBuildCenter.value.set(-world.w * 0.2, world.h * 0.22, 0)
      u.uMarketCenter.value.set(world.w * 0.22, world.h * 0.3, 0)
      u.uRingScale.value = world.w * 0.17
    } else {
      // Desktop: the teams sit to the right, apart; the ring lands centre stage.
      u.uClusterScale.value = Math.min(world.h * 0.11, world.w * 0.07)
      u.uBuildCenter.value.set(world.w * 0.12, world.h * 0.16, 0)
      u.uMarketCenter.value.set(world.w * 0.34, -world.h * 0.02, 0)
      u.uRingScale.value = Math.min(world.h * 0.15, world.w * 0.11)
    }
    if (!this.running) this.renderOnce()
  }

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    const r = this.host.getBoundingClientRect()
    if (e.clientY < r.top || e.clientY > r.bottom) return this.onLeave()
    const world = this.worldSize()
    this.mouseTarget.set(((e.clientX - r.left) / r.width - 0.5) * world.w, -((e.clientY - r.top) / r.height - 0.5) * world.h)
    this.forceTarget = 1
  }
  private onLeave = () => {
    this.forceTarget = 0
  }

  private project(v: Vector3) {
    const p = v.clone()
    p.y += this.tagLift
    p.project(this.camera)
    return { x: (p.x * 0.5 + 0.5) * this.host.clientWidth, y: (-p.y * 0.5 + 0.5) * this.host.clientHeight }
  }

  private tick = () => {
    if (!this.running) return
    const u = this.material.uniforms
    u.uTime.value = (performance.now() - this.start) / 1000
    this.mergeNow += (this.merge - this.mergeNow) * 0.08
    u.uMerge.value = this.mergeNow
    u.uOpacity.value = 0.62 + 0.38 * this.mergeNow
    this.wordmarkNow += (this.wordmark - this.wordmarkNow) * 0.06
    u.uWordmark.value = this.wordmarkNow
    this.mouseNow.x += (this.mouseTarget.x - this.mouseNow.x) * 0.12
    this.mouseNow.y += (this.mouseTarget.y - this.mouseNow.y) * 0.12
    u.uMouseForce.value += (this.forceTarget - u.uMouseForce.value) * 0.06
    this.renderer.render(this.scene, this.camera)
    this.onAnchors?.(this.project(u.uBuildCenter.value), this.project(u.uMarketCenter.value), this.mergeNow)
    this.raf = requestAnimationFrame(this.tick)
  }

  renderOnce() {
    this.material.uniforms.uMerge.value = this.merge
    this.renderer.render(this.scene, this.camera)
  }

  play() {
    if (this.running) return
    this.running = true
    this.raf = requestAnimationFrame(this.tick)
  }

  pause() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  dispose() {
    this.pause()
    this.ro.disconnect()
    window.removeEventListener('pointermove', this.onPointer)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    this.points.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
