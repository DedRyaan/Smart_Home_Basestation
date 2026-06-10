import React, { useState, useEffect, useCallback } from 'react';
import Commissioning from './components/Commissioning';
import Dashboard from './components/Dashboard';

export default function App() {
  const [deviceState, setDeviceState] = useState({
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
  });

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Listen to live device state updates from the backend
    const unsubscribeState = window.api.onDeviceState((state) => {
      setDeviceState(state);
    });

    // Listen to log messages from the backend
    const unsubscribeLogs = window.api.onLogMessage((logEntry) => {
      setLogs((prev) => {
        const next = [logEntry, ...prev]; // Newest logs first
        if (next.length > 100) next.pop(); // Cap at 100 entries
        return next;
      });
    });

    return () => {
      unsubscribeState();
      unsubscribeLogs();
    };
  }, []);

  const handleCommissionSuccess = useCallback(() => {
    setDeviceState(prev => ({ ...prev, commissioned: true }));
  }, []);

  const handleDecommission = useCallback(() => {
    if (confirm('Are you sure you want to decommission this device? This will erase the pairing keys on the laptop and you will need to re-enter the pairing code.')) {
      window.api.decommissionDevice();
    }
  }, []);

  // Status text calculation
  let statusText = 'Disconnected';
  let statusClass = 'disconnected';
  if (deviceState.commissioned) {
    if (deviceState.connected) {
      statusText = 'Connected';
      statusClass = 'connected';
    } else {
      statusText = 'Searching...';
      statusClass = 'pairing';
    }
  } else {
    statusText = 'Unpaired';
    statusClass = 'disconnected';
  }

  return (
    <div className="app-container">
      {/* Premium Header / Status Bar */}
      <header className="app-header">
        <div className="brand-section">
          <span style={{ fontSize: '22px', textShadow: '0 0 10px rgba(0, 242, 254, 0.4)' }}>🏠</span>
          <h1 className="brand-title">RYAAN SMART HOME BASESTATION</h1>
        </div>

        <div className="status-badge">
          <span className={`status-dot ${statusClass}`}></span>
          <span>Device: <strong>{statusText}</strong></span>
        </div>
      </header>

      {/* View Routing */}
      {!deviceState.commissioned ? (
        <Commissioning onCommissionSuccess={handleCommissionSuccess} />
      ) : (
        <Dashboard 
          state={deviceState} 
          logs={logs} 
          onDecommission={handleDecommission} 
        />
      )}
    </div>
  );
}
