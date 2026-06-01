(function () {
  const towers = {
    // ===== EXISTING 7 (kept intact, only minor polish) =====
    basic: {
      name: 'Basic Tower', model: 'basic', icon: 'B', color: '#88aacc',
      cost: 50, damage: 12, range: 140, fireRate: 60,
      projectileSpeed: 7, projectileColor: '#ffcc44', projectileSize: 3, projectileCount: 1,
      effect: 'direct', description: 'Balanced rate of fire and damage',
      upgradeCosts: [75, 150, 300, 600], upgradeDamage: [8, 12, 18, 28],
      upgradeRange: [15, 20, 25, 35], upgradeFireRate: [-8, -10, -12, -15]
    },
    cannon: {
      name: 'Cannon Tower', model: 'cannon', icon: 'C', color: '#dd6644',
      cost: 100, damage: 60, range: 120, fireRate: 180,
      projectileSpeed: 4, projectileColor: '#ff4422', projectileSize: 6, projectileCount: 1,
      effect: 'flame', aoeRadius: 70, aoeDuration: 200, burnDamage: 18,
      description: 'Heavy flame blast and burning ground',
      upgradeCosts: [125, 250, 500, 1000], upgradeDamage: [25, 40, 60, 100],
      upgradeRange: [10, 15, 20, 30], upgradeFireRate: [-20, -25, -30, -40]
    },
    sniper: {
      name: 'Sniper Tower', model: 'sniper', icon: 'S', color: '#44cc88',
      cost: 150, damage: 80, range: 250, fireRate: 150,
      projectileSpeed: 18, projectileColor: '#00ff88', projectileSize: 2, projectileCount: 1,
      effect: 'direct', description: 'Slow fire, extreme range and damage',
      upgradeCosts: [150, 300, 600, 1200], upgradeDamage: [35, 55, 80, 130],
      upgradeRange: [20, 30, 40, 60], upgradeFireRate: [-15, -20, -25, -35]
    },
    tesla: {
      name: 'Tesla Tower', model: 'tesla', icon: 'T', color: '#4488ff',
      cost: 180, damage: 8, range: 130, fireRate: 20,
      projectileSpeed: 14, projectileColor: '#88ccff', projectileSize: 2, projectileCount: 1,
      effect: 'chain', chainCount: 3, chainRange: 70,
      description: 'Fast chain lightning attacks',
      upgradeCosts: [100, 200, 400, 800], upgradeDamage: [5, 8, 12, 18],
      upgradeRange: [10, 15, 20, 30], upgradeFireRate: [-3, -4, -5, -7]
    },
    magic: {
      name: 'Magic Tower', model: 'magic', icon: 'M', color: '#cc44cc',
      cost: 130, damage: 15, range: 145, fireRate: 40,
      projectileSpeed: 8, projectileColor: '#cc44ff', projectileSize: 5, projectileCount: 1,
      effect: 'trail', description: 'Purple energy ball with particle trail',
      upgradeCosts: [90, 180, 360, 720], upgradeDamage: [10, 16, 25, 40],
      upgradeRange: [12, 18, 25, 35], upgradeFireRate: [-5, -8, -10, -14]
    },
    frost: {
      name: 'Frost Breath', model: 'frost', icon: 'F', color: '#66ccff',
      cost: 145, damage: 10, range: 135, fireRate: 28,
      projectileSpeed: 10, projectileColor: '#aaddff', projectileSize: 4, projectileCount: 1,
      effect: 'frost', slowDuration: 130,
      description: 'Freezing breath slows creeps',
      upgradeCosts: [95, 190, 380, 760], upgradeDamage: [7, 10, 15, 22],
      upgradeRange: [10, 15, 20, 25], upgradeFireRate: [-3, -4, -5, -6]
    },
    star: {
      name: 'Star Stroke', model: 'star', icon: '*', color: '#ffdd66',
      cost: 175, damage: 24, range: 165, fireRate: 72,
      projectileSpeed: 11, projectileColor: '#fff0aa', projectileSize: 5, projectileCount: 1,
      effect: 'star', stunDuration: 120,
      description: 'Star impact stuns creeps for two seconds',
      upgradeCosts: [120, 240, 480, 960], upgradeDamage: [10, 15, 22, 34],
      upgradeRange: [12, 18, 24, 30], upgradeFireRate: [-5, -7, -9, -12]
    },

    // ===== NEW 18 TOWERS =====
    laser: {
      name: 'Laser Tower', model: 'laser', icon: 'L', color: '#ff3344',
      cost: 220, damage: 35, range: 180, fireRate: 50,
      projectileSpeed: 24, projectileColor: '#ff4444', projectileSize: 3, projectileCount: 1,
      effect: 'laser', critChance: 0.3,
      description: 'High-velocity laser with 30% crit chance',
      upgradeCosts: [180, 360, 720, 1440], upgradeDamage: [20, 30, 45, 70],
      upgradeRange: [15, 22, 30, 40], upgradeFireRate: [-5, -8, -10, -14]
    },
    gunner: {
      name: 'Gunner Tower', model: 'gunner', icon: 'G', color: '#aa8866',
      cost: 165, damage: 6, range: 125, fireRate: 12,
      projectileSpeed: 12, projectileColor: '#ffaa33', projectileSize: 2, projectileCount: 1,
      effect: 'direct',
      description: 'Rapid-fire gatling, tons of small bullets',
      upgradeCosts: [110, 220, 440, 880], upgradeDamage: [4, 6, 9, 14],
      upgradeRange: [8, 12, 16, 22], upgradeFireRate: [-2, -3, -3, -4]
    },
    crossbow: {
      name: 'Crossbow Tower', model: 'crossbow', icon: 'X', color: '#aa6633',
      cost: 80, damage: 28, range: 170, fireRate: 75,
      projectileSpeed: 16, projectileColor: '#dd9955', projectileSize: 3, projectileCount: 1,
      effect: 'piercing',
      description: 'Bolt pierces through multiple enemies',
      upgradeCosts: [70, 140, 280, 560], upgradeDamage: [15, 22, 35, 55],
      upgradeRange: [15, 22, 30, 42], upgradeFireRate: [-8, -10, -14, -18]
    },
    bomb: {
      name: 'Bomb Tower', model: 'bomb', icon: 'O', color: '#776644',
      cost: 140, damage: 45, range: 150, fireRate: 120,
      projectileSpeed: 6, projectileColor: '#222222', projectileSize: 7, projectileCount: 1,
      effect: 'flame', aoeRadius: 90, aoeDuration: 100, burnDamage: 12,
      description: 'Lobs explosives with massive blast radius',
      upgradeCosts: [110, 220, 440, 880], upgradeDamage: [22, 35, 50, 80],
      upgradeRange: [12, 18, 24, 34], upgradeFireRate: [-12, -18, -22, -30]
    },
    meteor: {
      name: 'Meteor Tower', model: 'meteor', icon: 'M', color: '#ff8833',
      cost: 280, damage: 70, range: 200, fireRate: 200,
      projectileSpeed: 9, projectileColor: '#ff6600', projectileSize: 8, projectileCount: 1,
      effect: 'flame', aoeRadius: 110, aoeDuration: 240, burnDamage: 25,
      description: 'Calls meteors that scorch the earth',
      upgradeCosts: [200, 400, 800, 1600], upgradeDamage: [30, 50, 75, 120],
      upgradeRange: [18, 26, 36, 50], upgradeFireRate: [-22, -28, -36, -48]
    },
    inferno: {
      name: 'Inferno Tower', model: 'inferno', icon: 'I', color: '#ff2200',
      cost: 320, damage: 18, range: 110, fireRate: 8,
      projectileSpeed: 9, projectileColor: '#ff5500', projectileSize: 4, projectileCount: 1,
      effect: 'radiation', radiationStart: 30, radiationMax: 100, radiationRate: 1.5, radiationDuration: 60,
      description: 'Constant volcanic eruptions, expanding heat',
      upgradeCosts: [200, 400, 800, 1600], upgradeDamage: [10, 16, 24, 38],
      upgradeRange: [8, 14, 20, 28], upgradeFireRate: [-1, -2, -2, -3]
    },
    poison: {
      name: 'Poison Tower', model: 'poison', icon: 'P', color: '#44dd44',
      cost: 160, damage: 8, range: 145, fireRate: 45,
      projectileSpeed: 8, projectileColor: '#66ff44', projectileSize: 4, projectileCount: 1,
      effect: 'poison', poisonDamage: 4, poisonDuration: 180, poisonStack: 1,
      description: 'Toxic clouds that stack damage over time',
      upgradeCosts: [110, 220, 440, 880], upgradeDamage: [5, 8, 12, 20],
      upgradeRange: [10, 16, 22, 32], upgradeFireRate: [-4, -6, -8, -12]
    },
    knockback: {
      name: 'Knockback Tower', model: 'knockback', icon: 'K', color: '#ff9944',
      cost: 135, damage: 15, range: 105, fireRate: 55,
      projectileSpeed: 10, projectileColor: '#ffaa66', projectileSize: 5, projectileCount: 1,
      effect: 'knockback', knockbackForce: 6,
      description: 'Pushes creeps away, delays the rush',
      upgradeCosts: [90, 180, 360, 720], upgradeDamage: [8, 12, 18, 28],
      upgradeRange: [8, 12, 16, 22], upgradeFireRate: [-5, -7, -10, -14]
    },
    web: {
      name: 'Web Tower', model: 'web', icon: 'W', color: '#ccaa33',
      cost: 170, damage: 12, range: 140, fireRate: 70,
      projectileSpeed: 7, projectileColor: '#ffeeaa', projectileSize: 5, projectileCount: 1,
      effect: 'web', webRadius: 100, webDuration: 160, webSlow: 0.45,
      description: 'Casts huge slow zones',
      upgradeCosts: [120, 240, 480, 960], upgradeDamage: [6, 10, 14, 22],
      upgradeRange: [10, 16, 22, 30], upgradeFireRate: [-6, -9, -12, -16]
    },
    seismic: {
      name: 'Seismic Tower', model: 'seismic', icon: 'Q', color: '#aa8844',
      cost: 240, damage: 32, range: 100, fireRate: 110,
      projectileSpeed: 5, projectileColor: '#aa7733', projectileSize: 8, projectileCount: 1,
      effect: 'seismic', seismicRadius: 130, seismicStun: 90,
      description: 'Earthquake stuns nearby creeps',
      upgradeCosts: [170, 340, 680, 1360], upgradeDamage: [16, 24, 36, 55],
      upgradeRange: [8, 14, 18, 26], upgradeFireRate: [-10, -15, -20, -28]
    },
    gravity: {
      name: 'Gravity Tower', model: 'gravity', icon: 'V', color: '#7744ff',
      cost: 260, damage: 14, range: 160, fireRate: 50,
      projectileSpeed: 8, projectileColor: '#aa88ff', projectileSize: 4, projectileCount: 1,
      effect: 'gravity', gravityForce: 4,
      description: 'Pulls creeps back towards the tower',
      upgradeCosts: [180, 360, 720, 1440], upgradeDamage: [8, 12, 18, 28],
      upgradeRange: [12, 18, 26, 38], upgradeFireRate: [-5, -7, -10, -14]
    },
    reflect: {
      name: 'Reflect Tower', model: 'reflect', icon: 'R', color: '#44ffff',
      cost: 200, damage: 22, range: 155, fireRate: 65,
      projectileSpeed: 13, projectileColor: '#88ffff', projectileSize: 4, projectileCount: 1,
      effect: 'reflect',
      description: 'Prism shots that bounce off enemies',
      upgradeCosts: [140, 280, 560, 1120], upgradeDamage: [12, 18, 28, 42],
      upgradeRange: [12, 18, 25, 35], upgradeFireRate: [-6, -9, -12, -16]
    },
    summoner: {
      name: 'Summoner Tower', model: 'summoner', icon: 'U', color: '#88dd44',
      cost: 300, damage: 20, range: 140, fireRate: 90,
      projectileSpeed: 7, projectileColor: '#88ff44', projectileSize: 5, projectileCount: 1,
      effect: 'summon', summonCount: 2,
      description: 'Summons spirit minions on each hit',
      upgradeCosts: [220, 440, 880, 1760], upgradeDamage: [12, 18, 28, 42],
      upgradeRange: [10, 15, 22, 32], upgradeFireRate: [-8, -12, -16, -22]
    },
    temporal: {
      name: 'Temporal Tower', model: 'temporal', icon: 'H', color: '#88ffff',
      cost: 350, damage: 16, range: 155, fireRate: 60,
      projectileSpeed: 12, projectileColor: '#ccffff', projectileSize: 4, projectileCount: 1,
      effect: 'frost', slowDuration: 200,
      description: 'Time-distortion bolts, long slow effect',
      upgradeCosts: [250, 500, 1000, 2000], upgradeDamage: [10, 14, 22, 34],
      upgradeRange: [12, 18, 26, 36], upgradeFireRate: [-6, -9, -12, -16]
    },
    aqua: {
      name: 'Aqua Tower', model: 'aqua', icon: 'A', color: '#3399ff',
      cost: 120, damage: 14, range: 130, fireRate: 35,
      projectileSpeed: 11, projectileColor: '#66bbff', projectileSize: 4, projectileCount: 1,
      effect: 'knockback', knockbackForce: 3,
      description: 'Pressurized water gun, light pushback',
      upgradeCosts: [85, 170, 340, 680], upgradeDamage: [9, 14, 22, 34],
      upgradeRange: [10, 15, 22, 30], upgradeFireRate: [-3, -5, -7, -10]
    },
    spike: {
      name: 'Spike Tower', model: 'spike', icon: 'Y', color: '#cc4422',
      cost: 95, damage: 22, range: 135, fireRate: 35,
      projectileSpeed: 15, projectileColor: '#dd6633', projectileSize: 3, projectileCount: 3,
      effect: 'piercing', spread: 0.4,
      description: 'Fires 3 piercing spikes in a spread',
      upgradeCosts: [80, 160, 320, 640], upgradeDamage: [12, 18, 28, 44],
      upgradeRange: [10, 16, 22, 32], upgradeFireRate: [-3, -5, -7, -10]
    },
    void: {
      name: 'Void Tower', model: 'void', icon: 'Z', color: '#aa44ff',
      cost: 380, damage: 50, range: 170, fireRate: 95,
      projectileSpeed: 9, projectileColor: '#cc66ff', projectileSize: 6, projectileCount: 1,
      effect: 'radiation', radiationStart: 50, radiationMax: 150, radiationRate: 3, radiationDuration: 100,
      description: 'Dark energy that consumes everything',
      upgradeCosts: [280, 560, 1120, 2240], upgradeDamage: [25, 40, 60, 95],
      upgradeRange: [15, 22, 32, 45], upgradeFireRate: [-10, -14, -18, -25]
    },
    flak: {
      name: 'Flak Tower', model: 'flak', icon: 'N', color: '#446655',
      cost: 190, damage: 18, range: 160, fireRate: 30,
      projectileSpeed: 13, projectileColor: '#ddcc88', projectileSize: 2, projectileCount: 4,
      effect: 'direct', spread: 0.6,
      description: 'Twin barrels spray flak in a wide arc',
      upgradeCosts: [130, 260, 520, 1040], upgradeDamage: [10, 15, 22, 34],
      upgradeRange: [12, 18, 25, 35], upgradeFireRate: [-3, -5, -7, -10]
    }
  };

  window.NimTD = { ...(window.NimTD || {}), towers };
})();
