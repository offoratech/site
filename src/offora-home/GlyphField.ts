import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'

/**
 * A small, self-contained particle accent for a single section: particles
 * start scattered and collapse-and-reform into a supplied shape as
 * `progress` goes 0 → 1 - the same hand-off language as the hero's
 * icon-to-wordmark morph, reused at a lighter weight (lower particle count,
 * no dual build/market clusters, no torus fallback) since this only ever
 * needs to form one fixed shape per section.
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uScale;

  attribute vec3 aBefore;
  attribute vec3 aTarget;
  attribute vec4 aRand; // x: size, y: delay, z: phase, w: phase2

  varying float vAccent;
  varying float vAlpha;

  void main() {
    float t = smoothstep(aRand.y * 0.5, aRand.y * 0.5 + 0.5, uProgress);
    t = t * t * (3.0 - 2.0 * t);

    vec3 pos = mix(aBefore, aTarget, t) * uScale;

    // A brief swirl through the hand-off, then idle breathing once settled.
    float swirl = sin(t * 3.14159);
    pos += swirl * uScale * 0.35 * vec3(sin(aRand.z * 6.2831 + uTime), cos(aRand.w * 6.2831 + uTime), sin(aRand.x * 6.2831 + uTime));
    pos += uScale * 0.018 * vec3(sin(uTime * 0.9 + aRand.z * 40.0), cos(uTime * 0.7 + aRand.w * 31.0), sin(uTime * 0.8 + aRand.x * 17.0));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.x) * uPixelRatio * (12.0 / -mv.z);

    vAccent = step(0.82 - t * 0.3, fract(aRand.z * 7.13));
    vAlpha = (0.45 + 0.45 * aRand.x) * (0.25 + 0.75 * t);
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

export class GlyphField {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(35, 1, 0.1, 100)
  private material: ShaderMaterial
  private points: Points
  private raf = 0
  private running = false
  private start = performance.now()
  private host: HTMLElement
  private ro: ResizeObserver
  /** 0 → 1, set from outside (e.g. a one-shot GSAP tween on scroll-into-view); eased internally. */
  progress = 0
  private progressNow = 0

  constructor(host: HTMLElement, opts: { count: number; target: Float32Array; static?: boolean }) {
    this.host = host
    this.renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.setClearColor(0x000000, 0)
    host.appendChild(this.renderer.domElement)
    this.camera.position.set(0, 0, 14)

    const n = opts.count
    const target = opts.target
    const before = new Float32Array(n * 3)
    const rand = new Float32Array(n * 4)
    for (let i = 0; i < n; i++) {
      // Scattered start: each particle explodes outward from its own target
      // point, so the "before" cloud still roughly outlines the shape's
      // silhouette at a much larger, looser radius - reads as debris that
      // belongs to the shape it's about to form, not an unrelated cloud.
      const tx = target[i * 3] ?? 0
      const ty = target[i * 3 + 1] ?? 0
      const tz = target[i * 3 + 2] ?? 0
      const blast = 2.2 + Math.random() * 2.2
      before[i * 3] = tx * blast + (Math.random() - 0.5) * 1.4
      before[i * 3 + 1] = ty * blast + (Math.random() - 0.5) * 1.4
      before[i * 3 + 2] = tz * blast + (Math.random() - 0.5) * 1.4
      rand.set([Math.random() ** 2, Math.random(), Math.random(), Math.random()], i * 4)
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(target.slice(0, n * 3), 3))
    geo.setAttribute('aBefore', new BufferAttribute(before, 3))
    geo.setAttribute('aTarget', new BufferAttribute(target, 3))
    geo.setAttribute('aRand', new BufferAttribute(rand, 4))

    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uSize: { value: 2.2 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uScale: { value: 1 },
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

    if (opts.static) this.renderOnce()
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.host
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    const worldH = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z
    this.material.uniforms.uScale.value = Math.min(worldH, worldH * this.camera.aspect) * 0.14
    if (!this.running) this.renderOnce()
  }

  private tick = () => {
    if (!this.running) return
    const u = this.material.uniforms
    u.uTime.value = (performance.now() - this.start) / 1000
    this.progressNow += (this.progress - this.progressNow) * 0.07
    u.uProgress.value = this.progressNow
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.tick)
  }

  renderOnce() {
    this.material.uniforms.uProgress.value = this.progress
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
    this.points.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
