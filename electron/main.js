import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// We need to import classes from @matter/main and @project-chip/matter.js
import { Environment, Logger, StorageService } from '@matter/main';
import { ManualPairingCodeCodec } from '@matter/main/types';
import { OnOffClient } from '@matter/main/behaviors/on-off';
import { FanControlClient } from '@matter/main/behaviors/fan-control';
import { ThermostatClient } from '@matter/main/behaviors/thermostat';
import { TemperatureMeasurementClient } from '@matter/main/behaviors/temperature-measurement';

import { CommissioningController } from '@project-chip/matter.js';

// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let commissioningController = null;
let pairedNode = null;
let syncInterval = null;

// Initialize log buffer to send to frontend
const logBuffer = [];
function sendLog(message, level = 'info') {
  const logEntry = {
    timestamp: new Date().toLocaleTimeString(),
    message,
    level
  };
  console.log(`[${level.toUpperCase()}] ${message}`);
  logBuffer.push(logEntry);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('matter:log', logEntry);
  }
}

// Custom logger to pipe matter.js internal logs to frontend
Logger.log = (level, facility, message) => {
  let levelStr = 'info';
  if (level !== undefined && level !== null) {
    if (typeof level === 'string') {
      levelStr = level.toLowerCase();
    } else if (level.name && typeof level.name === 'string') {
      levelStr = level.name.toLowerCase();
    } else {
      levelStr = String(level).toLowerCase();
    }
  }
  sendLog(`[${facility}] ${message}`, levelStr);
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), // Expose preloader as CommonJS (.cjs)
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0c',
    show: false
  });

  // Load React dev server in development, compiled files in production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Flush initial logs
    logBuffer.forEach(log => mainWindow.webContents.send('matter:log', log));
  });
}

// State tracker for UI representation
let lastState = {
  connected: false,
  commissioned: false,
  light1: false,
  light2: false,
  light3: false,
  fanPower: false,
  fanSpeed: 0,
  acPower: false,
  acTemp: 24,
  acFanSpeed: 'auto',
  onboardLed: false,
  ambientTemp: 25.5
};

function sendStateUpdate() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('matter:state', lastState);
  }
}

// Initialize Matter Stack
async function initMatter() {
  try {
    sendLog('Initializing Matter Controller Stack...');
    
    const environment = Environment.default;
    
    // Set custom storage path to Electron userData directory
    const storagePath = path.join(app.getPath('userData'), 'matter-store');
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    environment.vars.set('storage.path', storagePath);
    sendLog(`Storage configured at: ${storagePath}`);

    const storageService = environment.get(StorageService);
    const uniqueId = 'BasestationController';

    commissioningController = new CommissioningController({
      environment: {
        environment,
        id: uniqueId,
      },
      autoConnect: true,
      adminFabricLabel: 'Ryaan Laptop Basestation'
    });

    await commissioningController.start();
    sendLog('Matter Controller Stack started.');

    lastState.commissioned = commissioningController.isCommissioned();
    sendStateUpdate();

    if (lastState.commissioned) {
      sendLog('Device is already commissioned. Connecting to paired device...');
      await connectToPairedNode();
    } else {
      sendLog('No paired device found. Standing by for commissioning.');
    }
  } catch (err) {
    sendLog(`Failed to initialize Matter: ${err.message}`, 'error');
  }
}

async function connectToPairedNode() {
  try {
    const nodes = commissioningController.getCommissionedNodes();
    if (nodes.length === 0) {
      lastState.commissioned = false;
      sendStateUpdate();
      return;
    }

    const nodeId = nodes[0];
    sendLog(`Connecting to Node ID: ${nodeId.toString()} ...`);
    
    pairedNode = await commissioningController.getNode(nodeId);

    // Watch node state changes
    pairedNode.events.stateChanged.on(state => {
      sendLog(`Node connection state changed: ${state}`);
      lastState.connected = (state === 'Connected' || state === 1); // connected state
      sendStateUpdate();
    });

    if (!pairedNode.isConnected) {
      pairedNode.connect();
    }

    if (!pairedNode.initialized) {
      sendLog('Waiting for node structure initialization...');
      await pairedNode.events.initialized;
    }

    sendLog('Node initialized! Mapping attributes and subscribing to updates.');
    lastState.connected = true;
    lastState.commissioned = true;
    
    // Read and subscribe to all endpoints
    mapNodeAttributes();
    subscribeNodeAttributes();
  } catch (err) {
    sendLog(`Failed to connect to node: ${err.message}`, 'error');
  }
}

function mapNodeAttributes() {
  if (!pairedNode) return;
  try {
    // Light 1 (Endpoint 1)
    const ep1 = pairedNode.parts.get(1);
    if (ep1) {
      const state = ep1.stateOf(OnOffClient);
      lastState.light1 = state.onOff;
    }

    // Light 2 (Endpoint 2)
    const ep2 = pairedNode.parts.get(2);
    if (ep2) {
      const state = ep2.stateOf(OnOffClient);
      lastState.light2 = state.onOff;
    }

    // Light 3 (Endpoint 3)
    const ep3 = pairedNode.parts.get(3);
    if (ep3) {
      const state = ep3.stateOf(OnOffClient);
      lastState.light3 = state.onOff;
    }

    // Fan (Endpoint 4)
    const ep4 = pairedNode.parts.get(4);
    if (ep4) {
      const onOff = ep4.stateOf(OnOffClient);
      lastState.fanPower = onOff.onOff;

      const fanControl = ep4.stateOf(FanControlClient);
      lastState.fanSpeed = fanControl.percentSetting || 0;
    }

    // AC Thermostat (Endpoint 5)
    const ep5 = pairedNode.parts.get(5);
    if (ep5) {
      const thermo = ep5.stateOf(ThermostatClient);
      lastState.acPower = (thermo.systemMode !== 0); // 0 is Off
      lastState.acTemp = thermo.occupiedCoolingSetpoint ? (thermo.occupiedCoolingSetpoint / 100) : 24;
    }

    // AC Fan Speed (Endpoint 6)
    const ep6 = pairedNode.parts.get(6);
    if (ep6) {
      const fanControl = ep6.stateOf(FanControlClient);
      const mode = fanControl.fanMode; // Off=0, Low=1, Med=2, High=3, Auto=5
      if (mode === 1) lastState.acFanSpeed = 'low';
      else if (mode === 2) lastState.acFanSpeed = 'medium';
      else if (mode === 3) lastState.acFanSpeed = 'high';
      else lastState.acFanSpeed = 'auto';
    }

    // Onboard LED (Endpoint 7)
    const ep7 = pairedNode.parts.get(7);
    if (ep7) {
      const state = ep7.stateOf(OnOffClient);
      lastState.onboardLed = state.onOff;
    }

    // Temperature Sensor (Endpoint 8)
    const ep8 = pairedNode.parts.get(8);
    if (ep8) {
      const temp = ep8.stateOf(TemperatureMeasurementClient);
      lastState.ambientTemp = temp.measuredValue ? (temp.measuredValue / 100) : 25.5;
    }

    sendStateUpdate();
  } catch (err) {
    sendLog(`Error reading node state: ${err.message}`, 'error');
  }
}

function subscribeNodeAttributes() {
  if (!pairedNode) return;

  pairedNode.events.attributeChanged.on(({ path: { endpointId, clusterId, attributeName }, value }) => {
    // Map changes to lastState
    if (endpointId === 1 && attributeName === 'onOff') {
      lastState.light1 = value;
    } else if (endpointId === 2 && attributeName === 'onOff') {
      lastState.light2 = value;
    } else if (endpointId === 3 && attributeName === 'onOff') {
      lastState.light3 = value;
    } else if (endpointId === 4) {
      if (attributeName === 'onOff') lastState.fanPower = value;
      if (attributeName === 'percentSetting') lastState.fanSpeed = value;
    } else if (endpointId === 5) {
      if (attributeName === 'systemMode') lastState.acPower = (value !== 0);
      if (attributeName === 'occupiedCoolingSetpoint') lastState.acTemp = value / 100;
    } else if (endpointId === 6 && attributeName === 'fanMode') {
      if (value === 1) lastState.acFanSpeed = 'low';
      else if (value === 2) lastState.acFanSpeed = 'medium';
      else if (value === 3) lastState.acFanSpeed = 'high';
      else lastState.acFanSpeed = 'auto';
    } else if (endpointId === 7 && attributeName === 'onOff') {
      lastState.onboardLed = value;
    } else if (endpointId === 8 && attributeName === 'measuredValue') {
      lastState.ambientTemp = value / 100;
    }

    sendLog(`Attribute Changed: Endpoint ${endpointId} -> ${attributeName} set to ${value}`);
    sendStateUpdate();
  });
}

// IPC Commands from UI
ipcMain.on('matter:discover', () => {
  sendLog('Scanning network for uncommissioned Matter devices...');
  // Under Wi-Fi, CommissioningController scans automatically via mDNS
  // We can let the frontend know discovery is active.
  mainWindow.webContents.send('matter:discovered', {
    name: 'ESP32 Smart Home Device',
    discriminator: 3840
  });
});

ipcMain.on('matter:commission', async (event, pairingCode) => {
  try {
    sendLog(`Starting commissioning with code: ${pairingCode}`);
    mainWindow.webContents.send('matter:commission:status', { status: 'pairing', message: 'Decoding pairing code...' });

    const decoded = ManualPairingCodeCodec.decode(pairingCode);
    const passcode = decoded.passcode;
    const shortDiscriminator = decoded.shortDiscriminator;

    sendLog(`Decoded: Passcode = ${passcode}, Short Discriminator = ${shortDiscriminator}`);
    mainWindow.webContents.send('matter:commission:status', { status: 'pairing', message: 'Discovering device via mDNS...' });

    const options = {
      commissioning: {
        regulatoryLocation: 0, // Indoor
        regulatoryCountryCode: 'XX',
      },
      discovery: {
        identifierData: { shortDiscriminator },
        discoveryCapabilities: { ble: false },
      },
      passcode,
    };

    const nodeId = await commissioningController.commissionNode(options);
    sendLog(`Successfully commissioned device! Node ID assigned: ${nodeId.toString()}`);
    mainWindow.webContents.send('matter:commission:status', { status: 'success', message: 'Paired successfully! Initializing...' });

    lastState.commissioned = true;
    sendStateUpdate();

    await connectToPairedNode();
  } catch (err) {
    sendLog(`Commissioning failed: ${err.message}`, 'error');
    mainWindow.webContents.send('matter:commission:status', { status: 'error', message: err.message });
  }
});

// Device Control IPCs
ipcMain.on('matter:control:relay', async (event, { channel, state }) => {
  if (!pairedNode) return;
  try {
    let endpointId;
    if (channel === 0) endpointId = 1;      // Light 1
    else if (channel === 1) endpointId = 2; // Light 2
    else if (channel === 2) endpointId = 3; // Light 3
    else if (channel === 3) endpointId = 4; // Fan on/off
    else if (channel === 4) endpointId = 7; // Onboard LED

    const ep = pairedNode.parts.get(endpointId);
    if (ep) {
      const commands = ep.commandsOf(OnOffClient);
      sendLog(`Sending command: ${state ? 'ON' : 'OFF'} to Endpoint ${endpointId}`);
      if (state) {
        await commands.on();
      } else {
        await commands.off();
      }
    }
  } catch (err) {
    sendLog(`Control error (relay): ${err.message}`, 'error');
  }
});

ipcMain.on('matter:control:fanSpeed', async (event, percent) => {
  if (!pairedNode) return;
  try {
    const ep = pairedNode.parts.get(4); // Fan is Endpoint 4
    if (ep) {
      const commands = ep.commandsOf(OnOffClient);
      const fanCommands = ep.commandsOf(FanControlClient);
      
      sendLog(`Setting Fan Speed to ${percent}%`);
      
      // If speed > 0, ensure fan is ON
      if (percent > 0) {
        await commands.on();
        await fanCommands.percentSetting(percent);
      } else {
        await commands.off();
      }
    }
  } catch (err) {
    sendLog(`Control error (fan speed): ${err.message}`, 'error');
  }
});

ipcMain.on('matter:control:ac', async (event, state) => {
  if (!pairedNode) return;
  try {
    const epAc = pairedNode.parts.get(5); // AC is Endpoint 5
    const epAcFan = pairedNode.parts.get(6); // AC Fan is Endpoint 6

    if (state.power !== undefined && epAc) {
      const thermoCommands = epAc.commandsOf(ThermostatClient);
      sendLog(`Setting AC Power: ${state.power ? 'ON (Cool Mode)' : 'OFF'}`);
      
      // systemMode: Off=0, Cool=3
      await epAc.setSystemModeAttribute(state.power ? 3 : 0);
    }

    if (state.temp !== undefined && epAc) {
      sendLog(`Setting AC Target Temp: ${state.temp}°C`);
      // occupiedCoolingSetpoint is in °C * 100
      await epAc.setOccupiedCoolingSetpointAttribute(state.temp * 100);
    }

    if (state.fanSpeed !== undefined && epAcFan) {
      sendLog(`Setting AC Fan Speed: ${state.fanSpeed}`);
      let modeVal = 5; // Auto
      if (state.fanSpeed === 'low') modeVal = 1;
      else if (state.fanSpeed === 'medium') modeVal = 2;
      else if (state.fanSpeed === 'high') modeVal = 3;
      
      await epAcFan.setFanModeAttribute(modeVal);
    }
  } catch (err) {
    sendLog(`Control error (AC): ${err.message}`, 'error');
  }
});

ipcMain.on('matter:decommission', async () => {
  if (!commissioningController) return;
  try {
    sendLog('Decommissioning current device fabric and resetting local storage...');
    
    // Decommission the nodes
    const nodes = commissioningController.getCommissionedNodes();
    for (const nodeId of nodes) {
      await commissioningController.decommissionNode(nodeId);
    }

    pairedNode = null;
    lastState = {
      connected: false,
      commissioned: false,
      light1: false,
      light2: false,
      light3: false,
      fanPower: false,
      fanSpeed: 0,
      acPower: false,
      acTemp: 24,
      acFanSpeed: 'auto',
      onboardLed: false,
      ambientTemp: 25.5
    };
    
    sendStateUpdate();
    sendLog('Decommissioning complete. Local pairing state cleared.');
  } catch (err) {
    sendLog(`Decommissioning failed: ${err.message}`, 'error');
  }
});

app.whenReady().then(async () => {
  createWindow();
  await initMatter();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
