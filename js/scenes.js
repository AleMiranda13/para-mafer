/* ==========================================================================
   scenes.js · Guion y coreografía de cada escena
   --------------------------------------------------------------------------
   Cada escena se registra en SM (el gestor de escenas de main.js) con:
     mood  → ambiente del cielo de fondo
     fx    → tipo de partículas de primer plano
     enter → lo que ocurre al entrar (animaciones, textos, timing)
     exit  → limpieza al salir
   ========================================================================== */

const Scenes = {

  /* ══════════════════════════════════════════════════════════════════════
     Construcción del contenido dinámico (polaroids, sobres) + registro
     ══════════════════════════════════════════════════════════════════ */
  init() {
    Scenes.buildPolaroids();
    Scenes.buildEnvelopes();
    Rain.init();
    Galaxy.init();
    Scenes.register();

    // avisamos cuando se cierra el overlay (lo usa la galaxia para volver)
    const origClose = Overlay.close;
    Overlay.close = async function () {
      await origClose.call(Overlay);
      document.dispatchEvent(new CustomEvent('overlay:closed'));
    };
  },

  /* ── Escena 4: polaroids flotantes ──────────────────────────────────── */
  buildPolaroids() {
    const wrap = $('#polaroids');
    wrap.innerHTML = '';
    CONFIG.memories.forEach((m, i) => {
      const card = document.createElement('button');
      card.className = 'polaroid';
      card.type = 'button';
      card.style.setProperty('--rot', U.rand(-7, 7).toFixed(2) + 'deg');
      card.style.setProperty('--delay', (i * 0.7).toFixed(2) + 's');
      card.style.setProperty('--dur', U.rand(6, 9).toFixed(2) + 's');
      card.innerHTML = `
        <span class="polaroid-tape"></span>
        <span class="photo" data-file="${m.img}">
          <img src="${m.img}" alt="${m.title}" loading="lazy">
        </span>
        <span class="polaroid-caption">${m.title}</span>`;
      const img = $('img', card);
      img.addEventListener('error', () => $('.photo', card).classList.add('missing'));
      card.addEventListener('click', e => { e.stopPropagation(); Scenes.openMemory(i, card); });
      wrap.appendChild(card);
    });
  },

  openMemory(i, card) {
    const m = CONFIG.memories[i];
    Audio.sfx('click');
    const box = Overlay.show(`
      <figure class="memory-view">
        <span class="photo big" data-file="${m.img}">
          <img src="${m.img}" alt="${m.title}">
        </span>
        <figcaption>
          <h3>${m.title}</h3>
          <p>${m.caption}</p>
        </figcaption>
      </figure>`, 'is-memory');
    const img = $('img', box);
    img.addEventListener('error', () => $('.photo', box).classList.add('missing'));
    const r = card.getBoundingClientRect();
    FX.hearts(r.left + r.width / 2, r.top + r.height / 2, 5, { scale: 0.8 });
  },

  /* ── Escena 5: sobres ───────────────────────────────────────────────── */
  buildEnvelopes() {
    const wrap = $('#envelopes');
    wrap.innerHTML = '';
    CONFIG.letters.forEach((l, i) => {
      const env = document.createElement('button');
      env.className = 'envelope';
      env.type = 'button';
      env.style.setProperty('--delay', (i * 0.55).toFixed(2) + 's');
      env.style.setProperty('--dur', U.rand(5.5, 8.5).toFixed(2) + 's');
      env.style.setProperty('--rot', U.rand(-4, 4).toFixed(2) + 'deg');
      env.innerHTML = `
        <span class="env-body">
          <span class="env-flap"></span>
          <span class="env-paper"></span>
          <span class="env-seal">♡</span>
        </span>
        <span class="env-title">${l.title}</span>`;
      env.addEventListener('click', e => { e.stopPropagation(); Scenes.openLetter(i, env); });
      wrap.appendChild(env);
    });
  },

  async openLetter(i, env) {
    const l = CONFIG.letters[i];
    Audio.sfx('letter');
    env.classList.add('open');
    const r = env.getBoundingClientRect();
    FX.sparks(r.left + r.width / 2, r.top + r.height / 2, 16, { power: 1, colors: ['#ffd7e8', '#f5d491', '#ffffff'] });
    await A.wait(520);
    Overlay.show(`
      <article class="letter-card">
        <span class="letter-ornament">✦</span>
        <h3>${l.title}</h3>
        <div class="letter-body">${l.text.split('\n').map(t => `<p>${t}</p>`).join('')}</div>
        <span class="letter-sign">— ${CONFIG.myName}</span>
      </article>`, 'is-letter');
    FX.hearts(window.innerWidth / 2, window.innerHeight * 0.7, 8, { scale: 0.9 });
  },

  /* ══════════════════════════════════════════════════════════════════════
     Efectos de cámara reutilizables
     ══════════════════════════════════════════════════════════════════ */
  lightWave(x, y) {
    const f = $('#flash');
    f.style.setProperty('--wx', x + 'px');
    f.style.setProperty('--wy', y + 'px');
    A.anim(f, [
      { opacity: 0, transform: 'scale(0)' },
      { opacity: 0.9, transform: 'scale(0.4)', offset: 0.18 },
      { opacity: 0, transform: 'scale(3.2)' }
    ], { duration: 1400, easing: EASE.out, fill: 'none' });
  },

  cameraZoom(from = 1, to = 1.1, duration = 1300) {
    A.anim($('#stage'), [
      { transform: `scale(${from})` },
      { transform: `scale(${to})` }
    ], { duration, easing: EASE.inOut, fill: 'none' });
  },

  /* ══════════════════════════════════════════════════════════════════════
     REGISTRO DE ESCENAS
     ══════════════════════════════════════════════════════════════════ */
  register() {

    /* ── 1 · INTRO ─────────────────────────────────────────────────── */
    SM.register('intro', {
      mood: 'night', fx: 'default',
      async enter(el, token) {
        Audio.syncUI();
        await Copy.play('intro');
        if (token !== SM.token) return;
        SM.showActions(el, 200);
      }
    });

    /* ── 2 · EL PERSONAJE ──────────────────────────────────────────── */
    SM.register('character', {
      mood: 'dream', fx: 'dream',
      async enter(el, token) {
        const inst = Character.mount('character');
        const stage = $('.char-stage[data-char-slot="character"]');
        A.anim(stage, [
          { opacity: 0, transform: 'translateY(60px) scale(.82)', filter: 'blur(14px)' },
          { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
        ], { duration: 1500, easing: EASE.back });
        // chispitas al aterrizar
        setTimeout(() => {
          const r = stage.getBoundingClientRect();
          FX.dust(r.left + r.width / 2, r.top + r.height * 0.92, 14);
        }, 900);

        await A.wait(700);
        if (token !== SM.token) return;
        await Copy.play('character');
        if (token !== SM.token) return;
        if (inst) Character.poke(inst);
        SM.showActions(el, 200);
      }
    });

    /* ── 3 · EL CIELO Y LA DISTANCIA ───────────────────────────────── */
    SM.register('sky', {
      mood: 'wide', fx: 'space',
      async enter(el, token) {
        const me = $('#star-me'), her = $('#star-her');
        const path = $('#link-path'), svg = $('#sky-link');
        me.classList.remove('near'); her.classList.remove('near');
        path.classList.remove('drawn');
        me.style.transform = 'translate(0,0)';
        her.style.transform = 'translate(0,0)';

        // el lazo de luz se redibuja en cada frame entre las dos estrellas
        Scenes._linkRAF = () => {
          if (SM.current !== 'sky') return;
          const box = svg.getBoundingClientRect();
          const a = me.getBoundingClientRect(), b = her.getBoundingClientRect();
          const x1 = a.left + a.width / 2 - box.left, y1 = a.top + a.height / 2 - box.top;
          const x2 = b.left + b.width / 2 - box.left, y2 = b.top + b.height / 2 - box.top;
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + Math.sin(performance.now() / 900) * 18 + 26;
          path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
          requestAnimationFrame(Scenes._linkRAF);
        };
        requestAnimationFrame(Scenes._linkRAF);

        A.anim(me, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 1600, easing: EASE.out });
        A.anim(her, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 1600, delay: 400, easing: EASE.out });

        await Copy.play('sky');
        if (token !== SM.token) return;

        // se acercan lentamente
        me.classList.add('near');
        her.classList.add('near');
        A.anim(me, [{ transform: 'translate(0,0)' }, { transform: 'translate(24vw, 9vh)' }],
          { duration: 5200, easing: EASE.inOut });
        A.anim(her, [{ transform: 'translate(0,0)' }, { transform: 'translate(-24vw, -9vh)' }],
          { duration: 5200, easing: EASE.inOut });
        Scenes.cameraZoom(1, 1.05, 5200);

        await A.wait(3600);
        if (token !== SM.token) return;
        path.classList.add('drawn');
        Audio.sfx('star');
        const box = $('#sky-field').getBoundingClientRect();
        FX.sparks(box.left + box.width / 2, box.top + box.height / 2, 26, { power: 1.2 });
        FX.hearts(box.left + box.width / 2, box.top + box.height / 2, 6, { scale: 0.8 });

        await A.wait(1400);
        if (token !== SM.token) return;
        SM.showActions(el);
      },
      exit() { Scenes._linkRAF = null; }
    });

    /* ── 4 · RECUERDOS ─────────────────────────────────────────────── */
    SM.register('memories', {
      mood: 'deep', fx: 'space',
      async enter(el, token) {
        // fill:'backwards' → al terminar devuelve el control al CSS,
        // así siguen flotando y responden al hover/toque.
        $$('.polaroid', el).forEach((p, i) => {
          A.anim(p, [
            { opacity: 0, transform: 'translateY(70px) scale(.85)', filter: 'blur(10px)' },
            { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
          ], { duration: 1100, delay: 260 + i * 150, easing: EASE.back, fill: 'backwards' });
        });
        await A.wait(1800);
        if (token !== SM.token) return;
        SM.showActions(el);
      }
    });

    /* ── 5 · CARTAS ────────────────────────────────────────────────── */
    SM.register('letters', {
      mood: 'deep', fx: 'space',
      async enter(el, token) {
        $$('.envelope', el).forEach((p, i) => {
          A.anim(p, [
            { opacity: 0, transform: 'translateY(60px) scale(.8)', filter: 'blur(10px)' },
            { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
          ], { duration: 1000, delay: 220 + i * 130, easing: EASE.back, fill: 'backwards' });
        });
        await A.wait(1700);
        if (token !== SM.token) return;
        SM.showActions(el);
      }
    });

    /* ── 6 · GALAXIA ───────────────────────────────────────────────── */
    SM.register('galaxy', {
      mood: 'deep', fx: 'space',
      async enter(el, token) {
        Galaxy.start();
        $('#galaxy-found').textContent = Galaxy.found.size;
        A.anim($('.galaxy-wrap', el), [
          { opacity: 0, transform: 'scale(1.15)', filter: 'blur(16px)' },
          { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }
        ], { duration: 1600, easing: EASE.out });
        await A.wait(2200);
        if (token !== SM.token) return;
        SM.showActions(el);
      },
      exit() { Galaxy.stop(); }
    });

    /* ── 8 · LLUVIA ────────────────────────────────────────────────── */
    SM.register('rain', {
      mood: 'rain', fx: 'rain',
      async enter(el, token) {
        Character.mount('rain');
        Rain.start();
        const frame = $('.window-frame', el);
        A.anim(frame, [
          { opacity: 0, transform: 'scale(.9) translateY(30px)', filter: 'blur(14px)' },
          { opacity: 1, transform: 'scale(1) translateY(0)', filter: 'blur(0)' }
        ], { duration: 1800, easing: EASE.out });
        el.classList.add('is-raining');

        await Copy.play('rain');
        if (token !== SM.token) return;

        // la lluvia se va apagando y aparecen lucecitas
        Rain.fade();
        el.classList.remove('is-raining');
        el.classList.add('is-clearing');
        for (let i = 0; i < 26; i++) {
          setTimeout(() => {
            if (token !== SM.token) return;
            FX.dust(U.rand(0, window.innerWidth), window.innerHeight * U.rand(0.5, 0.95), 2);
          }, i * 160);
        }
        await A.wait(3000);
        if (token !== SM.token) return;
        SM.showActions(el);
      },
      exit(el) {
        Rain.stop();
        if (el) el.classList.remove('is-raining', 'is-clearing');
      }
    });

    /* ── 9 · CAMBIO A CÁLIDO ───────────────────────────────────────── */
    SM.register('warm', {
      mood: 'warm', fx: 'warm',
      async enter(el, token) {
        document.body.classList.add('warm-mode');
        FX.petals(14);
        A.anim($('.warm-orb', el), [
          { opacity: 0, transform: 'scale(.2)' },
          { opacity: 1, transform: 'scale(1)' }
        ], { duration: 2600, easing: EASE.out, fill: 'backwards' });
        await Copy.play('warm');
        if (token !== SM.token) return;
        SM.showActions(el, 300);
      }
    });

    /* ── 10 · EL ABRAZO ────────────────────────────────────────────── */
    SM.register('hug', {
      mood: 'dark', fx: 'hug',
      async enter(el, token) {
        document.body.classList.remove('warm-mode');
        el.classList.remove('is-close', 'is-hugging');
        const walker = $('#hug-walker');
        const inst = Character.mount('hug');
        const stage = $('.char-stage[data-char-slot="hug"]');
        Character.openArms(inst, false);
        Audio.sfx('hug');

        walker.style.opacity = '0';
        walker.style.transform = 'translate(-50%, 0) scale(.12)';

        // 1) oscuridad + lucecita lejana
        await A.wait(1400);
        if (token !== SM.token) return;

        // 2) el personaje aparece a lo lejos y empieza a caminar
        A.anim(walker, [{ opacity: 0 }, { opacity: 1 }], { duration: 2200, easing: EASE.out });
        stage.classList.add('is-walking');
        Audio.swell(1.25, 6000);

        let lastStep = 0;
        await A.tween({
          from: 0, to: 1, duration: A.reduced ? 1200 : 6400, ease: Ease.inOutCubic,
          onUpdate: (v) => {
            if (token !== SM.token) return;
            const scale = U.lerp(0.12, 1, Math.pow(v, 1.7));
            const bob = Math.sin(v * 46) * (3 + v * 5);
            walker.style.transform = `translate(-50%, ${bob}px) scale(${scale})`;
            el.style.setProperty('--near', v.toFixed(3));
            // polvo de estrellas en cada paso
            const now = performance.now();
            if (now - lastStep > 320 - v * 140) {
              lastStep = now;
              const r = stage.getBoundingClientRect();
              FX.dust(r.left + r.width / 2 + U.rand(-20, 20), r.bottom - 6, 3 + Math.round(v * 4));
            }
          }
        });
        if (token !== SM.token) return;
        stage.classList.remove('is-walking');
        el.classList.add('is-close');

        // 3) pausa antes del abrazo
        await A.wait(1100);
        if (token !== SM.token) return;

        // 4) abre los brazos hacia la cámara
        Character.openArms(inst, true);
        Audio.sfx('hug');
        Audio.swell(1.45, 2200);
        await A.wait(900);
        if (token !== SM.token) return;

        el.classList.add('is-hugging');
        // el personaje se acerca un poco más: sensación de "entrar en tu espacio"
        A.anim(walker, [
          { transform: 'translate(-50%, 0) scale(1)' },
          { transform: 'translate(-50%, 3%) scale(1.34)' }
        ], { duration: 2600, easing: EASE.out });
        Scenes.cameraZoom(1, 1.16, 2600);
        const cx = window.innerWidth / 2, cy = window.innerHeight * 0.55;
        FX.hearts(cx, cy, 16, { scale: 1.15, spread: 1.6 });
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            if (token !== SM.token) return;
            FX.hearts(U.rand(cx - 200, cx + 200), cy + U.rand(-80, 120), 4, { scale: 1 });
          }, 500 + i * 520);
        }

        // 5) el mensaje del abrazo
        await A.wait(1200);
        if (token !== SM.token) return;
        await Copy.play('hug');
        if (token !== SM.token) return;
        Audio.unswell();
        SM.showActions(el, 400);
      },
      exit(el) {
        if (el) el.classList.remove('is-close', 'is-hugging');
        const inst = Character.instances.find(i => i.slot === 'hug');
        Character.openArms(inst, false);
        Audio.unswell(1200);
      }
    });

    /* ── 11 · CAJA SORPRESA ────────────────────────────────────────── */
    SM.register('gift', {
      mood: 'warm', fx: 'warm',
      async enter(el, token) {
        document.body.classList.add('warm-mode');
        const box = $('#giftbox');
        box.classList.remove('open');
        $('#gift-message').innerHTML = '';
        $('[data-action="to-final"]').classList.add('hidden');
        $('[data-action="open-gift"]').classList.remove('hidden');

        A.anim(box, [
          { opacity: 0, transform: 'translateY(70px) scale(.7)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 1400, delay: 500, easing: EASE.back, fill: 'backwards' });

        await Copy.play('gift');
        if (token !== SM.token) return;
        SM.showActions(el, 300);
      }
    });

    /* ── 12 · FINAL ────────────────────────────────────────────────── */
    SM.register('final', {
      mood: 'calm', fx: 'calm',
      async enter(el, token) {
        document.body.classList.remove('warm-mode');
        Character.mount('final');
        const hill = $('.final-hill', el);
        A.anim(hill, [
          { opacity: 0, transform: 'translateY(50px)', filter: 'blur(12px)' },
          { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
        ], { duration: 1800, easing: EASE.out });

        await Copy.play('final');
        if (token !== SM.token) return;

        const box = $('.copy[data-copy="final"]');
        const p = Copy.makeLine(CONFIG.finalMessage, 'final-love');
        box.appendChild(p);
        requestAnimationFrame(() => p.classList.add('in'));
        FX.hearts(window.innerWidth / 2, window.innerHeight * 0.7, 14, { scale: 1.2 });

        await A.wait(2200);
        if (token !== SM.token) return;
        SM.showActions(el);
      }
    });
  },

  /* ══════════════════════════════════════════════════════════════════════
     ACCIONES DE LOS BOTONES
     ══════════════════════════════════════════════════════════════════ */
  async action(name, btn) {
    switch (name) {

      case 'music-optin':
        Audio.toggle();
        break;

      case 'enter': {
        const r = btn.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        Scenes.lightWave(x, y);
        Sky.burst();
        FX.sparks(x, y, 40, { power: 2.2 });
        FX.hearts(x, y, 8);
        Scenes.cameraZoom(1, 1.14, 1500);
        if (Audio.enabled) Audio.unlock();
        await A.wait(620);
        SM.go('character');
        break;
      }

      case 'to-sky':      SM.go('sky'); break;
      case 'to-memories': SM.go('memories'); break;
      case 'to-letters':  SM.go('letters'); break;
      case 'to-galaxy':   SM.go('galaxy'); break;
      case 'to-rain':     SM.go('rain'); break;
      case 'to-warm':     SM.go('warm'); break;

      case 'to-hug': {
        const r = btn.getBoundingClientRect();
        Scenes.lightWave(r.left + r.width / 2, r.top + r.height / 2);
        FX.hearts(r.left + r.width / 2, r.top + r.height / 2, 14, { scale: 1.1 });
        await A.wait(500);
        SM.go('hug');
        break;
      }

      case 'to-gift':  SM.go('gift'); break;
      case 'to-final': SM.go('final'); break;
      case 'open-gift': Scenes.openGift(btn); break;
      case 'restart':  App.restart(); break;
    }
  },

  /* ── Caja de regalo ─────────────────────────────────────────────── */
  async openGift(btn) {
    const box = $('#giftbox');
    if (box.classList.contains('open')) return;
    btn.classList.remove('show');
    setTimeout(() => btn.classList.add('hidden'), 400);

    Audio.sfx('gift');
    box.classList.add('open');
    // la frase "Pero todavía falta algo..." se apaga para dejar lugar al mensaje
    const intro = $('.copy[data-copy="gift"] .line');
    if (intro) Copy.hide(intro);

    const r = box.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    Scenes.lightWave(cx, cy);

    await A.wait(420);
    FX.confetti(cx, cy - 20, U.isMobile ? 45 : 80);
    FX.hearts(cx, cy - 20, 16, { scale: 1.2, spread: 1.6 });
    FX.sparks(cx, cy - 20, 34, { power: 2 });

    await A.wait(900);
    const msg = $('#gift-message');
    msg.innerHTML = '';
    const lines = CONFIG.giftMessage.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const p = Copy.makeLine(lines[i]);
      msg.appendChild(p);
      requestAnimationFrame(() => p.classList.add('in'));
      await A.wait(900);
    }
    await A.wait(600);
    const next = $('[data-action="to-final"]');
    next.classList.remove('hidden');
    requestAnimationFrame(() => next.classList.add('show'));
  },

  /* ── Galaxia completa ───────────────────────────────────────────── */
  galaxyComplete() {
    Audio.sfx('gift');
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    FX.confetti(cx, cy, U.isMobile ? 35 : 60);
    FX.hearts(cx, cy, 14, { scale: 1.1 });
    Overlay.show(`
      <div class="star-card is-complete">
        <span class="star-card-ico">✧</span>
        <h3 class="star-title">${CONFIG.texts.galaxy.complete}</h3>
        <p class="star-text">${CONFIG.galaxyReward.replace(/\n/g, '<br>')}</p>
      </div>`, 'is-star');
    $('.galaxy-wrap').classList.add('complete');
  },

  /* ── Reinicio ───────────────────────────────────────────────────── */
  resetAll() {
    $$('.envelope').forEach(e => e.classList.remove('open'));
    $$('.copy').forEach(c => c.innerHTML = '');
    const gw = $('.galaxy-wrap'); if (gw) gw.classList.remove('complete');
    const cat = $('#hidden-cat'); if (cat) cat.classList.remove('found');
    const gift = $('#giftbox'); if (gift) gift.classList.remove('open');
    $('#gift-message').innerHTML = '';
    document.body.classList.remove('warm-mode');
    FX.clear();
    if (Overlay.open) Overlay.close();
  }
};
