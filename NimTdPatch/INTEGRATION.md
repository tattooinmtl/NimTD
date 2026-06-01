// ============================================================
// INTEGRATION GUIDE — How to plug the new models into engine.js
// ============================================================

// STEP 1: Add tower-models.js to your HTML BEFORE engine.js
// In game.html (and editor.html if you want models in the editor preview):
//
//   <script src="game-config.js"></script>
//   <script src="towers.js"></script>
//   <script src="effects.js"></script>
//   <script src="tower-models.js"></script>   <!-- ADD THIS LINE -->
//   <script src="engine.js"></script>

// ============================================================
// STEP 2: Replace the tower drawing loop in engine.js draw()
// ============================================================

// FIND this line (around line 68 in your engine.js):
/*
for(const t of this.towers){const p=this.screen(t.x,t.y),sz=TILE*z;ctx.fillStyle='#444';ctx.beginPath();ctx.ellipse(p.x,p.y+sz*.15,sz*.2,sz*.1,0,0,TAU);ctx.fill();const g=ctx.createLinearGradient(p.x-sz*.12,p.y,p.x+sz*.12,p.y);g.addColorStop(0,t.color);g.addColorStop(.5,'#fff');g.addColorStop(1,t.color);ctx.fillStyle=g;ctx.fillRect(p.x-sz*.1,p.y-sz*.35,sz*.2,sz*.35);ctx.save();ctx.translate(p.x,p.y-sz*.2);ctx.rotate(t.angle);ctx.fillStyle='#666';ctx.fillRect(0,-sz*.04,sz*.18,sz*.08);ctx.restore();if(t===this.selectedTower){ctx.strokeStyle='#ffffff66';ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(p.x,p.y,t.range*z,0,TAU);ctx.stroke();ctx.setLineDash([])}}
*/

// REPLACE WITH:
/*
for(const t of this.towers){const p=this.screen(t.x,t.y),sz=TILE*z;window.NimTD.towerModels.render(ctx,p,sz,t);if(t===this.selectedTower){ctx.strokeStyle='#ffffff66';ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(p.x,p.y,t.range*z,0,TAU);ctx.stroke();ctx.setLineDash([])}}
*/

// ============================================================
// STEP 3 (Optional): Add poison damage handling in update()
// ============================================================
// To make the poison tower's DoT actually tick, find this section in update():
/*
if(e.burning>0){e.hp-=e.burnDmg*sm*.016;e.burning-=sm}
*/

// REPLACE WITH:
/*
if(e.burning>0){e.hp-=e.burnDmg*sm*.016;e.burning-=sm}
if(e.poisonedDuration>0){e.hp-=(e.poisonedDamage||2)*(e.poisoned||1)*sm*.016;e.poisonedDuration-=sm;if(e.poisonedDuration<=0){e.poisoned=0}}
*/

// ============================================================
// STEP 4 (Optional): Add web slow zone handling in update()
// ============================================================
// In the aoeZones loop, the web zones need slow handling. Replace:
/*
for(const z of this.aoeZones){z.duration-=sm;z.tickTimer-=sm;if(z.tickTimer<=0){z.tickTimer=30;for(const e of this.enemies)if(e.alive&&this.distSq(z,e)<z.radius*z.radius){e.hp-=z.damage;e.burning=60;e.burnDmg=Math.floor(z.damage*.3);this.spawnParticles(e.x,e.y,'#ff4422',3);if(e.hp<=0)this.killEnemy(e)}}}compact(this.aoeZones,z=>z.duration>0);
*/

// REPLACE WITH:
/*
for(const z of this.aoeZones){z.duration-=sm;z.tickTimer-=sm;if(z.effect==='radiation'&&z.radius<z.maxRadius)z.radius+=z.expandRate*sm;if(z.tickTimer<=0){z.tickTimer=z.tickInterval||30;for(const e of this.enemies)if(e.alive&&this.distSq(z,e)<z.radius*z.radius){if(z.effect==='web'){e.slowed=Math.max(e.slowed,40)}else{e.hp-=z.damage;e.burning=60;e.burnDmg=Math.floor(z.damage*.3);this.spawnParticles(e.x,e.y,'#ff4422',3);if(e.hp<=0)this.killEnemy(e)}}}}compact(this.aoeZones,z=>z.duration>0);
*/

// ============================================================
// STEP 5 (Optional): Add piercing projectile support
// ============================================================
// For piercing/laser/spike effects, projectiles should pass through enemies.
// Find this in update() (projectile collision check):
/*
if(hit){p.hit=true;effects.apply[p.tower.effect]?.(this,p,hit)}
*/

// REPLACE WITH:
/*
if(hit){const pierceTypes={piercing:1,laser:1,reflect:1};if(!pierceTypes[p.tower.effect]){p.hit=true}else{p.hitList=p.hitList||new Set();if(p.hitList.has(hit)){hit=null}else{p.hitList.add(hit);if(p.hitList.size>=(p.tower.pierceCount||3))p.hit=true}}if(hit)effects.apply[p.tower.effect]?.(this,p,hit)}
*/

// ============================================================
// STEP 6 (Optional): Update createEnemy() to include new state fields
// ============================================================
// Find the return at end of createEnemy() and add poisoned fields:
// Original ends with: ...slowed:0,stunned:0,burning:0,burnDmg:0}
// Change to: ...slowed:0,stunned:0,burning:0,burnDmg:0,poisoned:0,poisonedDuration:0,poisonedDamage:0}

// That's it! All 25 towers will now render with their unique models.
