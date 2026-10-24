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
 * "One team" particle field for the home hero.
 * Two clusters - a structured lattice (the build) and an orbiting shell (the
 * marketing) - fuse into a single ring as `merge` goes 0 -> 1. `merge` is
 * driven externally from the Hero's existing scroll-linked progress rather
 * than an internal scroll pin, so it never competes with the page's sticky
 * curtain-reveal mechanic. All per-frame motion runs in the vertex shader.
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

  attribute vec3 aBuild;
  attribute vec3 aMarket;
  attribute vec3 aRing;
  attribute vec4 aRand;   // x: size, y: delay, z: phase, w: team (0 build, 1 market)

  varying float vAccent;
  varying float vAlpha;

  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
  mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0., -s, c, 0., 0., 0., 1.); }

  void main() {
    float team = aRand.w;

    vec3 build = rotY(uTime * 0.18) * rotX(0.55) * aBuild * uClusterScale + uBuildCenter;
    vec3 market = rotY(-uTime * 0.12) * rotZ(0.35) * aMarket * uClusterScale + uMarketCenter;
    vec3 before = mix(build, market, team);

    vec3 ring = rotZ(uTime * 0.06) * rotX(1.15 + sin(uTime * 0.3) * 0.08) * aRing * uRingScale;

    float t = smoothstep(aRand.y * 0.45, aRand.y * 0.45 + 0.55, uMerge);
    t = t * t * (3.0 - 2.0 * t);
    vec3 pos = mix(before, ring, t);
    float swirl = sin(t * 3.14159);
    pos = rotZ(swirl * (team - 0.5) * 1.6) * pos;
    pos.z += swirl * sin(aRand.z * 6.2831 + uTime) * 1.2;

    pos += 0.045 * vec3(sin(uTime * 0.9 + aRand.z * 40.0), cos(uTime * 0.7 + aRand.z * 31.0), sin(uTime * 0.8 + aRand.z * 17.0));

    vec2 d = pos.xy - uMouse.xy;
    float dist = length(d);
    float push = uMouseForce * (1.0 - smoothstep(0.0, 1.6, dist));
    pos.xy += normalize(d + 1e-4) * push * 0.9;
    pos.z += push * 0.6;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.x) * uPixelRatio * (12.0 / -mv.z);

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

function randomOnSphere(r) {
  const u = Math.random() * 2 - 1
  const th = Math.random() * Math.PI * 2
  const s = Math.sqrt(1 - u * u)
  return [r * s * Math.cos(th), r * u, r * s * Math.sin(th)]
}

/** Points sitting on the edges and face grid lines of a cube: reads as "engineered". */
function latticePoint() {
  const g = 4
  const axis = Math.floor(Math.random() * 3)
  const p = [0, 0, 0]
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

export class OneTeamField {
  constructor(host, opts = {}) {
    const { count = 12000, static: isStatic = false } = opts
    this.host = host
    this.renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.setClearColor(0x000000, 0)
    host.appendChild(this.renderer.domElement)

    this.scene = new Scene()
    this.camera = new PerspectiveCamera(35, 1, 0.1, 100)
    this.camera.position.set(0, 0, 14)

    this.raf = 0
    this.running = false
    this.mouseTarget = new Vector2(99, 99)
    this.mouseNow = new Vector3(99, 99, 0)
    this.forceTarget = 0
    this.start = performance.now()
    this.merge = 0
    this.mergeNow = 0
    this.onAnchors = undefined

    const n = count
    const build = new Float32Array(n * 3)
    const market = new Float32Array(n * 3)
    const ring = new Float32Array(n * 3)
    const rand = new Float32Array(n * 4)
    for (let i = 0; i < n; i++) {
      build.set(latticePoint(), i * 3)
      market.set(marketPoint(), i * 3)
      ring.set(ringPoint(), i * 3)
      rand.set([Math.random() ** 2, Math.random(), Math.random(), i % 2], i * 4)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(ring.slice(), 3))
    geo.setAttribute('aBuild', new BufferAttribute(build, 3))
    geo.setAttribute('aMarket', new BufferAttribute(market, 3))
    geo.setAttribute('aRing', new BufferAttribute(ring, 3))
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
        // Matches --color-bone / --color-brand exactly, see src/index.css.
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
    this.resize()
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)

    if (isStatic) this.renderOnce()
  }

  worldSize() {
    const h = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z
    return { w: h * this.camera.aspect, h }
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.host
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    const world = this.worldSize()
    const u = this.material.uniforms
    // Desktop only (the Hero hides this canvas below lg) - clusters sit to
    // the right of the headline column, ring lands centre-right stage.
    u.uClusterScale.value = Math.min(world.h * 0.11, world.w * 0.065)
    u.uBuildCenter.value.set(world.w * 0.18, world.h * 0.14, 0)
    u.uMarketCenter.value.set(world.w * 0.36, -world.h * 0.04, 0)
    u.uRingScale.value = Math.min(world.h * 0.15, world.w * 0.1)
    if (!this.running) this.renderOnce()
  }

  onPointer = (e) => {
    if (e.pointerType === 'touch') return
    const r = this.host.getBoundingClientRect()
    if (e.clientY < r.top || e.clientY > r.bottom) return this.onLeave()
    const world = this.worldSize()
    this.mouseTarget.set(((e.clientX - r.left) / r.width - 0.5) * world.w, -((e.clientY - r.top) / r.height - 0.5) * world.h)
    this.forceTarget = 1
  }

  onLeave = () => {
    this.forceTarget = 0
  }

  project(v) {
    const p = v.clone().project(this.camera)
    return { x: (p.x * 0.5 + 0.5) * this.host.clientWidth, y: (-p.y * 0.5 + 0.5) * this.host.clientHeight }
  }

  tick = () => {
    if (!this.running) return
    const u = this.material.uniforms
    u.uTime.value = (performance.now() - this.start) / 1000
    this.mergeNow += (this.merge - this.mergeNow) * 0.08
    u.uMerge.value = this.mergeNow
    u.uOpacity.value = 0.62 + 0.38 * this.mergeNow
    this.mouseNow.x += (this.mouseTarget.x - this.mouseNow.x) * 0.12
    this.mouseNow.y += (this.mouseTarget.y - this.mouseNow.y) * 0.12
    u.uMouseForce.value += (this.forceTarget - u.uMouseForce.value) * 0.06
    this.renderer.render(this.scene, this.camera)
    this.onAnchors?.(this.project(u.uBuildCenter.value), this.project(u.uMarketCenter.value))
    this.raf = requestAnimationFrame(this.tick)
  }

  renderOnce() {
    this.material.uniforms.uMerge.value = this.merge
    this.renderer.render(this.scene, this.camera)
    this.onAnchors?.(
      this.project(this.material.uniforms.uBuildCenter.value),
      this.project(this.material.uniforms.uMarketCenter.value),
    )
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
