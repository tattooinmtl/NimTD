(function () {
  const api = window.electronAPI?.maps, list = document.getElementById('map-list'), status = document.getElementById('menu-status');
  document.getElementById('normal-game').onclick = () => {
    const config = api?.loadDefault();
    if (config) localStorage.setItem('nimtd.activeConfig', JSON.stringify(config));
    else localStorage.removeItem('nimtd.activeConfig');
    location.href = 'game.html';
  };
  document.getElementById('editor').onclick = () => { location.href = 'editor.html'; };
  document.getElementById('open-folder').onclick = () => {
    if (!api) { status.textContent = 'Launch NimTD with launch.bat to open the maps folder.'; return; }
    api.openFolder().catch(error => { status.textContent = `Could not open maps folder: ${error.message}`; });
  };
  document.getElementById('load-map').onclick = () => {
    if (!api) { status.textContent = 'Launch NimTD with launch.bat to browse the maps folder.'; return; }
    try {
      const config = api.choose();
      if (!config) return;
      localStorage.setItem('nimtd.activeConfig', JSON.stringify(config));
      location.href = 'game.html';
    } catch (error) {
      status.textContent = `Could not load map: ${error.message}`;
    }
  };
})();
