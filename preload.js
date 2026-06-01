const { contextBridge, ipcRenderer } = require('electron');
const MAP_EXTENSION = '.nimmaps';

function send(channel, ...args) {
  const result = ipcRenderer.sendSync(channel, ...args);
  if (!result?.ok) throw new Error(result?.error || `NimTD IPC failed: ${channel}`);
  return result.value;
}

contextBridge.exposeInMainWorld('electronAPI', { maps: {
  list() { return send('maps:list'); },
  save(name, data) { return send('maps:save', name, data); },
  setDefault(data) { return send('maps:set-default', data); },
  loadDefault() { return send('maps:load-default'); },
  load(name) { return send('maps:load', name); },
  delete(name) { return send('maps:delete', name); },
  folder() { return send('maps:folder'); },
  choose() { return send('maps:choose'); },
  openFolder() { return ipcRenderer.invoke('maps:open-folder'); },
  extension() { return MAP_EXTENSION; },
}});
