# NimTD — terminus.globalwarningnetworks.com

Customizable pseudo-isometric tower-defense game engine with an integrated map editor and tower creator. Distributed as a Windows desktop app via Electron.

## Tech Stack

- **JavaScript (ES6+)** — entire codebase, no transpilation
- **Electron 42.3.0** — desktop shell, IPC, file I/O
- **Canvas 2D API** — all game rendering (isometric projection, sprites, particles)
- **Web Audio API** — procedural music and sound effects
- **electron-builder 26.8.1** — Windows NSIS installer packaging

No external UI frameworks. All rendering is hand-coded Canvas and DOM.

## Commands

```bash
npm install          # Install dependencies

npm start            # Launch full app (menu → game)
npm run editor       # Open map/tower editor directly
npm run game         # Launch game directly

npm run pack:win     # Unpacked Windows build → dist/
npm run dist:win     # NSIS installer → dist/NimTD-Setup-1.0.1-x64.exe
```

No automated test suite — testing is manual. The editor has a "Play test" button to run maps in-game.

## Project Structure

```
index.html           # Main menu
game.html            # Game shell
editor.html          # Map & tower editor
electron-main.js     # Electron lifecycle, splash, IPC handlers, map file I/O
preload.js           # Context bridge for Electron IPC
js/
  engine.js          # Game loop, tower targeting, enemy AI, projectile collision
  editor.js          # Map editor UI, tower creator modal, JSON import/export
  towers.js          # 7 base tower definitions
  effects.js         # 16 projectile effect handlers
  tower-models.js    # 25 tower visual models and custom color rendering
  sound.js           # Audio manager, 40+ OGG files, volume persistence
  audio-hooks.js     # Game event → SFX bindings
  audio-ui.js        # Volume widget (master/music/sfx sliders, mute)
  menu.js            # Main menu logic
  game-config.js     # Default map, tile types, base game values
sounds/
  music/             # menu.ogg, battle.ogg, victory.ogg, defeat.ogg
  sfx/               # UI and gameplay sound effects (~15 files)
  towers/            # Per-tower fire sounds (24 types)
maps/                # User-created .nimmaps files
NimTdPatch/          # Extended tower/effect definitions and integration guide
  INTEGRATION.md     # How to add new tower models and effects
splash/              # Splash screen HTML, logo, font
build/               # Windows build resources (icon)
```

## Map Format

Maps are `.nimmaps` JSON files (version 4):

```json
{
  "version": 4,
  "name": "Map Name",
  "width": 42,
  "height": 30,
  "tiles": [[0, 1, 2, ...]],   // GRASS=0 PATH=1 BLOCK=2 START=3 END=4
  "path": [[col, row], ...],
  "cameraStart": { "col": 0, "row": 0 },
  "game": { "waves": 50, "enemiesPerWave": 6, ... },
  "towers": { "basic": { name, cost, damage, range, fireRate, ... }, ... }
}
```

Maps are stored in `%AppData%/NimTD/maps/` (production) or the project root `maps/` folder (dev).

## IPC Channels (Electron)

| Channel | Description |
|---|---|
| `maps:list` | List all `.nimmaps` files |
| `maps:save` | Write map JSON to disk |
| `maps:load` | Read map JSON from disk |
| `maps:delete` | Delete a map file |
| `maps:folder` | Return maps folder path |
| `maps:choose` | Open file picker dialog |
| `maps:open-folder` | Shell-open the maps folder |

## Client-Side Persistence (localStorage)

| Key | Contents |
|---|---|
| `nimtd.activeConfig` | Current game/map state |
| `nimtd.editorDraft` | In-progress editor changes |
| `nimtd.audio` | Volume preferences (master, music, sfx, muted) |

## Game Mechanics

- **Enemies**: 5+ types (basic, fast, tank, healer, boss) with per-wave HP/speed scaling
- **Towers**: 7 base towers + up to 32 custom towers per map; 5 upgrade levels each
- **Effects**: 16 projectile types — direct, flame, frost, chain lightning, poison, web, seismic, radiation, gravity, laser, piercing, reflect, summon, knockback, star, trail
- **Economy**: Gold collection, tower costs, upgrades, 60% refund on sell
- **Waves**: Up to 50 waves, configurable spawn pacing and difficulty scaling
- **Camera**: Pan (WASD / arrow keys), zoom (mouse wheel), isometric projection

## Adding New Towers / Effects

See `NimTdPatch/INTEGRATION.md` for the full guide. The patch directory contains drop-in replacements for `tower-models.js`, `effects.js`, and `towers.js` that extend the base 7 towers to 25.
