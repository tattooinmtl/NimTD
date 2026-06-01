const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('splashAPI', {
  onProgress(callback) {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('splash-progress', handler);
    return () => ipcRenderer.removeListener('splash-progress', handler);
  },
});
