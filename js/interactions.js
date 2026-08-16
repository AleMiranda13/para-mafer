/* ==========================================================================
   interactions.js · Puntero, parallax, micro-interacciones y el personaje
   ========================================================================== */

/* ─── Estado global del puntero (lo usan el cielo y el personaje) ──────── */
const Pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  nx: 0,          // -1 … 1 (horizontal)
  ny: 0,          // -1 … 1 (vertical)
  active: false,
  lastTrail: 0
};


/* ==========================================================================
   PERSONAJE · idle, parpadeo, mirada y reacciones
   ========================================================================== */
const Character = {
  instances: [],

  /* Inserta el personaje en un contenedor con data-char-slot="nombre" */
  mount(slot) {
    const host = $(`.char-stage[data-char-slot="${slot}"]`);
    if (!host) return null;
    if (host.dataset.mounted === '1') {
      return Character.instances.find(i => i.slot === slot);
    }
    const svg = $('#tpl-character').content.cloneNode(true).querySelector('svg');
    host.appendChild(svg);
    host.dataset.mounted = '1';

    const inst = {
      slot, host, svg,
      head: $('.char-head', svg),
      eyes: $('.char-eyes', svg),
      body: $('.char-body-group', svg),
      mouth: $('.char-mouth', svg),
      armL: $('.char-arm-l', svg),
      armR: $('.char-arm-r', svg),
      look: { x: 0, y: 0, tx: 0, ty: 0 },
      blinkAt: performance.now() + U.rand(1200, 3800),
      awake: true
    };
    Character.instances.push(inst);

    // reacción al tocar/click sobre el personaje
    svg.style.cursor = 'pointer';
    svg.addEventListener('pointerdown', e => {
      e.stopPropagation();
      Character.poke(inst, e.clientX, e.clientY);
    });

    return inst;
  },

  poke(inst, x, y) {
    Audio.sfx('click');
    A.anim(inst.svg, [
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-16px) scale(1.06)' },
      { transform: 'translateY(0) scale(1)' }
    ], { duration: 700, easing: EASE.back, fill: 'none' });
    A.anim(inst.mouth, [
      { d: 'path("M100 126 q10 9 20 0")' },
      { d: 'path("M100 124 q10 14 20 0")' },
      { d: 'path("M100 126 q10 9 20 0")' }
    ], { duration: 700 });
    const r = inst.svg.getBoundingClientRect();
    FX.hearts(x || (r.left + r.width / 2), y || (r.top + r.height / 3), 5, { scale: 0.9 });
    inst.host.classList.add('is-happy');
    setTimeout(() => inst.host.classList.remove('is-happy'), 900);
  },

  /* Abre los brazos hacia la cámara (abrazo) */
  openArms(inst, open = true) {
    if (!inst) return;
    inst.host.classList.toggle('is-hugging', open);
  },

  update(dt, now) {
    for (const inst of Character.instances) {
      if (!inst.host.offsetParent) continue;          // no está visible: no gastamos frames

      // ── mirada hacia el cursor / dedo ──────────────────────────────
      const r = inst.svg.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.38;
      const dx = U.clamp((Pointer.x - cx) / (r.width * 0.9 || 1), -1, 1);
      const dy = U.clamp((Pointer.y - cy) / (r.height * 0.9 || 1), -1, 1);
      inst.look.tx = dx; inst.look.ty = dy;
      inst.look.x = U.lerp(inst.look.x, inst.look.tx, 0.06 * dt);
      inst.look.y = U.lerp(inst.look.y, inst.look.ty, 0.06 * dt);

      const bob = Math.sin(now / 1400) * 1.6;
      inst.head.style.transform =
        `translate(${inst.look.x * 7}px, ${inst.look.y * 4 + bob}px) rotate(${inst.look.x * 3.2}deg)`;
      inst.eyes.style.transform =
        `translate(${inst.look.x * 3.4}px, ${inst.look.y * 2.6}px)`;

      // ── parpadeo natural ───────────────────────────────────────────
      if (now > inst.blinkAt) {
        inst.blinkAt = now + U.rand(2200, 5200);
        A.anim(inst.eyes, [
          { transform: inst.eyes.style.transform + ' scaleY(1)' },
          { transform: inst.eyes.style.transform + ' scaleY(0.08)', offset: 0.45 },
          { transform: inst.eyes.style.transform + ' scaleY(1)' }
        ], { duration: 190, easing: 'ease-in-out', fill: 'none' });
      }
    }
  }
};


/* ==========================================================================
   INTERACTIONS · todo lo que responde al usuario
   ========================================================================== */
const Interactions = {
  lastExcite: 0,

  init() {
    Interactions.bindPointer();
    Interactions.bindClicks();
    Interactions.bindActions();
    Loop.add(Interactions.update);
    Loop.add(Character.update);
  },

  /* ── puntero / touch ─────────────────────────────────────────────── */
  bindPointer() {
    const onMove = (x, y) => {
      Pointer.x = x; Pointer.y = y;
      Pointer.nx = (x / window.innerWidth - 0.5) * 2;
      Pointer.ny = (y / window.innerHeight - 0.5) * 2;
      Pointer.active = true;

      // estela luminosa (limitada para no saturar)
      const now = performance.now();
      if (!A.reduced && now - Pointer.lastTrail > 26) {
        Pointer.lastTrail = now;
        FX.trail(x, y);
      }
      // las estrellas cercanas se avivan
      if (now - Interactions.lastExcite > 90) {
        Interactions.lastExcite = now;
        Sky.excite(x, y, 150, 0.35);
      }
    };

    window.addEventListener('pointermove', e => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', e => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // en celular, sin dedo apoyado, el parallax se mueve suavemente solo
    if (U.isTouch) {
      window.addEventListener('deviceorientation', e => {
        if (e.gamma == null) return;
        Pointer.nx = U.clamp(e.gamma / 35, -1, 1);
        Pointer.ny = U.clamp((e.beta - 45) / 45, -1, 1);
      }, { passive: true });
    }
  },

  /* ── click en cualquier lado: corazones + onda ───────────────────── */
  bindClicks() {
    document.addEventListener('pointerdown', e => {
      Audio.unlock();
      if (Overlay.open && !e.target.closest('.overlay-content')) return;
      const x = e.clientX, y = e.clientY;
      FX.hearts(x, y, U.randInt(2, 4), { scale: 0.75, spread: 0.8 });
      FX.sparks(x, y, 6, { power: 0.7 });
      Sky.excite(x, y, 240, 0.75);
      Interactions.ripple(x, y);
    }, { passive: true });
  },

  ripple(x, y) {
    const r = document.createElement('span');
    r.className = 'click-ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.body.appendChild(r);
    A.done(A.anim(r, [
      { transform: 'translate(-50%,-50%) scale(0)', opacity: 0.55 },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }
    ], { duration: 780, easing: EASE.out })).then(() => r.remove());
  },

  /* ── botones (data-action) ───────────────────────────────────────── */
  bindActions() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      Audio.sfx('click');
      const r = btn.getBoundingClientRect();
      FX.sparks(r.left + r.width / 2, r.top + r.height / 2, 14, { power: 1.1 });
      Scenes.action(action, btn);
    });

    // gatito escondido
    const cat = $('#hidden-cat');
    if (cat) {
      cat.addEventListener('click', e => {
        e.stopPropagation();
        Audio.sfx('star');
        cat.classList.add('found');
        Toast.show(CONFIG.catMessage);
        FX.hearts(e.clientX, e.clientY, 8, { scale: 0.8 });
      });
    }

    // botones: brillo que sigue al cursor
    document.addEventListener('pointermove', e => {
      const b = e.target.closest('.btn');
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      b.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  },

  /* ── parallax global (bokeh + contenido de la escena) ─────────────── */
  update(dt) {
    const bo = $('#bokeh-layer');
    if (bo) bo.style.transform = `translate3d(${-Pointer.nx * 22}px, ${-Pointer.ny * 16}px, 0)`;
    const neb = $('#sky-layer');
    if (neb) neb.style.transform = `translate3d(${-Pointer.nx * 10}px, ${-Pointer.ny * 8}px, 0) scale(1.06)`;
    const active = $('.scene.active .scene-inner');
    if (active) active.style.setProperty('--px', `${Pointer.nx * 5}px`);
    if (active) active.style.setProperty('--py', `${Pointer.ny * 4}px`);
  }
};
