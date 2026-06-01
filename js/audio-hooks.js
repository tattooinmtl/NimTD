(function () {
  // ============================================================
  // NimTD Audio Hooks
  // Monkey-patches the Game class methods to trigger sounds.
  // Load this AFTER engine.js — it waits for window.NimTD.game.
  // ============================================================

  const SOUND = () => window.NimTD?.sound;
  if (!SOUND()) {
    console.warn('[audio-hooks] sound.js not loaded — hooks disabled.');
    return;
  }

  // Wait for the game instance to be ready, then patch methods.
  function patchWhenReady() {
    const game = window.NimTD?.game;
    if (!game) {
      setTimeout(patchWhenReady, 50);
      return;
    }
    install(game);
  }

  function install(game) {
    // --- Track lives to detect life loss ---
    let lastLives = game.lives;
    let lastRound = game.round;
    let lastOver = false;

    // --- Hook: shoot() — tower fires a projectile ---
    const origShoot = game.shoot.bind(game);
    game.shoot = function (t, e) {
      const result = origShoot(t, e);
      SOUND().playTower(t.model || t.type, { volume: 0.5 });
      return result;
    };

    // --- Hook: place() — tower placed ---
    const origPlace = game.place.bind(game);
    game.place = function (col, row, type) {
      const goldBefore = this.gold;
      const result = origPlace(col, row, type);
      if (this.gold < goldBefore) {  // Placement succeeded
        SOUND().playSfx('place');
      }
      return result;
    };

    // --- Hook: upgrade() — tower upgraded ---
    const origUpgrade = game.upgrade.bind(game);
    game.upgrade = function (t) {
      const levelBefore = t.level;
      const result = origUpgrade(t);
      if (t.level > levelBefore) {  // Upgrade succeeded
        SOUND().playSfx('upgrade');
      }
      return result;
    };

    // --- Hook: sell() — tower sold ---
    const origSell = game.sell.bind(game);
    game.sell = function (t) {
      SOUND().playSfx('sell');
      return origSell(t);
    };

    // --- Hook: killEnemy() — enemy dies ---
    const origKill = game.killEnemy.bind(game);
    game.killEnemy = function (e, particles) {
      if (e.alive) {
        if (e.type === 'boss') SOUND().playSfx('boss_die');
        else SOUND().playSfx('enemy_die', { volume: 0.4 });
      }
      return origKill(e, particles);
    };

    // --- Hook: chainLightning() — chain effect ---
    const origChain = game.chainLightning.bind(game);
    game.chainLightning = function (source, damage, count, range) {
      if (count > 0) SOUND().playSfx('chain', { volume: 0.3 });
      return origChain(source, damage, count, range);
    };

    // --- Hook: update() — detect life lost, round change, game over ---
    const origUpdate = game.update.bind(game);
    game.update = function () {
      const result = origUpdate();
      // Life lost
      if (this.lives < lastLives) {
        SOUND().playSfx('life_lost');
        lastLives = this.lives;
      }
      // Round change
      if (this.round > lastRound) {
        SOUND().playSfx('wave_complete');
        // Brief delay before wave_start sound
        setTimeout(() => SOUND().playSfx('wave_start'), 600);
        lastRound = this.round;
      }
      // Game over / victory
      if (this.over && !lastOver) {
        lastOver = true;
        if (this.lives <= 0) {
          SOUND().playSfx('game_over');
          SOUND().playMusic('defeat', { loop: false });
        } else {
          SOUND().playMusic('victory', { loop: false });
        }
      }
      return result;
    };

    // --- Hook: effects.apply — trigger effect-impact sounds ---
    const effects = window.NimTD?.effects;
    if (effects && effects.apply) {
      const effectSfxMap = {
        flame: 'explosion',
        star: 'stun',
        frost: 'freeze',
        chain: null,  // already covered by chainLightning hook
        seismic: 'explosion'
      };
      for (const [effectName, sfxName] of Object.entries(effectSfxMap)) {
        if (!sfxName) continue;
        const orig = effects.apply[effectName];
        if (!orig) continue;
        effects.apply[effectName] = function (engine, p, e) {
          SOUND().playSfx(sfxName, { volume: 0.4 });
          return orig.call(this, engine, p, e);
        };
      }
    }

    // --- Start battle music if we're on the game screen ---
    if (document.getElementById('game')) {
      // Small delay so it doesn't kick in before user interaction
      setTimeout(() => SOUND().playMusic('battle', { volume: 0.5 }), 800);
    }

    console.log('[audio-hooks] Installed sound hooks for NimTD');
  }

  // Start the patching process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchWhenReady);
  } else {
    patchWhenReady();
  }
})();
