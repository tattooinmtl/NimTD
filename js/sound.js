(function () {
  // ============================================================
  // NimTD Sound Manager
  // Handles music, SFX, and tower sounds with volume controls.
  // Audio files load lazily; missing files fail silently.
  // ============================================================

  const SOUND_PATH = 'sounds';  // Relative path from HTML files

  // Sound catalog - what files exist
  const CATALOG = {
    music: ['menu', 'battle', 'victory', 'defeat'],
    sfx: [
      'ui_click', 'place', 'upgrade', 'sell',
      'wave_start', 'wave_complete', 'life_lost', 'game_over',
      'enemy_die', 'boss_die', 'hit', 'explosion',
      'stun', 'freeze', 'chain'
    ],
    towers: [
      'basic', 'cannon', 'sniper', 'tesla', 'magic', 'frost', 'star',
      'laser', 'gunner', 'crossbow', 'bomb', 'meteor', 'inferno',
      'poison', 'knockback', 'web', 'seismic', 'gravity', 'reflect',
      'summoner', 'temporal', 'aqua', 'spike', 'void', 'flak'
    ]
  };

  // Maps tower effect types to SFX (for impact sounds)
  const EFFECT_SFX = {
    flame: 'explosion',
    chain: 'chain',
    star: 'stun',
    frost: 'freeze',
    seismic: 'explosion'
  };

  // Load saved volume preferences
  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem('nimtd.audio'));
      return Object.assign({ master: 0.7, music: 0.5, sfx: 0.8, muted: false }, saved || {});
    } catch {
      return { master: 0.7, music: 0.5, sfx: 0.8, muted: false };
    }
  }

  function savePrefs(prefs) {
    try { localStorage.setItem('nimtd.audio', JSON.stringify(prefs)); } catch {}
  }

  const prefs = loadPrefs();
  const cache = new Map();           // name -> HTMLAudioElement (template)
  const activeMusic = { audio: null, name: null };
  let unlocked = false;

  // Load a sound file (returns the cached <audio> element)
  function load(category, name) {
    const key = `${category}/${name}`;
    if (cache.has(key)) return cache.get(key);
    const audio = new Audio(`${SOUND_PATH}/${category}/${name}.ogg`);
    audio.preload = 'auto';
    audio.addEventListener('error', () => {
      // Silently fail - missing file
      cache.set(key, null);
    });
    cache.set(key, audio);
    return audio;
  }

  // Preload all sounds (call early to reduce playback delay)
  function preloadAll() {
    for (const [cat, names] of Object.entries(CATALOG)) {
      for (const n of names) load(cat, n);
    }
  }

  // Play a one-shot SFX (clones audio so multiple can overlap)
  function playSfx(name, opts = {}) {
    if (prefs.muted) return;
    const audio = load('sfx', name);
    if (!audio) return;
    try {
      const clone = audio.cloneNode();
      clone.volume = (opts.volume ?? 1) * prefs.sfx * prefs.master;
      clone.play().catch(() => {});
    } catch {}
  }

  // Play a tower sound (falls back to 'basic' if missing)
  function playTower(towerType, opts = {}) {
    if (prefs.muted) return;
    const audio = load('towers', towerType) || load('towers', 'basic');
    if (!audio) return;
    try {
      const clone = audio.cloneNode();
      clone.volume = (opts.volume ?? 0.7) * prefs.sfx * prefs.master;
      clone.play().catch(() => {});
    } catch {}
  }

  // Play tower effect impact (chain, freeze, explosion, etc.)
  function playEffect(effect) {
    const sfxName = EFFECT_SFX[effect];
    if (sfxName) playSfx(sfxName, { volume: 0.6 });
  }

  // Music: stop current track and play new one (with crossfade)
  function playMusic(name, opts = {}) {
    if (prefs.muted) {
      activeMusic.name = name;
      return;
    }
    if (activeMusic.name === name && activeMusic.audio && !activeMusic.audio.paused) return;

    const newAudio = load('music', name);
    if (!newAudio) return;

    const fadeMs = opts.fadeMs ?? 400;
    const targetVol = (opts.volume ?? 1) * prefs.music * prefs.master;

    // Fade out old track
    if (activeMusic.audio) {
      const old = activeMusic.audio;
      const startVol = old.volume;
      const step = 50;
      const steps = Math.max(1, fadeMs / step);
      let i = 0;
      const fadeOut = setInterval(() => {
        i++;
        old.volume = Math.max(0, startVol * (1 - i / steps));
        if (i >= steps) { clearInterval(fadeOut); old.pause(); }
      }, step);
    }

    // Start new track
    try {
      const audio = newAudio.cloneNode();
      audio.loop = opts.loop !== false;
      audio.volume = 0;
      audio.play().then(() => {
        const step = 50;
        const steps = Math.max(1, fadeMs / step);
        let i = 0;
        const fadeIn = setInterval(() => {
          i++;
          audio.volume = Math.min(targetVol, targetVol * (i / steps));
          if (i >= steps) clearInterval(fadeIn);
        }, step);
      }).catch(() => {});
      activeMusic.audio = audio;
      activeMusic.name = name;
    } catch {}
  }

  function stopMusic(fadeMs = 400) {
    if (!activeMusic.audio) return;
    const old = activeMusic.audio;
    const startVol = old.volume;
    const step = 50;
    const steps = Math.max(1, fadeMs / step);
    let i = 0;
    const fade = setInterval(() => {
      i++;
      old.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) { clearInterval(fade); old.pause(); }
    }, step);
    activeMusic.audio = null;
    activeMusic.name = null;
  }

  // Update playing music volume to match new prefs
  function refreshVolumes() {
    if (activeMusic.audio) {
      activeMusic.audio.volume = prefs.muted ? 0 : prefs.music * prefs.master;
    }
  }

  function setVolume(channel, value) {
    prefs[channel] = Math.max(0, Math.min(1, value));
    savePrefs(prefs);
    refreshVolumes();
  }

  function setMuted(muted) {
    prefs.muted = !!muted;
    savePrefs(prefs);
    refreshVolumes();
    if (muted && activeMusic.audio) activeMusic.audio.pause();
    else if (!muted && activeMusic.audio && activeMusic.audio.paused && activeMusic.name) {
      activeMusic.audio.play().catch(() => {});
    }
  }

  function getPrefs() { return { ...prefs }; }

  // Unlock audio on first user interaction (required by browsers)
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    // Play a silent click to unlock the audio context
    const silent = new Audio();
    silent.volume = 0;
    silent.play().catch(() => {});
    preloadAll();
    if (activeMusic.name && (!activeMusic.audio || activeMusic.audio.paused)) {
      const requestedMusic = activeMusic.name;
      activeMusic.audio = null;
      activeMusic.name = null;
      playMusic(requestedMusic);
    }
  }
  ['click', 'keydown', 'touchstart'].forEach(evt => {
    addEventListener(evt, unlock, { once: true, passive: true });
  });

  // Public API
  window.NimTD = window.NimTD || {};
  window.NimTD.sound = {
    playSfx,
    playTower,
    playEffect,
    playMusic,
    stopMusic,
    setVolume,
    setMuted,
    getPrefs,
    preloadAll,
    catalog: CATALOG
  };
})();
