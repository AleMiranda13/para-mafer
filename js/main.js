/* ==========================================================================
   main.js · CONFIG + motor de animación + control de escenas
   --------------------------------------------------------------------------
   👉 TODO LO QUE QUERÉS EDITAR ESTÁ EN EL OBJETO "CONFIG" DE ABAJO.
      No hace falta que toques nada más del código.
   ========================================================================== */

const CONFIG = {

  /* ─── 1. NOMBRES ─────────────────────────────────────────────────────── */
  herName: "Mafer",            // ← el nombre de ella
  myName:  "Ale",              // ← tu nombre

  /* ─── 2. MENSAJES FINALES ────────────────────────────────────────────── */
  // Mensaje que aparece cuando se abre la caja de regalo (escena 11)
  giftMessage:
    "Gracias por estar, incluso cuando estamos a kilómetros.\n" +
    "Cada día que pasa tengo más ganas de que la distancia sea solo un recuerdo.\n" +
    "Te elijo hoy, mañana y todas las veces que haga falta.",

  // Mensaje de cierre de la experiencia (escena 12)
  finalMessage: "Te amo. ❤️",

  /* ─── 3. CARTAS (escena 4 · sobres) ───────────────────────────────────
     title → lo que se lee en el sobre cerrado
     text  → la carta (podés usar \n para saltos de línea)                */
  letters: [
    {
      title: "💌 Una cosa que amo de vos",
      text: "Amo la forma en que te entusiasmás con las cosas chiquitas.\n" +
            "Esa manera tuya de hacer que un día común se sienta especial."
    },
    {
      title: "💌 Un recuerdo",
      text: "Esa noche en la que hablamos hasta tarde sin darnos cuenta de la hora.\n" +
            "Ahí supe que con vos el tiempo funciona distinto."
    },
    {
      title: "💌 Algo que quiero hacer con vos",
      text: "Despertarme un domingo sin apuro, hacer el desayuno juntos\n" +
            "y no tener que despedirnos por una pantalla."
    },
    {
      title: "💌 Algo que nunca te dije",
      text: "A veces me quedo mirando nuestras fotos más tiempo del que admito.\n" +
            "Y cada vez pienso lo mismo: qué suerte tuve."
    },
    {
      title: "💌 Una promesa",
      text: "Que voy a seguir eligiendo estar, aunque el mapa se ponga difícil.\n" +
            "La distancia es temporal. Nosotros no."
    }
  ],

  /* ─── 4. ESTRELLAS ESPECIALES (escena 5 · galaxia) ────────────────────
     Son los 5 recuerdos escondidos en la galaxia.                        */
  specialDates: [
    { date: "El día que nos conocimos", title: "El principio",      text: "Sin saberlo, ese día cambió todo." },
    { date: "Nuestra primera charla",   title: "Hasta las 4am",     text: "No queríamos cortar. Todavía no queremos." },
    { date: "La primera vez que te vi", title: "Se me frenó todo",  text: "Ahí entendí de qué hablaban en las canciones." },
    { date: "Un día cualquiera",        title: "Y aun así perfecto",text: "Con vos hasta lo simple se siente enorme." },
    { date: "Hoy",                      title: "Acá seguimos",      text: "Un poquito más lejos, un montón más cerca." }
  ],
  // Sorpresa que se desbloquea al encontrar las 5 estrellas
  galaxyReward: "Cada una de esas estrellas es un pedacito de nosotros.\n" +
                "Y todavía nos quedan un montón de estrellas por prender.",

  /* ─── 5. TEXTOS DE CADA ESCENA ────────────────────────────────────────
     mode: "replace" → cada frase reemplaza a la anterior (cinematográfico)
           "stack"   → las frases se van acumulando
     delay: milisegundos de espera ANTES de que aparezca la frase
     hold : milisegundos que se queda antes de la siguiente               */
  texts: {
    intro: {
      mode: "replace",
      lines: [
        { text: "Preparé algo para vos...",     delay: 1100, hold: 2600 },
        { text: "Pero primero tenés que entrar.", delay: 400, hold: 900 }
      ],
      button: "✨ Entrar",
      // Al tocar "Entrar" arranca la música (así ningún navegador la bloquea).
      // Este textito aparece debajo del botón.
      hint: "🎧 se escucha mejor con sonido"
    },
    character: {
      mode: "stack",
      lines: [
        { text: "Te estaba esperando...", delay: 900,  hold: 2000 },
        { text: "¿Querés un abrazo?",     delay: 200,  hold: 700 }
      ],
      button: "🫂 Sí, por favor"
    },
    sky: {
      mode: "replace",
      lines: [
        { text: "A veces la distancia se siente enorme...", delay: 1000, hold: 3200 },
        { text: "Pero nunca fue suficiente para separarnos.", delay: 300, hold: 1200 }
      ],
      button: "Seguir ✦"
    },
    letters: {
      title: "Cartas para vos",
      hint:  "Abrí los sobres, uno por uno",
      button: "Seguir ✦"
    },
    galaxy: {
      title: "Nuestra galaxia",
      hint:  "Hay 5 estrellas que brillan distinto. Encontralas.",
      complete: "Encontraste todos nuestros pequeños recuerdos.",
      button: "Seguir ✦"
    },
    rain: {
      mode: "replace",
      lines: [
        { text: "Hay días en los que me gustaría simplemente poder aparecer ahí.", delay: 2200, hold: 3600 },
        { text: "Sin importar la distancia...", delay: 400, hold: 1600 }
      ],
      button: "Seguir ✦"
    },
    warm: {
      mode: "replace",
      lines: [
        { text: "Porque si pudiera estar ahí...", delay: 1400, hold: 2600 },
        { text: "...te abrazaría.",               delay: 900,  hold: 1200 }
      ],
      button: "🫂 Acercate"
    },
    hug: {
      mode: "replace",
      lines: [
        { text: "Ojalá pudiera abrazarte de verdad.", delay: 600, hold: 3400 },
        { text: "Pero hasta que pueda hacerlo...",    delay: 500, hold: 3000 },
        { text: "Guardate este abrazo. ❤️",           delay: 500, hold: 1500 }
      ],
      button: "Seguir ✦"
    },
    gift: {
      mode: "stack",
      lines: [
        { text: "Pero todavía falta algo...", delay: 700, hold: 600 }
      ],
      button: "🎁 Abrir",
      buttonNext: "Seguir ✦"
    },
    final: {
      mode: "stack",
      lines: [
        { text: "Puede que hoy estemos lejos...", delay: 1400, hold: 2600 },
        { text: "...pero siempre voy a encontrar una forma de estar un poquito más cerca de vos.", delay: 300, hold: 2600 }
      ],
      button: "↺ Volver a empezar"
    }
  },

  /* ─── 6. EXTRAS ESCONDIDOS ───────────────────────────────────────────── */
  catMessage: "Miau. Yo también la extraño. 🐈‍⬛",   // gatito escondido en la galaxia
  loadingText: "Preparando algo especial...",
  loadedText:  "Listo ❤️",

  /* ─── 7. AUDIO ────────────────────────────────────────────────────────
     Poné tu archivo en assets/music.mp3 (si no existe, no pasa nada).    */
  audio: {
    music: "assets/music.mp3",
    musicVolume: 0.32,
    sfxVolume: 0.35,
    sounds: {
      click:  "assets/sounds/click.mp3",
      letter: "assets/sounds/letter.mp3",
      star:   "assets/sounds/star.mp3",
      gift:   "assets/sounds/gift.mp3",
      hug:    "assets/sounds/hug.mp3"
    }
  },

  /* ─── 8. COLORES ──────────────────────────────────────────────────────
     Cambiá acá la paleta y se actualiza toda la página.                  */
  theme: {
    night:  "#060a1f",
    night2: "#0d1240",
    violet: "#8b5cf6",
    pink:   "#ff9ecb",
    rose:   "#ffd7e8",
    white:  "#fdfbff",
    gold:   "#f5d491",
    warm:   "#ffb27a"
  },

  /* ─── 9. RENDIMIENTO ──────────────────────────────────────────────────
     Bajá estos números si notás que va lento en algún celular.           */
  perf: {
    starsDesktop: 260,
    starsMobile:  130,
    bokehDesktop: 14,
    bokehMobile:  8,
    maxParticles: 320
  }
};


/* ==========================================================================
   UTILIDADES
   ========================================================================== */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const U = {
  clamp: (v, a, b) => Math.min(b, Math.max(a, v)),
  lerp:  (a, b, t) => a + (b - a) * t,
  rand:  (a, b) => a + Math.random() * (b - a),
  randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  isTouch: matchMedia('(hover: none)').matches || 'ontouchstart' in window,
  isMobile: matchMedia('(max-width: 780px)').matches
};

/* Curvas de easing (CSS) */
const EASE = {
  out:   'cubic-bezier(.16,1,.3,1)',
  soft:  'cubic-bezier(.22,.61,.36,1)',
  inOut: 'cubic-bezier(.65,0,.35,1)',
  back:  'cubic-bezier(.34,1.4,.64,1)'
};

/* Curvas de easing (JS, para canvas/cámara) */
const Ease = {
  linear:     t => t,
  outCubic:   t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outQuint:   t => 1 - Math.pow(1 - t, 5),
  inOutSine:  t => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack:    t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)
};

/* Motor de animación mínimo (Web Animations API + rAF). Sin dependencias. */
const A = {
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,

  wait(ms) {
    return new Promise(res => setTimeout(res, A.reduced ? Math.min(ms, 250) : ms));
  },

  /* Anima un elemento con keyframes. Devuelve la animación. */
  anim(el, keyframes, opts = {}) {
    if (!el) return null;
    const o = Object.assign({ duration: 700, easing: EASE.out, fill: 'both' }, opts);
    if (A.reduced) { o.duration = Math.min(o.duration, 250); o.delay = Math.min(o.delay || 0, 120); }
    try { return el.animate(keyframes, o); } catch (e) { return null; }
  },

  /* Espera a que termine una animación.
     Incluye un plan B por tiempo: si el navegador pausa las animaciones
     (pestaña en segundo plano, por ejemplo) la experiencia no se traba. */
  done(anim) {
    if (!anim || !anim.finished) return Promise.resolve();
    let total = 1400;
    try {
      const t = anim.effect.getComputedTiming();
      const d = typeof t.duration === 'number' ? t.duration : 0;
      total = (t.delay || 0) + d + (t.endDelay || 0);
    } catch (e) {}
    return Promise.race([
      anim.finished.catch(() => {}),
      new Promise(res => setTimeout(res, total + 300))
    ]);
  },

  /* Tween numérico con rAF (para cámara, canvas, valores sueltos) */
  tween({ from = 0, to = 1, duration = 800, ease = Ease.outCubic, onUpdate, onComplete }) {
    return new Promise(resolve => {
      const d = A.reduced ? Math.min(duration, 250) : duration;
      const t0 = performance.now();
      const step = now => {
        const p = U.clamp((now - t0) / d, 0, 1);
        const v = from + (to - from) * ease(p);
        if (onUpdate) onUpdate(v, p);
        if (p < 1) requestAnimationFrame(step);
        else { if (onComplete) onComplete(); resolve(); }
      };
      requestAnimationFrame(step);
    });
  }
};


/* ==========================================================================
   TEXTOS: revelado palabra por palabra
   ========================================================================== */
const Copy = {
  makeLine(text, cls = '') {
    const p = document.createElement('p');
    p.className = 'line ' + cls;
    text.split(/\s+/).forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.style.setProperty('--i', i);
      span.textContent = w;
      p.appendChild(span);
      p.appendChild(document.createTextNode(' '));
    });
    return p;
  },

  async hide(p) {
    if (!p) return;
    await A.done(A.anim(p, [
      { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
      { opacity: 0, filter: 'blur(8px)', transform: 'translateY(-14px)' }
    ], { duration: 650, easing: EASE.soft }));
    p.remove();
  },

  /* Reproduce la secuencia de frases de una escena */
  async play(sceneName, box) {
    const cfg = CONFIG.texts[sceneName];
    if (!cfg || !cfg.lines) return;
    const target = box || $(`.copy[data-copy="${sceneName}"]`);
    if (!target) return;
    target.innerHTML = '';
    const token = SM.token;
    const replace = cfg.mode === 'replace';
    let prev = null;

    for (const raw of cfg.lines) {
      const item = typeof raw === 'string' ? { text: raw } : raw;
      await A.wait(item.delay ?? 800);
      if (token !== SM.token) return;
      if (replace && prev) { Copy.hide(prev); await A.wait(320); if (token !== SM.token) return; }
      const p = Copy.makeLine(item.text, item.class || '');
      target.appendChild(p);
      requestAnimationFrame(() => p.classList.add('in'));
      prev = p;
      await A.wait(item.hold ?? 1400);
      if (token !== SM.token) return;
    }
  }
};


/* ==========================================================================
   GESTOR DE ESCENAS
   ========================================================================== */
const SM = {
  order: ['intro', 'character', 'sky', 'letters', 'galaxy', 'rain', 'warm', 'hug', 'gift', 'final'],
  defs: {},
  current: null,
  token: 0,
  busy: false,

  register(name, def) { SM.defs[name] = def; },

  el(name) { return $(`.scene[data-scene="${name}"]`); },

  buildProgress() {
    const nav = $('#progress');
    nav.innerHTML = '';
    SM.order.forEach(name => {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.dataset.scene = name;
      nav.appendChild(dot);
    });
  },

  markProgress(name) {
    const idx = SM.order.indexOf(name);
    $$('#progress .dot').forEach((d, i) => {
      d.classList.toggle('done', i < idx);
      d.classList.toggle('now', i === idx);
    });
  },

  /* Transición cinematográfica entre escenas */
  async go(name, opts = {}) {
    if (SM.busy || name === SM.current) return;
    const next = SM.el(name);
    if (!next) return;
    SM.busy = true;
    SM.token++;
    const token = SM.token;

    const prevName = SM.current;
    const prev = prevName ? SM.el(prevName) : null;
    const prevDef = prevName ? SM.defs[prevName] : null;

    if (prevDef && prevDef.exit) { try { prevDef.exit(prev); } catch (e) {} }

    if (prev) {
      await A.done(A.anim(prev, [
        { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
        { opacity: 0, filter: 'blur(14px)', transform: 'scale(.965)' }
      ], { duration: opts.fast ? 420 : 720, easing: EASE.soft }));
      prev.classList.remove('active');
      prev.style.opacity = '';
      prev.style.filter = '';
      prev.style.transform = '';
    }
    if (token !== SM.token) { SM.busy = false; return; }

    const def = SM.defs[name] || {};
    SM.current = name;
    SM.markProgress(name);

    // Ambiente + partículas de la nueva escena
    if (def.mood) Sky.setMood(def.mood);
    FX.setMode(def.fx || 'default');

    next.classList.add('active');
    next.scrollTop = 0;
    // reset de botones y textos
    $$('.actions .btn', next).forEach(b => b.classList.remove('show'));
    A.anim(next, [
      { opacity: 0, filter: 'blur(16px)', transform: 'scale(1.045)' },
      { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }
    ], { duration: opts.fast ? 500 : 900, easing: EASE.out });

    SM.busy = false;
    if (def.enter) { try { def.enter(next, token); } catch (e) { console.warn(e); } }
  },

  next() {
    const i = SM.order.indexOf(SM.current);
    if (i >= 0 && i < SM.order.length - 1) SM.go(SM.order[i + 1]);
  },

  /* Muestra los botones de acción de una escena (con animación escalonada) */
  showActions(sceneEl, delay = 0) {
    $$('.actions .btn:not(.hidden)', sceneEl).forEach((b, i) => {
      setTimeout(() => b.classList.add('show'), delay + i * 140);
    });
  }
};


/* ==========================================================================
   OVERLAY (recuerdos, cartas, estrellas)
   ========================================================================== */
const Overlay = {
  node: null,
  content: null,
  open: false,

  init() {
    Overlay.node = $('#overlay');
    Overlay.content = $('#overlay-content');
    Overlay.node.addEventListener('click', e => {
      if (e.target.hasAttribute('data-close')) Overlay.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && Overlay.open) Overlay.close(); });
  },

  show(html, cls = '') {
    Overlay.content.className = 'overlay-content ' + cls;
    Overlay.content.innerHTML = html;
    Overlay.node.classList.remove('hidden');
    document.body.classList.add('blurred');
    Overlay.open = true;
    A.anim(Overlay.node, [{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: EASE.out });
    A.anim(Overlay.content, [
      { opacity: 0, transform: 'translateY(28px) scale(.9)', filter: 'blur(10px)' },
      { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
    ], { duration: 700, easing: EASE.back });
    return Overlay.content;
  },

  async close() {
    if (!Overlay.open) return;
    Overlay.open = false;
    document.body.classList.remove('blurred');
    await A.done(A.anim(Overlay.node, [{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: EASE.soft }));
    Overlay.node.classList.add('hidden');
    Overlay.content.innerHTML = '';
    Overlay.node.style.opacity = '';
  }
};


/* ==========================================================================
   TOAST (mensajitos escondidos)
   ========================================================================== */
const Toast = {
  timer: null,
  show(msg, ms = 3200) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    requestAnimationFrame(() => t.classList.add('in'));
    clearTimeout(Toast.timer);
    Toast.timer = setTimeout(() => {
      t.classList.remove('in');
      setTimeout(() => t.classList.add('hidden'), 500);
    }, ms);
  }
};


/* ==========================================================================
   ARRANQUE
   ========================================================================== */
const App = {
  started: false,

  applyTheme() {
    const r = document.documentElement.style;
    const t = CONFIG.theme;
    r.setProperty('--night', t.night);
    r.setProperty('--night-2', t.night2);
    r.setProperty('--violet', t.violet);
    r.setProperty('--pink', t.pink);
    r.setProperty('--rose', t.rose);
    r.setProperty('--white', t.white);
    r.setProperty('--gold', t.gold);
    r.setProperty('--warm', t.warm);
  },

  fillTexts() {
    const T = CONFIG.texts;
    // botones
    const map = {
      'enter': T.intro.button,
      'to-sky': T.character.button,
      'to-letters': T.sky.button,
      'to-galaxy': T.letters.button,
      'to-rain': T.galaxy.button,
      'to-warm': T.rain.button,
      'to-hug': T.warm.button,
      'to-gift': T.hug.button,
      'open-gift': T.gift.button,
      'to-final': T.gift.buttonNext,
      'restart': T.final.button
    };
    Object.entries(map).forEach(([action, label]) => {
      $$(`[data-action="${action}"]`).forEach(b => b.textContent = label);
    });
    // títulos y ayudas
    ['letters', 'galaxy', 'intro'].forEach(s => {
      const ti = $(`[data-title="${s}"]`); if (ti) ti.textContent = T[s].title;
      const hi = $(`[data-hint="${s}"]`);  if (hi) hi.textContent = T[s].hint;
    });
    // nombres de las estrellas
    $('#star-me .star-name').textContent = CONFIG.myName;
    $('#star-her .star-name').textContent = CONFIG.herName;
    $('#galaxy-total').textContent = CONFIG.specialDates.length;
    $('#pre-text').textContent = CONFIG.loadingText;
    document.title = 'Para vos ✨';
  },

  async boot() {
    App.applyTheme();
    App.fillTexts();
    Overlay.init();
    Sky.init();
    FX.init();
    Audio.init();
    Interactions.init();
    Scenes.init();
    SM.buildProgress();

    // Preloader: barra que avanza mientras se preparan fuentes y canvas
    const fill = $('#pre-bar-fill');
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(92, p + U.rand(4, 13));
      fill.style.width = p + '%';
    }, 160);

    const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
    await Promise.all([fontsReady, A.wait(1700)]);
    clearInterval(tick);
    fill.style.width = '100%';
    $('#pre-text').textContent = CONFIG.loadedText;
    $('#preloader').classList.add('ready');

    await A.wait(900);
    const pre = $('#preloader');
    await A.done(A.anim(pre, [
      { opacity: 1, filter: 'blur(0px)' },
      { opacity: 0, filter: 'blur(12px)' }
    ], { duration: 900, easing: EASE.soft }));
    pre.remove();
    document.body.classList.remove('is-loading');
    $('#hud').classList.remove('hidden');

    // Atajo para probar: index.html#escena=hug salta directo a esa escena.
    // Nombres válidos: intro, character, sky, letters, galaxy,
    //                  rain, warm, hug, gift, final
    const wanted = (location.hash.match(/escena=([a-z]+)/) || [])[1];
    SM.go(SM.order.includes(wanted) ? wanted : 'intro');
  },

  restart() {
    Galaxy.reset();
    Scenes.resetAll();
    SM.go('intro', { fast: true });
  }
};
