/* ==========================================================================
   audio.js · Música ambiental + efectos de sonido
   --------------------------------------------------------------------------
   Todo es opcional y tolerante a fallos: si los archivos de /assets no
   existen, la página sigue funcionando exactamente igual, sin errores en
   consola y sin bloquear nada.

   Archivos esperados (ver README):
     assets/music.mp3
     assets/sounds/click.mp3  letter.mp3  star.mp3  gift.mp3  hug.mp3
   ========================================================================== */

const Audio = {
  music: null,
  musicOK: false,      // ¿el archivo existe y se pudo cargar?
  enabled: false,      // ¿está sonando la música?
  userMuted: false,    // ¿la silenció a propósito? (entonces no la reactivamos)
  sfxCache: {},
  fadeTimer: null,

  init() {
    // ── música ──────────────────────────────────────────────────────────
    const el = document.createElement('audio');
    el.src = CONFIG.audio.music;
    el.loop = true;
    el.volume = 0;
    el.preload = 'auto';
    el.addEventListener('canplaythrough', () => { Audio.musicOK = true; }, { once: true });
    el.addEventListener('error', () => { Audio.musicOK = false; }, { once: true });
    Audio.music = el;

    // ── efectos (se cargan en silencio; si fallan, se ignoran) ──────────
    Object.entries(CONFIG.audio.sounds).forEach(([name, src]) => {
      const a = document.createElement('audio');
      a.src = src;
      a.preload = 'auto';
      a.volume = CONFIG.audio.sfxVolume;
      a.dataset.ok = '0';
      a.addEventListener('canplaythrough', () => { a.dataset.ok = '1'; }, { once: true });
      a.addEventListener('error', () => { a.dataset.ok = '0'; }, { once: true });
      Audio.sfxCache[name] = a;
    });

    // ── botón del HUD ───────────────────────────────────────────────────
    const btn = $('#btn-music');
    btn.addEventListener('click', () => Audio.toggle());
    Audio.syncUI();
  },

  syncUI() {
    const btn = $('#btn-music');
    const ico = $('#music-ico');
    const label = $('#music-label');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(Audio.enabled));
    btn.classList.toggle('on', Audio.enabled);
    ico.textContent = Audio.enabled ? '🎵' : '🔇';
    label.textContent = Audio.enabled ? 'Música' : 'Sin música';
  },

  /* Enciende/apaga con fundido */
  toggle() {
    if (Audio.enabled) { Audio.stopMusic(); Audio.userMuted = true; }
    else Audio.playMusic();
    Audio.syncUI();
  },

  playMusic() {
    Audio.enabled = true;
    Audio.userMuted = false;
    const p = Audio.music.play();
    if (p && p.catch) p.catch(() => { /* autoplay bloqueado: se reintenta al primer toque */ });
    Audio.fade(CONFIG.audio.musicVolume, 2400);
    Audio.syncUI();
  },

  stopMusic() {
    Audio.enabled = false;
    Audio.fade(0, 900, () => { try { Audio.music.pause(); } catch (e) {} });
    Audio.syncUI();
  },

  /* Fundido de volumen (sirve también para los momentos emocionales) */
  fade(to, ms = 1200, done) {
    clearInterval(Audio.fadeTimer);
    const from = Audio.music.volume;
    const steps = Math.max(1, Math.round(ms / 40));
    let i = 0;
    Audio.fadeTimer = setInterval(() => {
      i++;
      const v = from + (to - from) * (i / steps);
      try { Audio.music.volume = U.clamp(v, 0, 1); } catch (e) {}
      if (i >= steps) { clearInterval(Audio.fadeTimer); if (done) done(); }
    }, 40);
  },

  /* Sube un poquito el volumen en los momentos clave (abrazo) */
  swell(mult = 1.35, ms = 2000) {
    if (!Audio.enabled) return;
    Audio.fade(U.clamp(CONFIG.audio.musicVolume * mult, 0, 1), ms);
  },
  unswell(ms = 2500) {
    if (!Audio.enabled) return;
    Audio.fade(CONFIG.audio.musicVolume, ms);
  },

  /* Reproduce un efecto. Si el archivo no existe, no hace nada. */
  sfx(name) {
    const base = Audio.sfxCache[name];
    if (!base || base.dataset.ok !== '1') return;
    try {
      const node = base.cloneNode();
      node.volume = CONFIG.audio.sfxVolume;
      const p = node.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  },

  /* Algunos navegadores exigen un gesto del usuario para el primer sonido */
  unlock() {
    if (Audio.enabled && Audio.music.paused) {
      const p = Audio.music.play();
      if (p && p.catch) p.catch(() => {});
    }
  }
};
