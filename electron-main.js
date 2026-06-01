const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const MAP_EXTENSION = '.nimmaps';
const bundledMapsDir = path.join(__dirname, 'maps');
const bundledDefaultMapFile = path.join(__dirname, `default${MAP_EXTENSION}`);
const SPLASH_SIZE = 640;
const MINIMUM_SPLASH_MS = 3000;
const MAXIMUM_SPLASH_MS = 5000;
let folderOpenRequests = 0;
let splashWindow = null;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: SPLASH_SIZE,
    height: SPLASH_SIZE,
    useContentSize: true,
    frame: false,
    resizable: false,
    movable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    backgroundColor: '#020603',
    icon: path.join(__dirname, 'splash', 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'splash', 'splash-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  splashWindow.center();
  splashWindow.setMovable(false);
  splashWindow.loadFile(path.join('splash', 'splash.html'));
  splashWindow.on('closed', () => { splashWindow = null; });
  return splashWindow;
}
function sendSplashProgress(step, message) {
  try { splashWindow?.webContents.send('splash-progress', { step, message }); }
  catch {}
}
function windowReady(win) {
  return new Promise(resolve => {
    if (!win.webContents.isLoading()) resolve();
    else win.webContents.once('did-finish-load', resolve);
  });
}
async function splashWait(ms, deadline) {
  await sleep(Math.max(0, Math.min(ms, deadline - Date.now())));
}

async function openMapsFolder() {
  const mapsDir = ensureMapsDir();
  folderOpenRequests++;
  const error = await shell.openPath(mapsDir);
  if (!error) return '';
  if (process.platform === 'win32') {
    const explorer = spawn('explorer.exe', [mapsDir], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    explorer.unref();
    return '';
  }
  throw new Error(error);
}

function dataDir() { return app.isPackaged ? app.getPath('userData') : __dirname; }
function mapsDirectory() { return path.join(dataDir(), 'maps'); }
function defaultMapFile() { return path.join(dataDir(), `default${MAP_EXTENSION}`); }
function ensureMapsDir() {
  const mapsDir = mapsDirectory();
  fs.mkdirSync(mapsDir, { recursive: true });
  if (app.isPackaged && fs.existsSync(bundledMapsDir)) {
    for (const name of fs.readdirSync(bundledMapsDir).filter(supportedMapFile)) {
      const destination = path.join(mapsDir, name);
      if (!fs.existsSync(destination)) fs.copyFileSync(path.join(bundledMapsDir, name), destination);
    }
  }
  const defaultFile = defaultMapFile();
  if (app.isPackaged && !fs.existsSync(defaultFile) && fs.existsSync(bundledDefaultMapFile)) {
    fs.copyFileSync(bundledDefaultMapFile, defaultFile);
  }
  return mapsDir;
}
function safeName(name) {
  const value = String(name || 'untitled-map').trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return value || 'untitled-map';
}
function supportedMapFile(name) { return String(name).toLowerCase().endsWith(MAP_EXTENSION); }
function baseMapName(name) { return String(name || 'untitled-map').replace(/\.nimmaps$/i, ''); }
function mapPath(name) {
  const file = path.basename(String(name || ''));
  if (!supportedMapFile(file)) throw new Error('Unsupported NimTD map file.');
  return path.join(mapsDirectory(), file);
}
function reply(event, action) {
  try { event.returnValue = { ok: true, value: action() }; }
  catch (error) { event.returnValue = { ok: false, error: error.message }; }
}
function onSync(channel, action) {
  ipcMain.on(channel, (event, ...args) => reply(event, () => action(...args)));
}
function audioSmokeResultFile() {
  const argument = process.argv.find(value => value.startsWith('--smoke-audio-result='));
  return argument ? argument.slice('--smoke-audio-result='.length) : '';
}
function finishAudioSmoke(ok, message) {
  const output = `${ok ? 'OK' : 'ERROR'}: ${message}`;
  if (ok) console.log(output);
  else console.error(output);
  const resultFile = audioSmokeResultFile();
  if (resultFile) {
    try { fs.writeFileSync(resultFile, output, 'utf8'); }
    catch (error) { console.error(`Could not write audio smoke result: ${error.message}`); }
  }
  app.exit(ok ? 0 : 1);
}

function createWindow(options = {}) {
  const gameMode = process.argv.includes('--game');
  const editorMode = process.argv.includes('--editor');
  const smokeFolderButton = process.argv.includes('--smoke-folder-button');
  const smokeAudio = process.argv.includes('--smoke-audio');
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: gameMode ? 'NimTD Engine' : editorMode ? 'NimTD Map Editor' : 'NimTD',
    backgroundColor: '#0a0a14',
    icon: path.join(__dirname, 'splash', 'logo.png'),
    show: options.show ?? !(smokeFolderButton || smokeAudio),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadFile(gameMode ? 'game.html' : editorMode ? 'editor.html' : 'index.html');
  if (smokeFolderButton) win.webContents.once('did-finish-load', async () => {
    try {
      const bridge = await win.webContents.executeJavaScript("({ folder: window.electronAPI.maps.folder(), files: window.electronAPI.maps.list() })");
      if (bridge.folder !== mapsDirectory() || !Array.isArray(bridge.files)) throw new Error('Map IPC bridge did not return the NimTD maps folder.');
      await win.webContents.executeJavaScript("document.getElementById('open-folder').click()");
      setTimeout(() => {
        if (!folderOpenRequests) {
          console.error('Folder button did not reach the Electron main process.');
          app.exit(1);
          return;
        }
        console.log(`OK: ${editorMode ? 'editor' : 'menu'} folder button reached Explorer.`);
        app.exit(0);
      }, 700);
    } catch (error) {
      console.error(error);
      app.exit(1);
    }
  });
  if (smokeAudio) {
    const playAudio = "src=>new Promise(async resolve=>{const audio=new Audio(src);let started=false;const done=ok=>{clearTimeout(timer);audio.pause();resolve(ok)};const timer=setTimeout(()=>done(false),3000);audio.addEventListener('playing',()=>{started=true},{once:true});try{audio.volume=.05;await audio.play();setTimeout(()=>done(started&&(audio.currentTime>0||audio.ended)),220)}catch{done(false)}})";
    win.webContents.once('did-finish-load', async () => {
      try {
        const menu = await win.webContents.executeJavaScript(`(async()=>{const play=${playAudio};document.body.click();return{sound:typeof window.NimTD?.sound?.playMusic==='function',widget:!!document.getElementById('audio-widget'),menu:await play('sounds/music/menu.ogg'),click:await play('sounds/sfx/ui_click.ogg')}})()`, true);
        if (!menu.sound || !menu.widget || !menu.menu || !menu.click) throw new Error(`Menu audio smoke failed: ${JSON.stringify(menu)}`);
        win.webContents.once('did-finish-load', async () => {
          try {
            const game = await win.webContents.executeJavaScript(`(async()=>{const play=${playAudio};document.body.click();return{sound:typeof window.NimTD?.sound?.playTower==='function',widget:!!document.getElementById('audio-widget'),hooks:String(window.NimTD?.game?.shoot).includes('playTower'),battle:await play('sounds/music/battle.ogg'),tower:await play('sounds/towers/cannon.ogg')}})()`, true);
            if (!game.sound || !game.widget || !game.hooks || !game.battle || !game.tower) throw new Error(`Game audio smoke failed: ${JSON.stringify(game)}`);
            finishAudioSmoke(true, 'menu music, UI SFX, battle music, and tower audio played; widget and hooks loaded.');
          } catch (error) {
            finishAudioSmoke(false, error.message);
          }
        });
        win.loadFile('game.html');
      } catch (error) {
        finishAudioSmoke(false, error.message);
      }
    });
  }
  return win;
}
async function bootWithSplash() {
  const startedAt = Date.now();
  const deadline = startedAt + MAXIMUM_SPLASH_MS;
  const splash = createSplashWindow();
  await splashWait(300, deadline);
  sendSplashProgress(1, 'WORKING DIRECTORY LOCKED');
  const win = createWindow({ show: false });
  await splashWait(420, deadline);
  sendSplashProgress(2, 'ELECTRON NODE MODE CLEARED');
  await splashWait(420, deadline);
  sendSplashProgress(3, 'ELECTRON RUNTIME ONLINE');
  ensureMapsDir();
  await splashWait(420, deadline);
  sendSplashProgress(4, 'MAP STORAGE VERIFIED');
  await Promise.race([windowReady(win), splashWait(760, deadline)]);
  sendSplashProgress(5, 'LOADING NIMTD MODULES');
  await splashWait(420, deadline);
  sendSplashProgress(6, 'COMMAND CENTER READY');
  await splashWait(520, deadline);
  await splashWait(Math.max(0, MINIMUM_SPLASH_MS - (Date.now() - startedAt)), deadline);
  if (!win.isDestroyed()) win.show();
  if (!splash.isDestroyed()) splash.close();
}
onSync('maps:list', () => { const mapsDir = ensureMapsDir(); return fs.readdirSync(mapsDir).filter(supportedMapFile).sort(); });
onSync('maps:save', (name, data) => { const mapsDir = ensureMapsDir(); const file = `${safeName(baseMapName(name))}${MAP_EXTENSION}`; fs.writeFileSync(path.join(mapsDir, file), JSON.stringify(data, null, 2), 'utf8'); return file; });
onSync('maps:set-default', data => { ensureMapsDir(); const file = defaultMapFile(); fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8'); return path.basename(file); });
onSync('maps:load-default', () => { ensureMapsDir(); const file = defaultMapFile(); return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null; });
onSync('maps:load', name => { ensureMapsDir(); return JSON.parse(fs.readFileSync(mapPath(name), 'utf8')); });
onSync('maps:delete', name => { ensureMapsDir(); const file = mapPath(name); if (fs.existsSync(file)) fs.unlinkSync(file); });
onSync('maps:folder', () => ensureMapsDir());
onSync('maps:choose', () => {
  const mapsDir = ensureMapsDir();
  const files = dialog.showOpenDialogSync({
    title: 'Open NimTD Map',
    defaultPath: mapsDir,
    properties: ['openFile'],
    filters: [{ name: 'NimTD Maps', extensions: ['nimmaps'] }],
  });
  if (!files?.length) return null;
  return JSON.parse(fs.readFileSync(files[0], 'utf8'));
});
ipcMain.handle('maps:open-folder', openMapsFolder);
app.whenReady().then(async () => {
  if (process.argv.includes('--open-maps-folder')) {
    await openMapsFolder();
    setTimeout(() => app.quit(), 250);
    return;
  }
  if (process.argv.includes('--smoke-folder-button') || process.argv.includes('--smoke-audio') || process.argv.includes('--no-splash')) createWindow();
  else await bootWithSplash();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
