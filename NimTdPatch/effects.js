(function () {
  const registry = {
    direct: { label: 'Direct hit' },
    trail: { label: 'Energy trail' },
    flame: { label: 'Flame thrower' },
    frost: { label: 'Frost breath' },
    chain: { label: 'Chain lightning' },
    star: { label: 'Star stroke' },
    poison: { label: 'Poison cloud' },
    knockback: { label: 'Knockback blast' },
    web: { label: 'Web entangle' },
    seismic: { label: 'Seismic shock' },
    piercing: { label: 'Piercing beam' },
    radiation: { label: 'Radiation pulse' },
    gravity: { label: 'Gravity pull' },
    laser: { label: 'Laser crit' },
    reflect: { label: 'Reflect bounce' },
    summon: { label: 'Spawn minions' }
  };

  function hit(engine, projectile, enemy) {
    enemy.hp -= projectile.damage;
    engine.spawnParticles(projectile.x, projectile.y, projectile.color, 5);
    if (enemy.hp <= 0) engine.killEnemy(enemy, 15);
  }

  const apply = {
    direct(engine, p, e) { hit(engine, p, e); },
    
    trail(engine, p, e) { hit(engine, p, e); },
    
    flame(engine, p, e) {
      hit(engine, p, e);
      const t = p.tower;
      engine.aoeZones.push({
        x: p.x, y: p.y,
        radius: t.aoeRadius || 70,
        damage: Math.floor(p.damage * 0.4),
        duration: t.aoeDuration || 200,
        maxDuration: t.aoeDuration || 200,
        tickTimer: 0,
        tickInterval: 10
      });
      // Extra particles for impact
      for (let i = 0; i < 8; i++) {
        engine.spawnParticles(p.x + Math.random() * 40 - 20, p.y + Math.random() * 40 - 20, '#ff6633', 3);
      }
    },
    
    frost(engine, p, e) {
      hit(engine, p, e);
      e.slowed = Math.max(e.slowed, p.tower.slowDuration || 130);
      engine.spawnParticles(e.x, e.y, '#aaddff', 12);
      // Frost visual effect
      for (let i = 0; i < 6; i++) {
        engine.spawnParticles(e.x + Math.random() * 20 - 10, e.y + Math.random() * 20 - 10, '#88ccff', 2);
      }
    },
    
    chain(engine, p, e) {
      hit(engine, p, e);
      engine.chainLightning(e, p.damage * 0.5, p.tower.chainCount || 3, p.tower.chainRange || 70);
    },
    
    star(engine, p, e) {
      hit(engine, p, e);
      e.stunned = Math.max(e.stunned, p.tower.stunDuration || 120);
      engine.starEffects.push({ x: e.x, y: e.y, life: 35, maxLife: 35 });
    },
    
    poison(engine, p, e) {
      hit(engine, p, e);
      // Stack poison effect with duration
      e.poisoned = (e.poisoned || 0) + (p.tower.poisonStack || 1);
      e.poisonedDuration = Math.max(e.poisonedDuration || 0, p.tower.poisonDuration || 150);
      e.poisonedDamage = p.tower.poisonDamage || 2;
      engine.spawnParticles(e.x, e.y, '#66dd44', 10);
    },
    
    knockback(engine, p, e) {
      hit(engine, p, e);
      // Knock enemy back along path (compatible with path-following)
      const force = p.tower.knockbackForce || 1;
      if (e.pathIndex > 0) e.pathIndex = Math.max(0, e.pathIndex - Math.ceil(force / 3));
      e.stunned = Math.max(e.stunned || 0, 15);
      engine.spawnParticles(e.x, e.y, '#ff9944', 8);
    },
    
    web(engine, p, e) {
      hit(engine, p, e);
      const t = p.tower;
      // Create large slow zone
      engine.aoeZones.push({
        x: p.x, y: p.y,
        radius: t.webRadius || 100,
        duration: t.webDuration || 160,
        maxDuration: t.webDuration || 160,
        effect: 'web',
        slowAmount: t.webSlow || 0.4,
        tickTimer: 0
      });
      engine.spawnParticles(p.x, p.y, '#ddaa33', 15);
    },
    
    seismic(engine, p, e) {
      hit(engine, p, e);
      const t = p.tower;
      // Stun all enemies in radius
      const radius = t.seismicRadius || 120;
      const stunDur = t.seismicStun || 100;
      if (engine.enemies) {
        for (const enemy of engine.enemies) {
          const dx = enemy.x - p.x;
          const dy = enemy.y - p.y;
          if (dx * dx + dy * dy <= radius * radius) {
            enemy.stunned = Math.max(enemy.stunned || 0, stunDur);
          }
        }
      }
      // Visual wave effect
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        engine.spawnParticles(p.x + Math.cos(angle) * 60, p.y + Math.sin(angle) * 60, '#aa8844', 4);
      }
    },
    
    piercing(engine, p, e) {
      hit(engine, p, e);
      // Projectile continues through - handled by engine, just add visual
      engine.spawnParticles(e.x, e.y, '#ff3333', 8);
    },
    
    radiation(engine, p, e) {
      hit(engine, p, e);
      const t = p.tower;
      // Expanding damage zone
      const initialRadius = t.radiationStart || 40;
      const maxRadius = t.radiationMax || 140;
      const expandRate = t.radiationRate || 2;
      engine.aoeZones.push({
        x: p.x, y: p.y,
        radius: initialRadius,
        maxRadius: maxRadius,
        expandRate: expandRate,
        damage: Math.floor(p.damage * 0.3),
        duration: t.radiationDuration || 120,
        maxDuration: t.radiationDuration || 120,
        effect: 'radiation',
        tickTimer: 0
      });
      engine.spawnParticles(p.x, p.y, '#ff00ff', 12);
    },
    
    gravity(engine, p, e) {
      hit(engine, p, e);
      // Gravity slows enemy and briefly stuns
      e.slowed = Math.max(e.slowed, p.tower.gravityForce ? p.tower.gravityForce * 30 : 90);
      e.stunned = Math.max(e.stunned || 0, 10);
      engine.spawnParticles(e.x, e.y, '#7744ff', 10);
      // Pull effect visual - particles streaming toward tower
      const t = p.tower;
      for (let i = 0; i < 5; i++) {
        const ratio = i / 5;
        engine.spawnParticles(
          e.x + (t.x - e.x) * ratio,
          e.y + (t.y - e.y) * ratio,
          '#aa88ff', 2
        );
      }
    },
    
    laser(engine, p, e) {
      // Laser has crit chance
      const t = p.tower;
      const isCrit = Math.random() < (t.critChance || 0.25);
      const dmg = isCrit ? p.damage * 1.8 : p.damage;
      e.hp -= dmg;
      const color = isCrit ? '#ffff44' : '#ff4444';
      engine.spawnParticles(p.x, p.y, color, isCrit ? 12 : 6);
      if (e.hp <= 0) engine.killEnemy(e, 15);
    },
    
    reflect(engine, p, e) {
      hit(engine, p, e);
      // Mark enemy for reflection tracking (engine handles bounce)
      engine.spawnParticles(e.x, e.y, '#44ffff', 10);
    },
    
    summon(engine, p, e) {
      hit(engine, p, e);
      // Engine would need minion support - for now just visual
      const t = p.tower;
      for (let i = 0; i < (t.summonCount || 2); i++) {
        const angle = (i / (t.summonCount || 2)) * Math.PI * 2;
        engine.spawnParticles(
          e.x + Math.cos(angle) * 20,
          e.y + Math.sin(angle) * 20,
          '#44dd44',
          8
        );
      }
    }
  };

  window.NimTD.effects = { registry, apply };
})();
