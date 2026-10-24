import { BufferAttribute, BufferGeometry, Camera, Color, NormalBlending, Points, Scene, ShaderMaterial, WebGLRenderer } from 'three'

/**
 * The page-wide particle journey: the hero's own OFFORA particles, carried
 * on down the page and reassembled into each section's shape in turn.
 *
 * Drawn straight in screen pixels (no camera) on a fixed full-viewport
 * canvas, so every shape can be pinned to a DOM anchor's rect. Only two
 * shapes are ever live at once - the one being left (`aFrom`) and the one
 * being formed (`aTo`) - swapped on the CPU when the journey crosses into
 * the next segment. Each hand-off reuses the hero's language: a staggered
 * per-particle collapse, a scatter that peaks mid-way, then reassembly.
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uT;
  uniform vec2 uViewport;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uBreath;
  uniform float uK0;
  uniform vec2 uFromC;
  uniform vec2 uToC;
  uniform float uFromK;
  uniform float uToK;
  uniform float uFromD;
  uniform float uToD;

  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aRand; // the hero's seeds - x: size, y: delay, z: phase, w: team

  varying float vAccent;
  varying float vAlpha;

  void main() {
    float delay = fract(aRand.y + aRand.z) * 0.45;
    float t = smoothstep(delay, delay + 0.55, uT);
    t = t * t * (3.0 - 2.0 * t);

    // Shape units -> screen px around each anchor (y flipped: shapes are y-up).
    vec2 from = uFromC + vec2(aFrom.x, -aFrom.y) * uFromK;
    vec2 to = uToC + vec2(aTo.x, -aTo.y) * uToK;
    vec2 pos = mix(from, to, t);

    // Break apart, drift, reassemble.
    float collapse = sin(t * 3.14159);
    vec2 dir = vec2(aRand.y - 0.5, aRand.x - 0.5);
    pos += dir * collapse * (1.3 * mix(uFromK, uToK, t) + 0.22 * uViewport.y);
    pos += collapse * 0.035 * uViewport.y * vec2(sin(aRand.z * 6.2831 + uTime * 1.3), cos(fract(aRand.z * 7.31) * 6.2831 + uTime * 1.1));

    // Same idle breathing as the hero, scaled with the shape - a fixed
    // hero-sized wobble would smear the much smaller section shapes.
    pos += uBreath * (mix(uFromK, uToK, t) / uK0) * vec2(sin(uTime * 0.9 + aRand.z * 40.0), -cos(uTime * 0.7 + aRand.z * 31.0));

    // Small shapes would turn into a solid blob with every particle, so each
    // shape keeps only a share (uFromD/uToD) - the rest fade out in transit.
    float pick = fract(aRand.z * 13.37 + aRand.y * 3.1);
    float vis = mix(step(pick, uFromD), step(pick, uToD), t);

    gl_Position = vec4(pos.x / uViewport.x * 2.0 - 1.0, 1.0 - pos.y / uViewport.y * 2.0, 0.0, 1.0);
    // Matches the hero's formed-state point size (camera at z=14, 12/14).
    gl_PointSize = vis > 0.001 ? uSize * (0.55 + aRand.x) * uPixelRatio * (12.0 / 14.0) : 0.0;

    vAccent = step(0.64, fract(aRand.z * 7.13));
    vAlpha = (0.5 + 0.5 * aRand.x) * vis;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uText;
  uniform vec3 uAccent;
  varying float vAccent;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float edge = 1.0 - smoothstep(0.32, 0.5, r);
    gl_FragColor = vec4(mix(uText, uAccent, vAccent), edge * vAlpha);
  }
`

export type StopFrame = { x: number; y: number; k: number; d: number }

export class JourneyField {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new Camera()
  private material: ShaderMaterial
  private geo = new BufferGeometry()
  private aFrom: BufferAttribute
  private aTo: BufferAttribute
  private shapes: Float32Array[]
  private pair = ''
  private size = { w: 0, h: 0 }
  private start: number

  constructor(host: HTMLElement, opts: { rand: Float32Array; start: number; shapes: Float32Array[] }) {
    this.shapes = opts.shapes
    this.start = opts.start
    this.renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.setClearColor(0x000000, 0)
    host.appendChild(this.renderer.domElement)

    this.aFrom = new BufferAttribute(opts.shapes[0].slice(), 3)
    this.aTo = new BufferAttribute(opts.shapes[0].slice(), 3)
    this.geo.setAttribute('position', new BufferAttribute(opts.shapes[0], 3))
    this.geo.setAttribute('aFrom', this.aFrom)
    this.geo.setAttribute('aTo', this.aTo)
    this.geo.setAttribute('aRand', new BufferAttribute(opts.rand, 4))

    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uT: { value: 0 },
        uViewport: { value: [1, 1] },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uSize: { value: 2.4 },
        uBreath: { value: 0 },
        uK0: { value: 1 },
        uFromC: { value: [0, 0] },
        uToC: { value: [0, 0] },
        uFromK: { value: 1 },
        uToK: { value: 1 },
        uFromD: { value: 1 },
        uToD: { value: 1 },
        uText: { value: new Color('#e9e7df') },
        uAccent: { value: new Color('#7ed957') },
      },
    })
    const points = new Points(this.geo, this.material)
    points.frustumCulled = false
    this.scene.add(points)
  }

  /** Draws one frame: shape `from` → shape `to` at hand-off progress `t` (0..1). */
  render(from: number, to: number, t: number, a: StopFrame, b: StopFrame, breath: number, heroK: number) {
    const w = window.innerWidth
    const h = window.innerHeight
    if (w !== this.size.w || h !== this.size.h) {
      this.size = { w, h }
      this.renderer.setSize(w, h, false)
    }
    const key = `${from}>${to}`
    if (key !== this.pair) {
      this.pair = key
      ;(this.aFrom.array as Float32Array).set(this.shapes[from])
      ;(this.aTo.array as Float32Array).set(this.shapes[to])
      this.aFrom.needsUpdate = true
      this.aTo.needsUpdate = true
    }
    const u = this.material.uniforms
    u.uTime.value = (performance.now() - this.start) / 1000
    u.uT.value = t
    u.uViewport.value = [w, h]
    u.uBreath.value = breath
    u.uK0.value = heroK
    u.uFromC.value = [a.x, a.y]
    u.uToC.value = [b.x, b.y]
    u.uFromK.value = a.k
    u.uToK.value = b.k
    u.uFromD.value = a.d
    u.uToD.value = b.d
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.geo.dispose()
    this.material.dispose()
    this.renderer.dispose()
    // Release the GL context now rather than whenever GC gets to it - live
    // contexts are capped per tab, and the oldest is killed past the cap.
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
  }
}
