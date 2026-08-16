/* ==========================================================================
   particles.js · Cielo, partículas, lluvia y galaxia (todo en Canvas 2D)
   --------------------------------------------------------------------------
   Un único bucle de render (Loop) alimenta todos los canvas para no
   multiplicar requestAnimationFrame. Todo se pausa si la pestaña no está
   visible y las cantidades bajan solas en celulares.
   ========================================================================== */

/* ─── Bucle global ────────────────────────────────────────────────────── */
const Loop = {
  subs: [],
  last: 0,
  running: false,
  add(fn) { Loop.subs.push(fn); },
  start() {
    if (Loop.running) return;
    Loop.running = true;
    Loop.last = performance.now();
    requestAnimationFrame(Loop.frame);
  },
  frame(now) {
    if (!Loop.running) return;
    // dt normalizado a 60fps, con tope para evitar saltos al volver de segundo plano
    const dt = Math.min((now - Loop.last) / 16.666, 3);
    Loop.last = now;
    for (let i = 0; i < Loop.subs.length; i++) Loop.subs[i](dt, now);
    requestAnimationFrame(Loop.frame);
  },
  stop() { Loop.running = false; }
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) Loop.stop();
  else Loop.start();
});

/* ─── Utilidades de canvas ────────────────────────────────────────────── */
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, U.isMobile ? 1.5 : 2);
  // Usamos clientWidth/Height y no getBoundingClientRect: el rect incluye el
  // transform de las animaciones de entrada y mediría el canvas escalado.
  const r = cv.getBoundingClientRect();
  const w = Math.max(1, cv.clientWidth || Math.round(r.width));
  const h = Math.max(1, cv.clientHeight || Math.round(r.height));
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

/* Sprites pre-renderizados (mucho más rápido que dibujar paths por partícula) */
const Sprites = {
  cache: {},
  dot(color, size = 48) {
    const key = 'dot' + color + size;
    if (Sprites.cache[key]) return Sprites.cache[key];
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, color);
    g.addColorStop(0.35, color);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.globalAlpha = 1;
    x.fillStyle = g;
    x.fillRect(0, 0, size, size);
    return (Sprites.cache[key] = c);
  },
  heart(color, size = 40) {
    const key = 'h' + color + size;
    if (Sprites.cache[key]) return Sprites.cache[key];
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    const s = size;
    x.shadowColor = color;
    x.shadowBlur = size * 0.28;
    x.fillStyle = color;
    x.beginPath();
    x.moveTo(0.5 * s, 0.92 * s);
    x.bezierCurveTo(0.05 * s, 0.62 * s, 0.07 * s, 0.26 * s, 0.28 * s, 0.22 * s);
    x.bezierCurveTo(0.40 * s, 0.20 * s, 0.47 * s, 0.30 * s, 0.5 * s, 0.36 * s);
    x.bezierCurveTo(0.53 * s, 0.30 * s, 0.60 * s, 0.20 * s, 0.72 * s, 0.22 * s);
    x.bezierCurveTo(0.93 * s, 0.26 * s, 0.95 * s, 0.62 * s, 0.5 * s, 0.92 * s);
    x.closePath();
    x.fill();
    return (Sprites.cache[key] = c);
  },
  petal(color, size = 34) {
    const key = 'p' + color + size;
    if (Sprites.cache[key]) return Sprites.cache[key];
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    x.fillStyle = color;
    x.beginPath();
    x.ellipse(size / 2, size / 2, size * 0.42, size * 0.22, 0, 0, Math.PI * 2);
    x.fill();
    return (Sprites.cache[key] = c);
  },
  star4(color, size = 40) {
    const key = 's' + color + size;
    if (Sprites.cache[key]) return Sprites.cache[key];
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    const h = size / 2;
    x.fillStyle = color;
    x.shadowColor = color;
    x.shadowBlur = size * 0.3;
    x.beginPath();
    x.moveTo(h, 0);
    x.quadraticCurveTo(h * 1.12, h * 0.88, size, h);
    x.quadraticCurveTo(h * 1.12, h * 1.12, h, size);
    x.quadraticCurveTo(h * 0.88, h * 1.12, 0, h);
    x.quadraticCurveTo(h * 0.88, h * 0.88, h, 0);
    x.fill();
    return (Sprites.cache[key] = c);
  }
};


/* ==========================================================================
   SKY · fondo de estrellas con parallax, nebulosas y estrellas fugaces
   ========================================================================== */
const Sky = {
  cv: null, ctx: null, w: 0, h: 0,
  stars: [], shooting: [],
  mood: 'night',
  p: { alpha: 1, drift: 0.06, twinkle: 1, scale: 1 },      // valores actuales
  t: { alpha: 1, drift: 0.06, twinkle: 1, scale: 1 },      // valores objetivo
  shootChance: 0.0016,
  time: 0,

  init() {
    Sky.cv = $('#bg-canvas');
    Sky.ctx = Sky.cv.getContext('2d', { alpha: true });
    Sky.resize();
    Sky.build();
    Sky.buildBokeh();
    window.addEventListener('resize', Sky.resize, { passive: true });
    Loop.add(Sky.update);
    Loop.start();
  },

  resize() {
    const s = fitCanvas(Sky.cv);
    Sky.w = s.w; Sky.h = s.h;
  },

  build() {
    const n = U.isMobile ? CONFIG.perf.starsMobile : CONFIG.perf.starsDesktop;
    Sky.stars = [];
    for (let i = 0; i < n; i++) {
      const layer = i % 3;                       // 0 lejos · 2 cerca
      Sky.stars.push({
        x: Math.random(), y: Math.random(),
        r: U.rand(0.5, 1.5) + layer * 0.35,
        a: U.rand(0.35, 1),
        tw: U.rand(0.008, 0.03),
        ph: U.rand(0, Math.PI * 2),
        layer,
        hue: Math.random() < 0.14 ? 'gold' : (Math.random() < 0.2 ? 'pink' : 'white'),
        react: 0
      });
    }
  },

  /* Luces desenfocadas (bokeh) hechas con divs: barato y muy bonito */
  buildBokeh() {
    const box = $('#bokeh-layer');
    box.innerHTML = '';
    const n = U.isMobile ? CONFIG.perf.bokehMobile : CONFIG.perf.bokehDesktop;
    const colors = ['var(--pink)', 'var(--violet)', 'var(--rose)', 'var(--gold)'];
    for (let i = 0; i < n; i++) {
      const b = document.createElement('span');
      b.className = 'bokeh';
      const size = U.rand(60, 175);
      b.style.width = b.style.height = size + 'px';
      b.style.left = U.rand(-5, 100) + '%';
      b.style.top = U.rand(-5, 100) + '%';
      b.style.background = U.pick(colors);
      b.style.opacity = U.rand(0.04, 0.11);
      b.style.animationDuration = U.rand(16, 38) + 's';
      b.style.animationDelay = -U.rand(0, 20) + 's';
      b.dataset.depth = (0.4 + Math.random() * 1.6).toFixed(2);
      box.appendChild(b);
    }
  },

  /* Cambia el "clima" del fondo. Cada escena llama a esto. */
  setMood(mood) {
    Sky.mood = mood;
    document.body.dataset.mood = mood;
    const presets = {
      night:  { alpha: 1,    drift: 0.05, twinkle: 1,   scale: 1,    shoot: 0.0014 },
      dream:  { alpha: 0.8,  drift: 0.04, twinkle: 0.8, scale: 0.95, shoot: 0.0010 },
      wide:   { alpha: 1,    drift: 0.10, twinkle: 1.3, scale: 1.15, shoot: 0.0060 },
      deep:   { alpha: 0.6,  drift: 0.03, twinkle: 0.7, scale: 0.9,  shoot: 0.0008 },
      rain:   { alpha: 0.12, drift: 0.02, twinkle: 0.4, scale: 0.8,  shoot: 0 },
      warm:   { alpha: 0.55, drift: 0.05, twinkle: 0.9, scale: 1,    shoot: 0.0020 },
      dark:   { alpha: 0.18, drift: 0.02, twinkle: 0.5, scale: 0.9,  shoot: 0 },
      calm:   { alpha: 0.95, drift: 0.03, twinkle: 0.9, scale: 1.05, shoot: 0.0030 }
    };
    const p = presets[mood] || presets.night;
    Sky.t.alpha = p.alpha; Sky.t.drift = p.drift;
    Sky.t.twinkle = p.twinkle; Sky.t.scale = p.scale;
    Sky.shootChance = p.shoot;
  },

  shoot() {
    Sky.shooting.push({
      x: U.rand(0.1, 0.9) * Sky.w, y: U.rand(0, 0.4) * Sky.h,
      vx: U.rand(3.5, 7), vy: U.rand(1.6, 3.2),
      life: 1, len: U.rand(90, 200)
    });
  },

  update(dt) {
    const ctx = Sky.ctx;
    if (!ctx) return;
    Sky.time += dt;

    // suavizado de parámetros hacia el objetivo (transiciones de ambiente)
    for (const k in Sky.t) Sky.p[k] = U.lerp(Sky.p[k], Sky.t[k], 0.02 * dt);

    ctx.clearRect(0, 0, Sky.w, Sky.h);
    if (Sky.p.alpha < 0.02) return;

    const px = (typeof Pointer !== 'undefined' ? Pointer.nx : 0);
    const py = (typeof Pointer !== 'undefined' ? Pointer.ny : 0);
    const colors = { white: '#ffffff', pink: '#ffc9e4', gold: '#ffe6b0' };

    for (let i = 0; i < Sky.stars.length; i++) {
      const s = Sky.stars[i];
      // deriva lenta + parallax por capa
      s.x += (0.00008 * Sky.p.drift * (s.layer + 1)) * dt;
      if (s.x > 1.05) s.x = -0.05;
      const depth = (s.layer + 1) * 8;
      const x = s.x * Sky.w + px * depth;
      const y = s.y * Sky.h + py * depth * 0.6;

      s.ph += s.tw * Sky.p.twinkle * dt;
      let a = s.a * (0.55 + 0.45 * Math.sin(s.ph)) * Sky.p.alpha;

      // reacción al cursor: las estrellas cercanas se avivan
      if (s.react > 0) { a = Math.min(1, a + s.react); s.react -= 0.02 * dt; }

      const r = s.r * Sky.p.scale;
      ctx.globalAlpha = U.clamp(a, 0, 1);
      ctx.fillStyle = colors[s.hue];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // halo suave sólo en las más grandes (barato)
      if (r > 1.6) {
        ctx.globalAlpha = U.clamp(a * 0.25, 0, 1);
        ctx.beginPath();
        ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // estrellas fugaces
    if (Math.random() < Sky.shootChance * dt) Sky.shoot();
    for (let i = Sky.shooting.length - 1; i >= 0; i--) {
      const s = Sky.shooting[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= 0.006 * dt;
      if (s.life <= 0 || s.x > Sky.w + 200) { Sky.shooting.splice(i, 1); continue; }
      const g = ctx.createLinearGradient(s.x, s.y, s.x - s.len, s.y - s.len * 0.45);
      g.addColorStop(0, `rgba(255,255,255,${s.life})`);
      g.addColorStop(0.4, `rgba(255,201,228,${s.life * 0.5})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.len, s.y - s.len * 0.45);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  /* Las estrellas alrededor de un punto reaccionan (click, cursor) */
  excite(cx, cy, radius = 220, power = 0.6) {
    for (const s of Sky.stars) {
      const x = s.x * Sky.w, y = s.y * Sky.h;
      const d = Math.hypot(x - cx, y - cy);
      if (d < radius) s.react = Math.max(s.react, power * (1 - d / radius));
    }
  },

  /* Empuje radial de todas las estrellas (se usa al entrar) */
  burst() {
    for (const s of Sky.stars) s.react = U.rand(0.3, 1);
  }
};


/* ==========================================================================
   FX · partículas de primer plano (corazones, estela, pétalos, confeti…)
   ========================================================================== */
const FX = {
  cv: null, ctx: null, w: 0, h: 0,
  parts: [],
  mode: 'default',
  ambient: 0,        // cantidad de partículas ambientales por frame
  ambientKind: 'dust',

  init() {
    FX.cv = $('#fx-canvas');
    FX.ctx = FX.cv.getContext('2d');
    FX.resize();
    window.addEventListener('resize', FX.resize, { passive: true });
    Loop.add(FX.update);
  },

  resize() {
    const s = fitCanvas(FX.cv);
    FX.w = s.w; FX.h = s.h;
  },

  setMode(mode) {
    FX.mode = mode;
    const presets = {
      default: { ambient: 0.18, kind: 'dust' },
      dream:   { ambient: 0.30, kind: 'dust' },
      space:   { ambient: 0.22, kind: 'spark' },
      rain:    { ambient: 0, kind: 'dust' },
      warm:    { ambient: 0.75, kind: 'warm' },
      hug:     { ambient: 0.45, kind: 'warm' },
      calm:    { ambient: 0.20, kind: 'dust' }
    };
    const p = presets[mode] || presets.default;
    FX.ambient = A.reduced ? p.ambient * 0.3 : p.ambient * (U.isMobile ? 0.6 : 1);
    FX.ambientKind = p.kind;
  },

  add(p) {
    if (FX.parts.length > CONFIG.perf.maxParticles) FX.parts.shift();
    FX.parts.push(p);
  },

  /* ── emisores ─────────────────────────────────────────────────────── */
  hearts(x, y, n = 6, opts = {}) {
    const colors = opts.colors || ['#ff9ecb', '#ffd7e8', '#f5d491'];
    for (let i = 0; i < n; i++) {
      FX.add({
        kind: 'heart', x, y,
        vx: U.rand(-1.5, 1.5) * (opts.spread || 1),
        vy: U.rand(-3.4, -1.2) * (opts.up || 1),
        g: 0.028, life: 1, decay: U.rand(0.006, 0.011),
        size: U.rand(10, 22) * (opts.scale || 1),
        rot: U.rand(-0.4, 0.4), vr: U.rand(-0.03, 0.03),
        color: U.pick(colors)
      });
    }
  },

  sparks(x, y, n = 12, opts = {}) {
    const colors = opts.colors || ['#ffffff', '#ffd7e8', '#c9a6ff', '#f5d491'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = U.rand(0.6, 4.2) * (opts.power || 1);
      FX.add({
        kind: 'spark', x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        g: opts.g ?? 0.01, life: 1, decay: U.rand(0.01, 0.026),
        size: U.rand(3, 10), color: U.pick(colors), rot: 0, vr: 0
      });
    }
  },

  trail(x, y) {
    FX.add({
      kind: 'spark', x: x + U.rand(-3, 3), y: y + U.rand(-3, 3),
      vx: U.rand(-0.25, 0.25), vy: U.rand(-0.35, 0.05),
      g: 0, life: 0.8, decay: U.rand(0.03, 0.055),
      size: U.rand(3, 8), color: Math.random() < 0.25 ? '#f5d491' : '#e9d5ff', rot: 0, vr: 0
    });
  },

  petals(n = 10) {
    for (let i = 0; i < n; i++) {
      FX.add({
        kind: 'petal', x: U.rand(0, FX.w), y: U.rand(-80, -10),
        vx: U.rand(-0.4, 0.4), vy: U.rand(0.5, 1.4),
        g: 0, life: 1, decay: 0.0022,
        size: U.rand(10, 20), rot: U.rand(0, 6.28), vr: U.rand(-0.02, 0.02),
        sway: U.rand(0.01, 0.03), phase: U.rand(0, 6.28),
        color: U.pick(['#ff9ecb', '#ffd7e8', '#ffb27a'])
      });
    }
  },

  confetti(x, y, n = 60) {
    for (let i = 0; i < n; i++) {
      const a = U.rand(-Math.PI * 0.85, -Math.PI * 0.15);
      const sp = U.rand(3, 11);
      FX.add({
        kind: 'confetti', x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        g: 0.10, life: 1, decay: U.rand(0.004, 0.008),
        size: U.rand(4, 9), rot: U.rand(0, 6.28), vr: U.rand(-0.2, 0.2),
        color: U.pick(['#ff9ecb', '#f5d491', '#c9a6ff', '#ffffff', '#ffd7e8'])
      });
    }
  },

  dust(x, y, n = 8) {
    for (let i = 0; i < n; i++) {
      FX.add({
        kind: 'spark', x: x + U.rand(-14, 14), y: y + U.rand(-6, 6),
        vx: U.rand(-0.6, 0.6), vy: U.rand(-1.1, -0.2),
        g: 0.004, life: 1, decay: U.rand(0.012, 0.03),
        size: U.rand(3, 9), color: U.pick(['#ffd7e8', '#f5d491', '#ffffff']), rot: 0, vr: 0
      });
    }
  },

  /* ── ambiente automático ──────────────────────────────────────────── */
  spawnAmbient() {
    if (Math.random() > FX.ambient) return;
    if (FX.ambientKind === 'warm') {
      if (Math.random() < 0.35) {
        FX.add({
          kind: 'heart', x: U.rand(0, FX.w), y: FX.h + 20,
          vx: U.rand(-0.3, 0.3), vy: U.rand(-1.5, -0.6), g: 0,
          life: 1, decay: 0.0045, size: U.rand(8, 16),
          rot: U.rand(-0.3, 0.3), vr: U.rand(-0.01, 0.01),
          color: U.pick(['#ff9ecb', '#ffd7e8', '#f5d491'])
        });
      } else {
        FX.petals(1);
      }
    } else {
      FX.add({
        kind: 'spark', x: U.rand(0, FX.w), y: FX.h + 10,
        vx: U.rand(-0.25, 0.25), vy: U.rand(-0.9, -0.25), g: 0,
        life: 1, decay: 0.0035, size: U.rand(2, 7),
        color: FX.ambientKind === 'spark' ? '#c9a6ff' : '#ffffff', rot: 0, vr: 0
      });
    }
  },

  update(dt) {
    const ctx = FX.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, FX.w, FX.h);
    FX.spawnAmbient();

    for (let i = FX.parts.length - 1; i >= 0; i--) {
      const p = FX.parts[i];
      p.vy += p.g * dt;
      if (p.sway) { p.phase += p.sway * dt; p.x += Math.sin(p.phase) * 0.9 * dt; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= p.decay * dt;

      if (p.life <= 0 || p.y > FX.h + 80 || p.y < -140 || p.x < -140 || p.x > FX.w + 140) {
        FX.parts.splice(i, 1);
        continue;
      }

      const alpha = U.clamp(p.life, 0, 1);
      ctx.globalAlpha = alpha;

      if (p.kind === 'heart') {
        const sp = Sprites.heart(p.color, 40);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(sp, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.kind === 'petal') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(p.phase || 0)));
        const sp = Sprites.petal(p.color, 34);
        ctx.drawImage(sp, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.kind === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      } else {
        const sp = Sprites.dot(p.color, 48);
        const s = p.size * 2.6;
        ctx.drawImage(sp, p.x - s / 2, p.y - s / 2, s, s);
      }
    }
    ctx.globalAlpha = 1;
  },

  clear() { FX.parts.length = 0; }
};


/* ==========================================================================
   RAIN · lluvia + gotas en el vidrio (escena 8)
   ========================================================================== */
const Rain = {
  cv: null, ctx: null, w: 0, h: 0,
  drops: [], glass: [],
  active: false,
  intensity: 0,

  init() {
    Rain.cv = $('#rain-canvas');
    if (!Rain.cv) return;
    Rain.ctx = Rain.cv.getContext('2d');
    window.addEventListener('resize', () => { if (Rain.active) Rain.resize(); }, { passive: true });
    Loop.add(Rain.update);
  },

  resize() {
    const s = fitCanvas(Rain.cv);
    Rain.w = s.w; Rain.h = s.h;
  },

  start() {
    Rain.resize();
    Rain.active = true;
    Rain.drops = [];
    Rain.glass = [];
    const n = U.isMobile ? 70 : 130;
    for (let i = 0; i < n; i++) {
      Rain.drops.push({
        x: U.rand(0, Rain.w), y: U.rand(0, Rain.h),
        len: U.rand(9, 26), sp: U.rand(6, 15), a: U.rand(0.12, 0.4)
      });
    }
    const g = U.isMobile ? 22 : 40;
    for (let i = 0; i < g; i++) Rain.glass.push(Rain.newGlassDrop());
    Rain.intensity = 0;
    A.tween({ from: 0, to: 1, duration: 2600, onUpdate: v => Rain.intensity = v });
  },

  newGlassDrop() {
    return {
      x: U.rand(0, Rain.w || 300), y: U.rand(0, Rain.h || 300),
      r: U.rand(2, 7), sp: 0, wait: U.rand(0, 400), trail: []
    };
  },

  /* Hace desaparecer la lluvia de a poco */
  fade() {
    return A.tween({
      from: Rain.intensity, to: 0, duration: 3200, ease: Ease.inOutSine,
      onUpdate: v => Rain.intensity = v,
      onComplete: () => { Rain.active = false; }
    });
  },

  stop() { Rain.active = false; Rain.intensity = 0; },

  update(dt) {
    if (!Rain.active || !Rain.ctx) return;
    const ctx = Rain.ctx;
    ctx.clearRect(0, 0, Rain.w, Rain.h);
    const I = Rain.intensity;
    if (I <= 0.001) return;

    // lluvia de fondo
    ctx.lineCap = 'round';
    for (const d of Rain.drops) {
      d.y += d.sp * dt;
      d.x += 0.6 * dt;
      if (d.y > Rain.h) { d.y = -20; d.x = U.rand(0, Rain.w); }
      ctx.strokeStyle = `rgba(200,220,255,${d.a * I})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1.6, d.y + d.len);
      ctx.stroke();
    }

    // gotas resbalando por el vidrio
    for (const g of Rain.glass) {
      if (g.wait > 0) { g.wait -= dt; }
      else {
        g.sp += 0.02 * dt * (g.r / 4);
        g.y += g.sp * dt;
        g.trail.push({ x: g.x, y: g.y, r: g.r * 0.35 });
        if (g.trail.length > 16) g.trail.shift();
        if (g.y > Rain.h + 10) {
          const n = Rain.newGlassDrop();
          Object.assign(g, n);
        }
      }
      for (const t of g.trail) {
        ctx.fillStyle = `rgba(220,235,255,${0.10 * I})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
      }
      const grad = ctx.createRadialGradient(g.x - g.r * .3, g.y - g.r * .3, 0, g.x, g.y, g.r);
      grad.addColorStop(0, `rgba(255,255,255,${0.5 * I})`);
      grad.addColorStop(1, `rgba(180,205,255,${0.12 * I})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};


/* ==========================================================================
   GALAXY · galaxia interactiva con estrellas especiales (escena 6)
   ========================================================================== */
const Galaxy = {
  cv: null, ctx: null, w: 0, h: 0,
  stars: [], specials: [],
  cam: { x: 0, y: 0, z: 1 },
  active: false,
  found: new Set(),
  time: 0,
  hover: -1,

  init() {
    Galaxy.cv = $('#galaxy-canvas');
    if (!Galaxy.cv) return;
    Galaxy.ctx = Galaxy.cv.getContext('2d');
    window.addEventListener('resize', () => { if (Galaxy.active) { Galaxy.resize(); Galaxy.build(); } }, { passive: true });
    Galaxy.cv.addEventListener('click', Galaxy.onClick);
    Galaxy.cv.addEventListener('pointermove', Galaxy.onMove, { passive: true });
    Loop.add(Galaxy.update);
  },

  resize() {
    const s = fitCanvas(Galaxy.cv);
    Galaxy.w = s.w; Galaxy.h = s.h;
  },

  /* Las posiciones se guardan una sola vez como "semillas" relativas.
     Así, si se gira el celular o cambia el tamaño, la galaxia se redibuja
     igual y las estrellas especiales no cambian de lugar. */
  seed() {
    const n = U.isMobile ? 180 : 320;
    Galaxy._stars = [];
    for (let i = 0; i < n; i++) {
      const t = Math.random();                       // distancia al centro
      const arm = Math.floor(Math.random() * 2) * Math.PI;
      Galaxy._stars.push({
        t, ang: t * 4.2 + arm + U.rand(-0.35, 0.35),
        jx: U.rand(-0.02, 0.02), jy: U.rand(-0.02, 0.02),
        r: U.rand(0.6, 1.9), a: U.rand(0.25, 0.9),
        ph: U.rand(0, 6.28), tw: U.rand(0.01, 0.04),
        depth: U.rand(0.3, 1)
      });
    }
    Galaxy._specials = CONFIG.specialDates.map((d, i) => ({
      data: d, i,
      ang: (i / CONFIG.specialDates.length) * Math.PI * 2 + 0.6,
      t: U.rand(0.55, 0.86),
      ph: U.rand(0, 6.28)
    }));
  },

  build() {
    if (!Galaxy._stars) Galaxy.seed();
    const cx = Galaxy.w / 2, cy = Galaxy.h / 2;
    // el radio se calcula por eje para que la espiral llene el recuadro
    // sin salirse, tanto en pantalla ancha como en celular
    Galaxy.stars = Galaxy._stars.map(s => ({
      x: cx + Math.cos(s.ang) * (s.t * 0.52 + s.jx) * Galaxy.w,
      y: cy + Math.sin(s.ang) * (s.t * 0.52 + s.jy) * Galaxy.h,
      r: s.r, a: s.a, ph: s.ph, tw: s.tw, depth: s.depth
    }));
    Galaxy.specials = Galaxy._specials.map(s => ({
      data: s.data, i: s.i, ph: s.ph,
      x: cx + Math.cos(s.ang) * Galaxy.w * 0.42 * s.t,
      y: cy + Math.sin(s.ang) * Galaxy.h * 0.40 * s.t
    }));
  },

  start() {
    Galaxy.resize();
    Galaxy.build();
    Galaxy.active = true;
    Galaxy.cam = { x: 0, y: 0, z: 1 };
  },

  stop() { Galaxy.active = false; },

  reset() { Galaxy.found.clear(); const f = $('#galaxy-found'); if (f) f.textContent = '0'; },

  pos(e) {
    const r = Galaxy.cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  },

  hit(px, py) {
    const R = U.isTouch ? 44 : 30;
    for (const s of Galaxy.specials) {
      const sx = (s.x - Galaxy.w / 2) * Galaxy.cam.z + Galaxy.w / 2 + Galaxy.cam.x;
      const sy = (s.y - Galaxy.h / 2) * Galaxy.cam.z + Galaxy.h / 2 + Galaxy.cam.y;
      if (Math.hypot(sx - px, sy - py) < R) return s;
    }
    return null;
  },

  onMove(e) {
    if (!Galaxy.active) return;
    const p = Galaxy.pos(e);
    const s = Galaxy.hit(p.x, p.y);
    Galaxy.cv.style.cursor = s ? 'pointer' : 'default';
  },

  async onClick(e) {
    if (!Galaxy.active || Overlay.open) return;
    const p = Galaxy.pos(e);
    const s = Galaxy.hit(p.x, p.y);
    if (!s) {                                   // click al vacío: chispitas
      FX.sparks(e.clientX, e.clientY, 5, { power: 0.6 });
      return;
    }
    Audio.sfx('star');
    FX.sparks(e.clientX, e.clientY, 22, { power: 1.4 });

    // acercar la cámara a la estrella
    const tx = -(s.x - Galaxy.w / 2) * 1.7;
    const ty = -(s.y - Galaxy.h / 2) * 1.7;
    await A.tween({
      from: 0, to: 1, duration: 900, ease: Ease.inOutCubic,
      onUpdate: v => {
        Galaxy.cam.z = U.lerp(1, 1.7, v);
        Galaxy.cam.x = U.lerp(0, tx, v);
        Galaxy.cam.y = U.lerp(0, ty, v);
      }
    });

    const first = !Galaxy.found.has(s.i);
    Galaxy.found.add(s.i);
    $('#galaxy-found').textContent = Galaxy.found.size;

    Overlay.show(`
      <div class="star-card">
        <span class="star-card-ico">✧</span>
        <p class="star-date">${s.data.date}</p>
        <h3 class="star-title">${s.data.title}</h3>
        <p class="star-text">${s.data.text}</p>
      </div>`, 'is-star');

    const back = () => A.tween({
      from: 1, to: 0, duration: 800, ease: Ease.inOutCubic,
      onUpdate: v => {
        Galaxy.cam.z = U.lerp(1, 1.7, v);
        Galaxy.cam.x = U.lerp(0, tx, v);
        Galaxy.cam.y = U.lerp(0, ty, v);
      }
    });

    const onClose = () => { back(); document.removeEventListener('overlay:closed', onClose); };
    document.addEventListener('overlay:closed', onClose);

    if (first && Galaxy.found.size === CONFIG.specialDates.length) {
      setTimeout(() => Scenes.galaxyComplete(), 900);
    }
  },

  update(dt) {
    if (!Galaxy.active || !Galaxy.ctx) return;
    const ctx = Galaxy.ctx;
    Galaxy.time += dt;
    ctx.clearRect(0, 0, Galaxy.w, Galaxy.h);
    const cz = Galaxy.cam.z, cx = Galaxy.cam.x, cy = Galaxy.cam.y;

    // núcleo brillante de la galaxia
    const gx = (0) * cz + Galaxy.w / 2 + cx;
    const gy = (0) * cz + Galaxy.h / 2 + cy;
    const core = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.min(Galaxy.w, Galaxy.h) * 0.42 * cz);
    core.addColorStop(0, 'rgba(201,166,255,0.20)');
    core.addColorStop(0.45, 'rgba(139,92,246,0.08)');
    core.addColorStop(1, 'rgba(6,10,31,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, Galaxy.w, Galaxy.h);

    // estrellas comunes
    for (const s of Galaxy.stars) {
      const x = (s.x - Galaxy.w / 2) * cz + Galaxy.w / 2 + cx * s.depth;
      const y = (s.y - Galaxy.h / 2) * cz + Galaxy.h / 2 + cy * s.depth;
      if (x < -20 || x > Galaxy.w + 20 || y < -20 || y > Galaxy.h + 20) continue;
      s.ph += s.tw * dt;
      ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(s.ph));
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, s.r * cz, 0, Math.PI * 2);
      ctx.fill();
    }

    // estrellas especiales
    for (const s of Galaxy.specials) {
      const x = (s.x - Galaxy.w / 2) * cz + Galaxy.w / 2 + cx;
      const y = (s.y - Galaxy.h / 2) * cz + Galaxy.h / 2 + cy;
      s.ph += 0.035 * dt;
      const pulse = 0.65 + 0.35 * Math.sin(s.ph);
      const isFound = Galaxy.found.has(s.i);
      const color = isFound ? '#f5d491' : '#ffd7e8';
      const size = (isFound ? 20 : 16 + pulse * 8) * cz;

      ctx.globalAlpha = 1;
      const sp = Sprites.star4(color, 64);
      ctx.drawImage(sp, x - size / 2, y - size / 2, size, size);

      // anillo suave para invitar al click
      if (!isFound) {
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(s.ph * 0.8);
        ctx.strokeStyle = '#ffd7e8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, (16 + pulse * 10) * cz, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
};
