import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Web browser mock interface fallback
if (!window.api) {
  window.api = {
    discoverDevices: () => console.log('Mock: discoverDevices'),
    commissionDevice: (code) => console.log('Mock: commissionDevice', code),
    toggleRelay: (channel, state) => console.log('Mock: toggleRelay', channel, state),
    setAcState: (state) => console.log('Mock: setAcState', state),
    decommissionDevice: () => console.log('Mock: decommissionDevice'),
    onDeviceDiscovered: (callback) => {
      const timer = setTimeout(() => {
        callback({ name: 'Mock ESP32 Matter Device', discriminator: 3840 });
      }, 1000);
      return () => clearTimeout(timer);
    },
    onCommissionStatus: (callback) => {
      return () => {};
    },
    onDeviceState: (callback) => {
      const timer = setTimeout(() => {
        callback({
          connected: true,
          commissioned: true,
          light1: true,
          light2: false,
          light3: true,
          fanPower: true,
          acPower: true,
          acTemp: 22,
          acFanSpeed: 'medium',
          onboardLed: true
        });
      }, 500);
      return () => clearTimeout(timer);
    },
    onLogMessage: (callback) => {
      callback({ timestamp: new Date().toLocaleTimeString(), message: 'Mock: System initialised in browser mode', level: 'info' });
      return () => {};
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
