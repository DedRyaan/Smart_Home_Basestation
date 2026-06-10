const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  discoverDevices: () => ipcRenderer.send('matter:discover'),
  commissionDevice: (pairingCode) => ipcRenderer.send('matter:commission', pairingCode),
  toggleRelay: (channel, state) => ipcRenderer.send('matter:control:relay', { channel, state }),
  setFanSpeed: (percent) => ipcRenderer.send('matter:control:fanSpeed', percent),
  setAcState: (state) => ipcRenderer.send('matter:control:ac', state),
  decommissionDevice: () => ipcRenderer.send('matter:decommission'),
  
  // Event listeners
  onDeviceDiscovered: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('matter:discovered', listener);
    return () => ipcRenderer.removeListener('matter:discovered', listener);
  },
  onCommissionStatus: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('matter:commission:status', listener);
    return () => ipcRenderer.removeListener('matter:commission:status', listener);
  },
  onDeviceState: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('matter:state', listener);
    return () => ipcRenderer.removeListener('matter:state', listener);
  },
  onLogMessage: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('matter:log', listener);
    return () => ipcRenderer.removeListener('matter:log', listener);
  }
});
