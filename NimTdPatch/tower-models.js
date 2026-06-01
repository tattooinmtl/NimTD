(function () {
  const TAU = Math.PI * 2;

  // Helper: draw base shadow ellipse
  function shadow(ctx, p, sz, w = 0.22, h = 0.1) {
    ctx.fillStyle = '#0008';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + sz * 0.18, sz * w, sz * h, 0, 0, TAU);
    ctx.fill();
  }

  // Helper: draw vertical gradient body
  function bodyGradient(ctx, p, sz, color, w = 0.2, h = 0.35) {
    const g = ctx.createLinearGradient(p.x - sz * w * 0.6, p.y, p.x + sz * w * 0.6, p.y);
    g.addColorStop(0, color);
    g.addColorStop(0.5, '#fff');
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.fillRect(p.x - sz * w * 0.5, p.y - sz * h, sz * w, sz * h);
    return g;
  }

  // Helper: rotating barrel
  function barrel(ctx, p, sz, t, w = 0.18, h = 0.08, color = '#666', offsetY = -0.2) {
    ctx.save();
    ctx.translate(p.x, p.y + sz * offsetY);
    ctx.rotate(t.angle);
    ctx.fillStyle = color;
    ctx.fillRect(0, -sz * h / 2, sz * w, sz * h);
    ctx.restore();
  }

  // Helper: level pips (small dots showing upgrades)
  function levelPips(ctx, p, sz, t) {
    if (!t.level) return;
    for (let i = 0; i < t.level; i++) {
      ctx.fillStyle = '#ffdd33';
      ctx.beginPath();
      ctx.arc(p.x - sz * 0.12 + i * sz * 0.06, p.y + sz * 0.05, sz * 0.02, 0, TAU);
      ctx.fill();
    }
  }

  const models = {
    // ===== EXISTING 7 (keep but enhanced) =====
    basic(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      bodyGradient(ctx, p, sz, t.color);
      // Cap
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.35, sz * 0.13, 0, TAU);
      ctx.fill();
      barrel(ctx, p, sz, t);
      levelPips(ctx, p, sz, t);
    },

    cannon(ctx, p, sz, t) {
      shadow(ctx, p, sz, 0.28, 0.12);
      // Wide squat body
      const g = ctx.createLinearGradient(p.x - sz * 0.15, p.y, p.x + sz * 0.15, p.y);
      g.addColorStop(0, '#5a2a1a');
      g.addColorStop(0.5, t.color);
      g.addColorStop(1, '#5a2a1a');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - sz * 0.16, p.y - sz * 0.25, sz * 0.32, sz * 0.25);
      // Thick barrel
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.15);
      ctx.rotate(t.angle);
      ctx.fillStyle = '#3a1a0a';
      ctx.fillRect(0, -sz * 0.08, sz * 0.24, sz * 0.16);
      ctx.fillStyle = '#1a0a05';
      ctx.fillRect(sz * 0.18, -sz * 0.09, sz * 0.06, sz * 0.18);
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    sniper(ctx, p, sz, t) {
      shadow(ctx, p, sz, 0.18, 0.08);
      // Tall thin pedestal
      bodyGradient(ctx, p, sz, t.color, 0.14, 0.4);
      // Scope on top
      ctx.fillStyle = '#222';
      ctx.fillRect(p.x - sz * 0.04, p.y - sz * 0.42, sz * 0.08, sz * 0.05);
      // Long barrel
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.25);
      ctx.rotate(t.angle);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(0, -sz * 0.03, sz * 0.32, sz * 0.06);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(sz * 0.3, -sz * 0.04, sz * 0.04, sz * 0.08);
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    tesla(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Insulator base
      ctx.fillStyle = '#333';
      ctx.fillRect(p.x - sz * 0.1, p.y - sz * 0.15, sz * 0.2, sz * 0.15);
      // Coil rings (3 stacked discs)
      for (let i = 0; i < 3; i++) {
        const y = p.y - sz * 0.15 - i * sz * 0.07;
        ctx.fillStyle = i % 2 ? '#88aaff' : t.color;
        ctx.beginPath();
        ctx.ellipse(p.x, y, sz * 0.12 - i * sz * 0.02, sz * 0.03, 0, 0, TAU);
        ctx.fill();
      }
      // Sphere on top (electrified)
      const pulse = (Math.sin(Date.now() * 0.01) + 1) * 0.5;
      ctx.fillStyle = `rgba(136,204,255,${0.6 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.4, sz * 0.08, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.4, sz * 0.04, 0, TAU);
      ctx.fill();
      levelPips(ctx, p, sz, t);
    },

    magic(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Pedestal
      ctx.fillStyle = '#553355';
      ctx.fillRect(p.x - sz * 0.12, p.y - sz * 0.2, sz * 0.24, sz * 0.2);
      ctx.fillStyle = '#774477';
      ctx.fillRect(p.x - sz * 0.14, p.y - sz * 0.22, sz * 0.28, sz * 0.04);
      // Floating orb (with pulse glow)
      const pulse = (Math.sin(Date.now() * 0.008) + 1) * 0.5;
      const orbY = p.y - sz * 0.32 - pulse * sz * 0.03;
      const g = ctx.createRadialGradient(p.x, orbY, 0, p.x, orbY, sz * 0.15);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.4, t.color);
      g.addColorStop(1, t.color + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, orbY, sz * 0.15, 0, TAU);
      ctx.fill();
      // Inner core
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, orbY, sz * 0.05, 0, TAU);
      ctx.fill();
      levelPips(ctx, p, sz, t);
    },

    frost(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      bodyGradient(ctx, p, sz, t.color, 0.2, 0.3);
      // Ice crystal cluster on top
      ctx.fillStyle = '#ddeeff';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.4;
        const x = p.x + Math.cos(a) * sz * 0.06;
        const y = p.y - sz * 0.35 + Math.sin(a) * sz * 0.06;
        ctx.beginPath();
        ctx.moveTo(x, y - sz * 0.1);
        ctx.lineTo(x - sz * 0.04, y);
        ctx.lineTo(x + sz * 0.04, y);
        ctx.closePath();
        ctx.fill();
      }
      // Frost barrel
      barrel(ctx, p, sz, t, 0.16, 0.1, '#88ccee');
      levelPips(ctx, p, sz, t);
    },

    star(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Tall spire
      bodyGradient(ctx, p, sz, t.color, 0.16, 0.4);
      // Star on top
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.45);
      ctx.rotate(Date.now() * 0.001);
      ctx.fillStyle = '#ffee88';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = (i % 2 ? sz * 0.05 : sz * 0.11);
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    // ===== NEW 18 MODELS =====
    
    laser(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Tripod base
      ctx.strokeStyle = '#333';
      ctx.lineWidth = sz * 0.03;
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * TAU / 3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - sz * 0.15);
        ctx.lineTo(p.x + Math.cos(a) * sz * 0.15, p.y + Math.sin(a) * sz * 0.05);
        ctx.stroke();
      }
      // Dish emitter
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.2);
      ctx.rotate(t.angle);
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.13, 0, TAU);
      ctx.fill();
      // Lens
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 0.1);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.4, t.color);
      g.addColorStop(1, '#440000');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sz * 0.04, 0, sz * 0.09, 0, TAU);
      ctx.fill();
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    gunner(ctx, p, sz, t) {
      shadow(ctx, p, sz, 0.22, 0.1);
      // Stocky base
      bodyGradient(ctx, p, sz, t.color, 0.22, 0.28);
      // Multi-barrel gatling
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.2);
      ctx.rotate(t.angle);
      // Spinning barrels (3)
      const spin = Date.now() * 0.02;
      for (let i = 0; i < 3; i++) {
        const offset = Math.sin(spin + i * TAU / 3) * sz * 0.04;
        ctx.fillStyle = '#444';
        ctx.fillRect(0, -sz * 0.05 + offset, sz * 0.22, sz * 0.04);
      }
      ctx.fillStyle = '#222';
      ctx.fillRect(sz * 0.2, -sz * 0.07, sz * 0.04, sz * 0.14);
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    crossbow(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Wooden base
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(p.x - sz * 0.1, p.y - sz * 0.2, sz * 0.2, sz * 0.2);
      ctx.fillStyle = '#7a5a2a';
      ctx.fillRect(p.x - sz * 0.12, p.y - sz * 0.22, sz * 0.24, sz * 0.04);
      // Crossbow arms
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.25);
      ctx.rotate(t.angle);
      // Bow
      ctx.strokeStyle = t.color;
      ctx.lineWidth = sz * 0.04;
      ctx.beginPath();
      ctx.arc(sz * 0.05, 0, sz * 0.18, -Math.PI / 2.5, Math.PI / 2.5);
      ctx.stroke();
      // String
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = sz * 0.01;
      ctx.beginPath();
      ctx.moveTo(sz * 0.05 + Math.cos(-Math.PI / 2.5) * sz * 0.18, Math.sin(-Math.PI / 2.5) * sz * 0.18);
      ctx.lineTo(sz * 0.05 + Math.cos(Math.PI / 2.5) * sz * 0.18, Math.sin(Math.PI / 2.5) * sz * 0.18);
      ctx.stroke();
      // Bolt
      ctx.fillStyle = '#aa7733';
      ctx.fillRect(0, -sz * 0.015, sz * 0.2, sz * 0.03);
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    bomb(ctx, p, sz, t) {
      shadow(ctx, p, sz, 0.25, 0.1);
      // Mortar base
      ctx.fillStyle = '#444';
      ctx.fillRect(p.x - sz * 0.15, p.y - sz * 0.15, sz * 0.3, sz * 0.15);
      // Mortar tube angled up
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.15);
      ctx.rotate(-Math.PI / 3 + Math.sin(t.angle) * 0.2);
      const g = ctx.createLinearGradient(0, -sz * 0.08, 0, sz * 0.08);
      g.addColorStop(0, t.color);
      g.addColorStop(0.5, '#fff');
      g.addColorStop(1, t.color);
      ctx.fillStyle = g;
      ctx.fillRect(-sz * 0.08, -sz * 0.18, sz * 0.16, sz * 0.18);
      // Opening
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(0, -sz * 0.18, sz * 0.07, sz * 0.025, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    meteor(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Ringed platform
      ctx.fillStyle = '#3a2a4a';
      ctx.fillRect(p.x - sz * 0.16, p.y - sz * 0.1, sz * 0.32, sz * 0.1);
      // Spinning ring disc
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.15);
      ctx.rotate(Date.now() * 0.003);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = sz * 0.04;
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.14, 0, TAU);
      ctx.stroke();
      // Inner glyph
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * sz * 0.14, Math.sin(a) * sz * 0.14, sz * 0.02, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      // Center beam pointing up
      ctx.fillStyle = `rgba(255,200,100,${0.4 + Math.sin(Date.now() * 0.005) * 0.2})`;
      ctx.fillRect(p.x - sz * 0.03, p.y - sz * 0.5, sz * 0.06, sz * 0.35);
      levelPips(ctx, p, sz, t);
    },

    inferno(ctx, p, sz, t) {
      shadow(ctx, p, sz, 0.25, 0.12);
      // Volcanic base (jagged)
      ctx.fillStyle = '#4a1a0a';
      ctx.beginPath();
      ctx.moveTo(p.x - sz * 0.2, p.y);
      ctx.lineTo(p.x - sz * 0.18, p.y - sz * 0.15);
      ctx.lineTo(p.x - sz * 0.1, p.y - sz * 0.2);
      ctx.lineTo(p.x + sz * 0.05, p.y - sz * 0.25);
      ctx.lineTo(p.x + sz * 0.15, p.y - sz * 0.18);
      ctx.lineTo(p.x + sz * 0.2, p.y);
      ctx.closePath();
      ctx.fill();
      // Lava core (glowing)
      const pulse = (Math.sin(Date.now() * 0.008) + 1) * 0.5;
      const g = ctx.createRadialGradient(p.x, p.y - sz * 0.2, 0, p.x, p.y - sz * 0.2, sz * 0.15);
      g.addColorStop(0, '#ffff66');
      g.addColorStop(0.4, t.color);
      g.addColorStop(1, '#660000');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.2, sz * 0.08 + pulse * sz * 0.03, 0, TAU);
      ctx.fill();
      levelPips(ctx, p, sz, t);
    },

    poison(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Flask base
      ctx.fillStyle = '#2a3a2a';
      ctx.fillRect(p.x - sz * 0.1, p.y - sz * 0.12, sz * 0.2, sz * 0.12);
      // Flask body (round bottom, narrow neck)
      ctx.fillStyle = '#1a2a1a';
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.25, sz * 0.14, 0, TAU);
      ctx.fill();
      // Toxic liquid (with bubble animation)
      const bubble = Math.sin(Date.now() * 0.005) * sz * 0.02;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.25, sz * 0.11, 0, TAU);
      ctx.fill();
      // Bubbles
      ctx.fillStyle = '#aaff88';
      ctx.beginPath();
      ctx.arc(p.x - sz * 0.04, p.y - sz * 0.3 + bubble, sz * 0.02, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x + sz * 0.03, p.y - sz * 0.32 - bubble, sz * 0.015, 0, TAU);
      ctx.fill();
      // Spout (rotating)
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.35);
      ctx.rotate(t.angle);
      ctx.fillStyle = '#444';
      ctx.fillRect(0, -sz * 0.03, sz * 0.12, sz * 0.06);
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    knockback(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Compressed air tank base
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - sz * 0.1, sz * 0.16, sz * 0.1, 0, 0, TAU);
      ctx.fill();
      bodyGradient(ctx, p, sz, t.color, 0.18, 0.3);
      // Piston cylinder
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.2);
      ctx.rotate(t.angle);
      ctx.fillStyle = '#666';
      ctx.fillRect(0, -sz * 0.08, sz * 0.16, sz * 0.16);
      ctx.fillStyle = '#222';
      ctx.fillRect(sz * 0.13, -sz * 0.1, sz * 0.06, sz * 0.2);
      // Air ring
      ctx.strokeStyle = '#fff8';
      ctx.lineWidth = sz * 0.015;
      ctx.beginPath();
      ctx.arc(sz * 0.2, 0, sz * 0.08, 0, TAU);
      ctx.stroke();
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    web(ctx, p, sz, t) {
      shadow(ctx, p, sz, 0.28, 0.1);
      // Spider-like tripod legs
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = sz * 0.025;
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - sz * 0.2);
        ctx.lineTo(p.x + Math.cos(a) * sz * 0.18, p.y - sz * 0.1);
        ctx.lineTo(p.x + Math.cos(a) * sz * 0.22, p.y + sz * 0.02);
        ctx.stroke();
      }
      // Spinneret body
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.22, sz * 0.12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff8';
      ctx.beginPath();
      ctx.arc(p.x - sz * 0.04, p.y - sz * 0.26, sz * 0.04, 0, TAU);
      ctx.fill();
      // Web strand indicator
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.22);
      ctx.rotate(t.angle);
      ctx.fillStyle = '#fff6';
      ctx.fillRect(0, -sz * 0.01, sz * 0.18, sz * 0.02);
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    seismic(ctx, p, sz, t) {
      shadow(ctx, p, sz, 0.3, 0.12);
      // Anvil base
      ctx.fillStyle = '#333';
      ctx.fillRect(p.x - sz * 0.18, p.y - sz * 0.05, sz * 0.36, sz * 0.05);
      ctx.fillStyle = '#555';
      ctx.fillRect(p.x - sz * 0.14, p.y - sz * 0.15, sz * 0.28, sz * 0.1);
      // Hammer post
      bodyGradient(ctx, p, sz, t.color, 0.08, 0.35);
      // Hammer head (animates with attack)
      const hammerY = p.y - sz * 0.4 + Math.sin(Date.now() * 0.01) * sz * 0.03;
      ctx.fillStyle = '#222';
      ctx.fillRect(p.x - sz * 0.15, hammerY, sz * 0.3, sz * 0.12);
      ctx.fillStyle = t.color;
      ctx.fillRect(p.x - sz * 0.13, hammerY + sz * 0.02, sz * 0.26, sz * 0.04);
      levelPips(ctx, p, sz, t);
    },

    gravity(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Floating ring base
      ctx.fillStyle = '#221133';
      ctx.fillRect(p.x - sz * 0.12, p.y - sz * 0.15, sz * 0.24, sz * 0.15);
      // Floating orb (with orbital ring)
      const orbY = p.y - sz * 0.3 + Math.sin(Date.now() * 0.004) * sz * 0.03;
      ctx.save();
      ctx.translate(p.x, orbY);
      ctx.rotate(Date.now() * 0.005);
      // Outer ring (perspective ellipse)
      ctx.strokeStyle = t.color;
      ctx.lineWidth = sz * 0.02;
      ctx.beginPath();
      ctx.ellipse(0, 0, sz * 0.16, sz * 0.05, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
      // Core orb
      const g = ctx.createRadialGradient(p.x - sz * 0.02, orbY - sz * 0.02, 0, p.x, orbY, sz * 0.1);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.3, t.color);
      g.addColorStop(1, '#000');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, orbY, sz * 0.1, 0, TAU);
      ctx.fill();
      levelPips(ctx, p, sz, t);
    },

    reflect(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Pedestal
      ctx.fillStyle = '#2a3a4a';
      ctx.fillRect(p.x - sz * 0.1, p.y - sz * 0.18, sz * 0.2, sz * 0.18);
      // Prism (diamond shape) - rotates with target
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.3);
      ctx.rotate(t.angle + Math.PI / 4);
      // Diamond
      const g = ctx.createLinearGradient(-sz * 0.1, -sz * 0.1, sz * 0.1, sz * 0.1);
      g.addColorStop(0, '#aaffff');
      g.addColorStop(0.5, t.color);
      g.addColorStop(1, '#0088aa');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -sz * 0.13);
      ctx.lineTo(sz * 0.13, 0);
      ctx.lineTo(0, sz * 0.13);
      ctx.lineTo(-sz * 0.13, 0);
      ctx.closePath();
      ctx.fill();
      // Reflective shine
      ctx.fillStyle = '#fff8';
      ctx.beginPath();
      ctx.moveTo(0, -sz * 0.1);
      ctx.lineTo(sz * 0.04, -sz * 0.04);
      ctx.lineTo(-sz * 0.02, sz * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    summoner(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Totem base (stacked discs)
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i % 2 ? '#5a3a2a' : '#3a2a1a';
        ctx.fillRect(p.x - sz * (0.14 - i * 0.02), p.y - sz * (0.1 + i * 0.08), sz * (0.28 - i * 0.04), sz * 0.08);
      }
      // Skull on top
      ctx.fillStyle = '#ddccaa';
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.4, sz * 0.1, 0, TAU);
      ctx.fill();
      // Eye sockets (glowing)
      const pulse = (Math.sin(Date.now() * 0.008) + 1) * 0.5;
      ctx.fillStyle = `rgba(80,255,80,${0.6 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(p.x - sz * 0.035, p.y - sz * 0.41, sz * 0.022, 0, TAU);
      ctx.arc(p.x + sz * 0.035, p.y - sz * 0.41, sz * 0.022, 0, TAU);
      ctx.fill();
      // Jaw
      ctx.fillStyle = '#bbaa88';
      ctx.fillRect(p.x - sz * 0.06, p.y - sz * 0.34, sz * 0.12, sz * 0.04);
      levelPips(ctx, p, sz, t);
    },

    temporal(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Tall spire base
      bodyGradient(ctx, p, sz, t.color, 0.14, 0.3);
      // Hourglass on top
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.35);
      const sway = Math.sin(Date.now() * 0.003) * 0.1;
      ctx.rotate(sway);
      // Top half
      ctx.fillStyle = '#88ffff';
      ctx.beginPath();
      ctx.moveTo(-sz * 0.08, -sz * 0.1);
      ctx.lineTo(sz * 0.08, -sz * 0.1);
      ctx.lineTo(sz * 0.02, 0);
      ctx.lineTo(-sz * 0.02, 0);
      ctx.closePath();
      ctx.fill();
      // Bottom half
      ctx.beginPath();
      ctx.moveTo(-sz * 0.02, 0);
      ctx.lineTo(sz * 0.02, 0);
      ctx.lineTo(sz * 0.08, sz * 0.1);
      ctx.lineTo(-sz * 0.08, sz * 0.1);
      ctx.closePath();
      ctx.fill();
      // Frame
      ctx.strokeStyle = '#ddaa44';
      ctx.lineWidth = sz * 0.015;
      ctx.beginPath();
      ctx.moveTo(-sz * 0.08, -sz * 0.1);
      ctx.lineTo(sz * 0.08, -sz * 0.1);
      ctx.lineTo(-sz * 0.08, sz * 0.1);
      ctx.lineTo(sz * 0.08, sz * 0.1);
      ctx.stroke();
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    aqua(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Fountain basin
      ctx.fillStyle = '#1a3a5a';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - sz * 0.05, sz * 0.18, sz * 0.06, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2a5a8a';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - sz * 0.07, sz * 0.16, sz * 0.05, 0, 0, TAU);
      ctx.fill();
      // Central column
      ctx.fillStyle = t.color;
      ctx.fillRect(p.x - sz * 0.04, p.y - sz * 0.3, sz * 0.08, sz * 0.25);
      // Water spout (animated)
      const splash = Math.sin(Date.now() * 0.01) * sz * 0.02;
      ctx.fillStyle = `rgba(120,220,255,0.7)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.35 + splash, sz * 0.08, 0, TAU);
      ctx.fill();
      // Droplets
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(a) * sz * 0.1, p.y - sz * 0.32 + Math.sin(a) * sz * 0.04, sz * 0.02, 0, TAU);
        ctx.fill();
      }
      levelPips(ctx, p, sz, t);
    },

    spike(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Box base
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(p.x - sz * 0.14, p.y - sz * 0.15, sz * 0.28, sz * 0.15);
      // Spike launcher (multiple spikes pointing up)
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.15);
      ctx.rotate(t.angle);
      // Main spike
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.moveTo(0, -sz * 0.05);
      ctx.lineTo(sz * 0.25, -sz * 0.01);
      ctx.lineTo(sz * 0.25, sz * 0.01);
      ctx.lineTo(0, sz * 0.05);
      ctx.closePath();
      ctx.fill();
      // Side spikes
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.moveTo(0, -sz * 0.08);
      ctx.lineTo(sz * 0.18, -sz * 0.04);
      ctx.lineTo(0, -sz * 0.02);
      ctx.closePath();
      ctx.moveTo(0, sz * 0.08);
      ctx.lineTo(sz * 0.18, sz * 0.04);
      ctx.lineTo(0, sz * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      levelPips(ctx, p, sz, t);
    },

    void(ctx, p, sz, t) {
      shadow(ctx, p, sz);
      // Dark portal base
      ctx.fillStyle = '#1a0a1a';
      ctx.fillRect(p.x - sz * 0.14, p.y - sz * 0.12, sz * 0.28, sz * 0.12);
      // Portal ring (rotating)
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.25);
      ctx.rotate(Date.now() * 0.004);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = sz * 0.025;
      // Dashed dark ring
      ctx.setLineDash([sz * 0.05, sz * 0.03]);
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.15, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // Black void center (swirling)
      const g = ctx.createRadialGradient(p.x, p.y - sz * 0.25, 0, p.x, p.y - sz * 0.25, sz * 0.13);
      g.addColorStop(0, '#000');
      g.addColorStop(0.6, t.color + '88');
      g.addColorStop(1, t.color + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y - sz * 0.25, sz * 0.13, 0, TAU);
      ctx.fill();
      levelPips(ctx, p, sz, t);
    },

    flak(ctx, p, sz, t) {
      shadow(ctx, p, sz, 0.25, 0.1);
      // Wide base (anti-air mount)
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - sz * 0.08, sz * 0.2, sz * 0.08, 0, 0, TAU);
      ctx.fill();
      // Turret housing
      ctx.fillStyle = t.color;
      ctx.fillRect(p.x - sz * 0.12, p.y - sz * 0.22, sz * 0.24, sz * 0.16);
      // Twin barrels
      ctx.save();
      ctx.translate(p.x, p.y - sz * 0.2);
      ctx.rotate(t.angle);
      ctx.fillStyle = '#222';
      ctx.fillRect(0, -sz * 0.08, sz * 0.22, sz * 0.05);
      ctx.fillRect(0, sz * 0.03, sz * 0.22, sz * 0.05);
      // Muzzles
      ctx.fillStyle = '#000';
      ctx.fillRect(sz * 0.2, -sz * 0.09, sz * 0.04, sz * 0.06);
      ctx.fillRect(sz * 0.2, sz * 0.03, sz * 0.04, sz * 0.06);
      ctx.restore();
      levelPips(ctx, p, sz, t);
    }
  };

  // Default fallback (uses basic model)
  function render(ctx, p, sz, t) {
    const model = models[t.model || t.type] || models.basic;
    model(ctx, p, sz, t);
  }

  window.NimTD = window.NimTD || {};
  window.NimTD.towerModels = { models, render };
})();
