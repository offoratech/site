/* =========================================================
   MAVERICK — Video → Wall Break → Hero → Flip → Anatomy
   ========================================================= */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const body = document.body;
  const stage = $("#stage");
  const shoe = $("#shoe");
  const shoeFlip = $("#shoeFlip");
  const shoeTilt = $("#shoeTilt");
  const parts = $("#parts");
  const heroWord = $("#heroWord");
  const letters = $$("#heroWord span");
  const heroUi = $("#heroUi");
  const nav = $("#nav");

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ---------------------------------------------------------
     Geometry
     sneaker.png is 1672×940; the shoe sits roughly centred, with
     its visual centre at 43% of the image height.
     part_*.png share a 1006px-wide frame. Y values below are in
     that frame's units (assembled = stacked into a whole shoe).
     --------------------------------------------------------- */
  const SNEAKER_RATIO = 940 / 1672;
  const FRAME_W = 1006;
  const FRAME_H = 750;
  const ASSEMBLED = { 1: 0, 2: 330, 3: 380, 4: 420, 5: 360 };
  const EXPLODED = { 1: -230, 2: 300, 3: 520, 4: 730, 5: 940 };
  const ASSEMBLED_CY = 347; // visual centre of the assembled stack
  const EXPLODED_CY = 491; // visual centre of the exploded stack
  const EXPLODED_SPAN = 1362;
  const ASSEMBLED_CX = 492;

  let L = {};

  function layout() {
    const vw = window.innerWidth;
    const vh = stage.clientHeight || window.innerHeight;
    const mobile = vw < 900; // compact layout: stage left-of-centre, short tags
    const tablet = vw < 1100;

    // Hero sneaker
    const heroW = Math.min(vw * 1.7, vh * 1.55, 1700);
    const heroH = heroW * SNEAKER_RATIO;
    const heroCx = vw / 2;
    const heroShoeY = vh * (vw < 600 ? 0.5 : 0.53);
    const heroCy = heroShoeY + heroH * 0.07;

    // Exploded parts stage
    const gutter = Math.max(16, Math.min(48, vw * 0.032));
    const fitH = (vh * (mobile ? 0.62 : 0.8) * FRAME_W) / EXPLODED_SPAN;
    const partsW = mobile
      ? Math.min(vw * 0.58, fitH, 440)
      : Math.min(fitH, vw * (tablet ? 0.4 : 0.38), 660);
    const s = partsW / FRAME_W;
    const partsCx = mobile
      ? Math.min(vw * 0.38, vw - partsW / 2 - 150)
      : Math.min(Math.max(vw * 0.47, gutter + 380 + partsW / 2), vw - partsW / 2 - 330);
    const anchorY = vh * (mobile ? 0.6 : 0.53);
    const partsLeft = partsCx - partsW / 2;
    const partsTop = anchorY - ASSEMBLED_CY * s;

    // Sneaker end-state, sized/placed over the assembled stack
    const endW = partsW * 1.98;
    const endCx = partsLeft + ASSEMBLED_CX * s;
    const endCy = anchorY + endW * SNEAKER_RATIO * 0.06;

    L = {
      vw, vh, mobile, s,
      heroW, heroCx, heroCy,
      endScale: endW / heroW, endCx, endCy,
      partsW, partsLeft, partsTop,
      explodeShift: -(EXPLODED_CY - ASSEMBLED_CY) * s,
      hudCx: partsCx, hudCy: anchorY,
    };

    shoe.style.setProperty("--shoe-w", heroW + "px");
    parts.style.setProperty("--parts-w", partsW + "px");
  }
  layout();

  // Fake thickness: stacked, darkened copies behind the sneaker so it reads
  // as a solid object (not a paper cut-out) while it flips edge-on.
  const floatEl = $(".shoe__float");
  const mainImg = $(".shoe__img");
  // Both outer faces are full-brightness (the back face is what you see after
  // the 180° flip); the core slices between them are darkened.
  const DEPTH = 9, STEP = 1.6, HALF = ((DEPTH + 1) * STEP) / 2;
  for (let i = 0; i <= DEPTH; i++) {
    const d = mainImg.cloneNode();
    d.alt = "";
    d.className = "shoe__depth";
    d.style.transform = `translateZ(${-HALF + i * STEP}px)`;
    if (i > 0) d.style.filter = "brightness(0.3)";
    floatEl.insertBefore(d, mainImg);
  }
  mainImg.style.transform = `translateZ(${HALF}px)`;

  /* ---------------------------------------------------------
     Smoke (canvas, half-res, screen-blended)
     --------------------------------------------------------- */
  const smoke = (() => {
    const canvas = $("#smoke");
    const ctx = canvas.getContext("2d");
    const SCALE = 0.5;
    let w = 0, h = 0, puffs = [], running = true, raf;

    // one soft, lumpy puff texture
    const tex = document.createElement("canvas");
    tex.width = tex.height = 256;
    const t = tex.getContext("2d");
    for (let i = 0; i < 28; i++) {
      const x = 128 + (Math.random() - 0.5) * 110;
      const y = 128 + (Math.random() - 0.5) * 110;
      const r = 40 + Math.random() * 70;
      const g = t.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      t.fillStyle = g;
      t.beginPath();
      t.arc(x, y, r, 0, Math.PI * 2);
      t.fill();
    }

    function resize() {
      w = canvas.width = Math.ceil(stage.clientWidth * SCALE);
      h = canvas.height = Math.ceil(stage.clientHeight * SCALE);
      const count = w < 300 ? 16 : 26;
      puffs = Array.from({ length: count }, () => spawn(true));
    }
    function spawn(initial) {
      const size = (0.45 + Math.random() * 0.9) * Math.max(w, h) * 0.6;
      return {
        x: initial ? Math.random() * w : -size * 0.5,
        y: h * (0.35 + Math.random() * 0.75),
        size,
        vx: (0.05 + Math.random() * 0.18) * (w / 800),
        vy: -(0.01 + Math.random() * 0.05),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.0015,
        a: 0.06 + Math.random() * 0.14,
        tint: Math.random() < 0.25,
      };
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i];
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.x - p.size / 2 > w || p.y + p.size / 2 < 0) puffs[i] = spawn(false);
        ctx.save();
        ctx.globalAlpha = p.a;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(tex, -p.size / 2, -p.size / 2, p.size, p.size);
        if (p.tint) {
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = "rgba(51,245,154,0.12)";
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) raf = requestAnimationFrame(frame);
      else cancelAnimationFrame(raf);
    }
    resize();
    if (reduceMotion) { running = false; frame(); } else raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", () => !reduceMotion && setRunning(!document.hidden));
    return { resize, setRunning };
  })();

  /* ---------------------------------------------------------
     Initial hero state (before reveal)
     --------------------------------------------------------- */
  gsap.set(heroWord, { xPercent: -50, yPercent: -54 });
  gsap.set(shoe, { xPercent: -50, yPercent: -50, transformOrigin: "50% 50%" });
  gsap.set(parts, { transformOrigin: "50% 50%" });
  gsap.set("#anatHud", { x: () => L.hudCx, y: () => L.hudCy });

  /* ---------------------------------------------------------
     Scroll timeline: hero → flip → layer separation
     --------------------------------------------------------- */
  const layers = [1, 2, 3, 4, 5].map((n) => ({
    n,
    el: $(`.layer[data-layer="${n}"]`),
    tag: $(`.layer[data-layer="${n}"] .tag`),
    line: $(`.layer[data-layer="${n}"] .tag__line`),
    tagBody: $(`.layer[data-layer="${n}"] .tag__body`),
  }));

  const T = { flipEnd: 3, swap: 3.15, explodeStart: 3.7, step: 0.95, end: 10.5 };
  const releaseAt = (i) => T.explodeStart + i * T.step;

  const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });

  // A — hero exits, sneaker flips and travels into anatomy
  tl.fromTo(heroUi, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -50, duration: 0.8, ease: "power1.in" }, 0)
    .fromTo(letters, { yPercent: 0, autoAlpha: 1, rotationX: 0 }, {
      yPercent: -120, autoAlpha: 0, rotationX: 70,
      stagger: { each: 0.08, from: "center" }, duration: 1.1, ease: "power2.in",
    }, 0.1)
    .fromTo(heroWord, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.9 }, 0.45)
    .fromTo(".atmo__glow--hero", { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.4 }, 0.6)
    .fromTo(".atmo__glow--anat", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6 }, 1)
    .fromTo("#grid", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6 }, 1.2)
    .fromTo(".atmo__beam", { autoAlpha: 1 }, { autoAlpha: 0.45, duration: 1.4 }, 0.8)

    .fromTo(shoe,
      { x: () => L.heroCx, y: () => L.heroCy, scale: 1, rotation: 0 },
      {
        keyframes: {
          x: [() => L.heroCx, () => L.heroCx + (L.endCx - L.heroCx) * 0.35, () => L.endCx],
          y: [() => L.heroCy, () => L.heroCy + L.vh * 0.22, () => L.endCy],
          scale: [1, () => 0.85 + (L.endScale - 1) * 0.4, () => L.endScale],
          rotation: [0, -14, 13],
          easeEach: "sine.inOut",
        },
        duration: T.flipEnd - 0.2,
      }, 0.2)
    .fromTo(shoeFlip,
      { rotationY: 0, rotationX: 0 },
      {
        // linger near the faces, whip through the edge-on angle
        keyframes: {
          "0%": { rotationY: 0, rotationX: 0 },
          "38%": { rotationY: 38, rotationX: 14 },
          "62%": { rotationY: 142, rotationX: 14 },
          "100%": { rotationY: 180, rotationX: 0 },
          easeEach: "sine.inOut",
        },
        duration: T.flipEnd - 0.5,
      }, 0.35)

    .fromTo("#anatHead", { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 1.9)
    .fromTo("#anatHud", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 1.8)
    .fromTo("#anatProgress", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 2.4);

  // B — scan sweep + swap the sneaker for the assembled layer stack
  tl.fromTo(parts,
      { x: () => L.partsLeft, y: () => L.partsTop, autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.35 }, T.swap)
    .fromTo(shoe, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.35, immediateRender: false }, T.swap + 0.12)
    .fromTo("#scan",
      { top: "0%", autoAlpha: 0 },
      { keyframes: { top: ["0%", "45%", "92%"], autoAlpha: [0, 1, 0] }, duration: 0.7, ease: "power1.inOut" },
      T.swap - 0.25);

  // assembled positions (re-applied on resize)
  const setAssembled = () => layers.forEach(({ n, el }) => gsap.set(el, { y: ASSEMBLED[n] * L.s }));
  setAssembled();

  // C — separate layer by layer
  tl.fromTo(parts, { y: () => L.partsTop }, {
    y: () => L.partsTop + L.explodeShift,
    immediateRender: false,
    duration: T.step * 5,
    ease: "power1.inOut",
  }, T.explodeStart);

  layers.forEach(({ n, el, tag, line, tagBody }, i) => {
    const at = releaseAt(i);
    tl.to(el, {
      keyframes: {
        y: [() => ASSEMBLED[n] * L.s, () => EXPLODED[n] * L.s],
        rotationX: [0, n === 1 ? -14 : 14, 0],
        z: [0, 60, 0],
        easeEach: "power2.inOut",
      },
      duration: T.step * 1.25,
    }, at)
      .fromTo(el.querySelector("img"),
        { filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.55)) brightness(1)" },
        {
          keyframes: {
            filter: [
              "drop-shadow(0 18px 24px rgba(0,0,0,0.55)) brightness(1)",
              "drop-shadow(0 0 22px rgba(51,245,154,0.55)) brightness(1.25)",
              "drop-shadow(0 18px 24px rgba(0,0,0,0.55)) brightness(1)",
            ],
          },
          duration: T.step * 1.1,
        }, at)
      .fromTo(tag, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, at + T.step * 0.7)
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: T.step * 0.35, ease: "power2.out" }, at + T.step * 0.7)
      .fromTo(tagBody, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: T.step * 0.35, ease: "power2.out" }, at + T.step * 0.9);
  });

  tl.fromTo("#layerBar", { scaleX: 0 }, { scaleX: 1, duration: T.step * 5 + 0.4 }, T.explodeStart);

  // D — stats + hold
  const statEls = $$("#anatStats strong");
  const counters = statEls.map(() => ({ v: 0 }));
  tl.fromTo("#anatStats", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, releaseAt(4) + 0.6);
  statEls.forEach((el, i) => {
    const target = +el.dataset.count;
    tl.fromTo(counters[i], { v: 0 }, {
      v: target,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => { el.textContent = Math.round(counters[i].v); },
    }, releaseAt(4) + 0.7 + i * 0.1);
  });
  tl.to({}, { duration: 0.01 }, T.end);

  // Live layer counter
  const layerCount = $("#layerCount");
  let shownCount = -1;
  function syncCounter() {
    const time = tl.time();
    let c = 0;
    for (let i = 0; i < 5; i++) if (time >= releaseAt(i) + T.step * 0.6) c = i + 1;
    if (c !== shownCount) {
      shownCount = c;
      layerCount.textContent = String(c).padStart(2, "0");
    }
  }

  let scrollST;
  function initScroll() {
    scrollST = ScrollTrigger.create({
      trigger: "#scene",
      start: "top top",
      end: "bottom bottom",
      scrub: reduceMotion ? true : 1.1,
      animation: tl,
      onUpdate: syncCounter,
      onLeave: () => smoke.setRunning(false),
      onEnterBack: () => !reduceMotion && smoke.setRunning(true),
    });
    // keep the counter honest while scrub catches up
    gsap.ticker.add(syncCounter);
  }

  /* ---------------------------------------------------------
     Pointer parallax (hero sneaker + wordmark)
     --------------------------------------------------------- */
  if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
    const tiltY = gsap.quickTo(shoeTilt, "rotationY", { duration: 0.9, ease: "power3.out" });
    const tiltX = gsap.quickTo(shoeTilt, "rotationX", { duration: 0.9, ease: "power3.out" });
    const shiftX = gsap.quickTo(shoeTilt, "x", { duration: 1.1, ease: "power3.out" });
    const wordX = gsap.quickTo(heroWord, "x", { duration: 1.4, ease: "power3.out" });
    window.addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      tiltY(nx * 18);
      tiltX(-ny * 12);
      shiftX(nx * 18);
      wordX(-nx * 30);
    });
  }

  /* ---------------------------------------------------------
     Intro: video (≈2s) → wall break → sneaker reveal
     --------------------------------------------------------- */
  const intro = $("#intro");
  const video = $("#introVideo");
  const wall = $("#wall");
  const wallFrame = $("#wallFrame");
  const pieces = $$(".wall__piece");
  const flash = $("#flash");
  const VIDEO_CUT = 2.0;

  function fitWall() {
    const s = Math.max(window.innerWidth / 1920, window.innerHeight / 1082);
    gsap.set(wallFrame, { xPercent: -50, yPercent: -50, scale: s });
  }
  fitWall();

  // hero hidden until the wall opens
  gsap.set(shoe, { x: () => L.heroCx, y: () => L.heroCy });
  gsap.set(shoeFlip, { autoAlpha: 0, scale: 0.55, z: -400 });
  gsap.set(letters, { autoAlpha: 0, yPercent: 40 });
  gsap.set(heroUi, { autoAlpha: 0 });
  gsap.set(".atmo", { autoAlpha: 0 });

  let broken = false;

  function debrisBurst() {
    const canvas = $("#debris");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const bits = [];
    // shards along the diagonal crack zone
    for (let i = 0; i < 140; i++) {
      const t = Math.random();
      const ox = W * (0.25 + t * 0.5) + (Math.random() - 0.5) * W * 0.12;
      const oy = H * (1 - t) + (Math.random() - 0.5) * H * 0.1;
      const ang = Math.atan2(oy - H / 2, ox - W / 2) + (Math.random() - 0.5) * 1.6;
      const sp = 4 + Math.random() * 16;
      const spark = Math.random() < 0.35;
      bits.push({
        x: ox, y: oy,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 4,
        size: spark ? 1 + Math.random() * 2.2 : 3 + Math.random() * 12,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        life: 1, decay: 0.008 + Math.random() * 0.014,
        spark,
        shade: 40 + Math.random() * 60 | 0,
      });
    }
    function step() {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const b of bits) {
        if (b.life <= 0) continue;
        alive++;
        b.vy += b.spark ? 0.12 : 0.42;
        b.vx *= 0.985;
        b.x += b.vx; b.y += b.vy; b.rot += b.vr;
        b.life -= b.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(b.life, 0);
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        if (b.spark) {
          ctx.fillStyle = "#8dffc9";
          ctx.shadowColor = "#33f59a";
          ctx.shadowBlur = 10;
          ctx.fillRect(-b.size * 2, -b.size / 2, b.size * 4, b.size);
        } else {
          ctx.fillStyle = `rgb(${b.shade},${b.shade + 4},${b.shade + 8})`;
          ctx.beginPath();
          ctx.moveTo(-b.size / 2, -b.size / 3);
          ctx.lineTo(b.size / 2, -b.size / 2);
          ctx.lineTo(b.size / 4, b.size / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "rgba(51,245,154,0.5)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }
      if (alive) requestAnimationFrame(step);
      else ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(step);
  }

  function revealHero(tlIntro, at) {
    tlIntro
      .to(".atmo", { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, at - 0.3)
      .to(shoeFlip, { autoAlpha: 1, scale: 1, z: 0, duration: 1.8, ease: "expo.out" }, at)
      .to(letters, { autoAlpha: 1, yPercent: 0, duration: 1.2, stagger: 0.06, ease: "expo.out" }, at + 0.15)
      .to(nav, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, at + 0.7)
      .to(heroUi, { autoAlpha: 1, duration: 0.9, ease: "power2.out" }, at + 0.85)
      .fromTo(".hero__copy, .hero__specs, .hero__meta", { y: 24 }, { y: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, at + 0.85);
  }

  function finishIntro() {
    intro.classList.add("is-done");
    body.classList.remove("is-intro");
    video.pause();
    video.removeAttribute("src");
    video.load();
    initScroll();
    ScrollTrigger.refresh();
  }

  function breakWall() {
    if (broken) return;
    broken = true;
    fitWall();
    gsap.set(wall, { visibility: "visible" });
    intro.classList.add("is-breaking");

    const k = 1; // pieces move in 1920-frame pixels
    const t = gsap.timeline({ onComplete: finishIntro });

    // hide the video under the matching wall frame
    t.set(video, { autoAlpha: 0 }, 0.02)
      // charge-up: crack edges flare, wall trembles
      .to(pieces, {
        filter: "drop-shadow(0 0 18px rgba(51,245,154,0.9)) brightness(1.15)",
        duration: 0.22, ease: "power2.in",
      }, 0)
      .fromTo(wallFrame, { x: 0, y: 0 }, {
        keyframes: { x: [0, -6, 7, -5, 4, 0], y: [0, 4, -3, 5, -2, 0] },
        duration: 0.32, ease: "none",
      }, 0)
      .to(flash, { keyframes: { opacity: [0, 1, 0] }, duration: 0.55, ease: "power2.out" }, 0.28)
      .add(debrisBurst, 0.3)
      // break apart
      .to(pieces[0], { x: -1150 * k, y: -120, rotation: -24, rotationY: 38, z: 260, duration: 1.7, ease: "expo.out" }, 0.3)
      .to(pieces[1], { x: 120, y: 1250, rotation: 7, rotationX: 32, z: -220, duration: 1.7, ease: "expo.out" }, 0.3)
      .to(pieces[2], { x: 1200 * k, y: -180, rotation: 20, rotationY: -36, z: 300, duration: 1.7, ease: "expo.out" }, 0.3)
      .to(pieces, { autoAlpha: 0, duration: 0.7, ease: "power1.in" }, 1.05);

    revealHero(t, 0.42);
  }

  function skipToHero() {
    broken = true;
    gsap.set(video, { autoAlpha: 0 });
    const t = gsap.timeline({ onComplete: finishIntro });
    t.to(intro, { autoAlpha: 0, duration: 0.5 }, 0);
    revealHero(t, 0.2);
  }

  if (reduceMotion) {
    skipToHero();
  } else {
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      const p = video.play();
      if (p && p.catch) p.catch(breakWall);
    };
    video.addEventListener("timeupdate", () => { if (video.currentTime >= VIDEO_CUT) breakWall(); });
    video.addEventListener("ended", breakWall);
    video.addEventListener("error", breakWall);
    if (video.readyState >= 3) go();
    else video.addEventListener("canplay", go, { once: true });
    // never let a stalled video hold the page hostage
    setTimeout(() => { if (!started) breakWall(); }, 4000);
    setTimeout(breakWall, 7000);
  }

  $("#skipIntro").addEventListener("click", () => {
    if (broken) return;
    breakWall();
  });

  /* ---------------------------------------------------------
     Resize
     --------------------------------------------------------- */
  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      layout();
      smoke.resize();
      fitWall();
      gsap.set("#anatHud", { x: L.hudCx, y: L.hudCy });
      // re-evaluate the function-based positions without losing scroll progress
      if (scrollST) {
        const p = tl.progress();
        tl.progress(0);
        setAssembled();
        tl.invalidate().progress(p);
      } else {
        setAssembled();
        tl.invalidate();
        gsap.set(shoe, { x: L.heroCx, y: L.heroCy });
      }
      ScrollTrigger.refresh();
    }, 150);
  });

  // smooth in-page anchors
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (body.classList.contains("is-intro")) { e.preventDefault(); return; }
      e.preventDefault();
      const scene = $("#scene");
      const max = scene.offsetHeight - window.innerHeight;
      const y = id === "#anatomy" ? scene.offsetTop + max * (T.explodeStart / T.end) : 0;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
})();
