import React, { useState, useEffect } from 'react';
import CircularSlider from './CircularSlider';

export default function Dashboard({ state, logs, onDecommission }) {
  const [logsCollapsed, setLogsCollapsed] = useState(false);

  const handleLightToggle = (channel, currentState) => {
    window.api.toggleRelay(channel, !currentState);
  };

  const handleFanToggle = (currentPower) => {
    window.api.toggleRelay(3, !currentPower); // Fan is Relay 3
  };

  const handleAcPower = (currentPower) => {
    window.api.setAcState({ power: !currentPower });
  };

  const handleAcTempChange = (newTemp) => {
    window.api.setAcState({ temp: newTemp });
  };

  const handleAcFanSpeed = (speed) => {
    window.api.setAcState({ fanSpeed: speed });
  };

  // Determine spin speed class
  let fanSpinClass = '';
  if (state.fanPower) {
    fanSpinClass = 'spinning';
  }

  return (
    <div className="dashboard-content">
      {/* 1. Lights Control Widget */}
      <div className="widget-card glass-panel">
        <div className="widget-title-bar">
          <h3 className="widget-title">
            <span className="widget-icon">💡</span> Lights Control
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Matter Endpoints 1, 2, 3</span>
        </div>
        
        <div className="lights-grid">
          <div 
            className={`light-button-card ${state.light1 ? 'active' : ''}`}
            onClick={() => handleLightToggle(0, state.light1)}
          >
            <div className="light-btn-header">
              <span className="light-icon">💡</span>
              <span className="switch-dot"></span>
            </div>
            <span className="light-name">Light 1</span>
          </div>

          <div 
            className={`light-button-card ${state.light2 ? 'active' : ''}`}
            onClick={() => handleLightToggle(1, state.light2)}
          >
            <div className="light-btn-header">
              <span className="light-icon">💡</span>
              <span className="switch-dot"></span>
            </div>
            <span className="light-name">Light 2</span>
          </div>

          <div 
            className={`light-button-card ${state.light3 ? 'active' : ''}`}
            onClick={() => handleLightToggle(2, state.light3)}
          >
            <div className="light-btn-header">
              <span className="light-icon">💡</span>
              <span className="switch-dot"></span>
            </div>
            <span className="light-name">Light 3</span>
          </div>
          
          <div 
            className={`light-button-card ${state.onboardLed ? 'active' : ''}`}
            onClick={() => handleLightToggle(4, state.onboardLed)}
          >
            <div className="light-btn-header">
              <span className="light-icon">🚨</span>
              <span className="switch-dot"></span>
            </div>
            <span className="light-name">Onboard LED</span>
          </div>
        </div>
      </div>

      {/* 2. Fan Control Widget */}
      <div className="widget-card glass-panel">
        <div className="widget-title-bar">
          <h3 className="widget-title">
            <span className="widget-icon">🌀</span> Fan Controller
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Matter Endpoint 4</span>
        </div>

        <div className="fan-controller-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px' }}>
          <div 
            className={`fan-disc ${fanSpinClass}`}
            onClick={() => handleFanToggle(state.fanPower)}
            style={{ width: '96px', height: '96px', margin: '10px 0' }}
          >
            <span className="fan-blades" style={{ fontSize: '36px' }}>🌀</span>
          </div>
          <button 
            className={`ac-power-btn ${state.fanPower ? 'active' : ''}`}
            onClick={() => handleFanToggle(state.fanPower)}
            style={{ width: '100%', maxWidth: '200px', textAlign: 'center' }}
          >
            {state.fanPower ? 'TURN OFF' : 'TURN ON'}
          </button>
        </div>
      </div>

      {/* 3. AC Thermostat Control Widget */}
      <div className="widget-card glass-panel" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'center' }}>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <div className="widget-title-bar" style={{ marginBottom: '12px' }}>
            <h3 className="widget-title">
              <span className="widget-icon">❄️</span> AC Controller (Midea Protocol IR)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Matter Endpoints 5 & 6</span>
          </div>
          
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            Adjust the cooling setpoint and power state. The basestation sends native Midea IR codes via the ESP32 RMT hardware transmitter to control your Croma AC units.
          </p>

          <div className="ac-controls-row">
            <button 
              className={`ac-power-btn ${state.acPower ? 'active' : ''}`}
              onClick={() => handleAcPower(state.acPower)}
            >
              POWER: {state.acPower ? 'ON' : 'OFF'}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                AC Fan Mode
              </span>
              <div className="ac-fan-selector">
                {['auto', 'low', 'medium', 'high'].map(speed => (
                  <button
                    key={speed}
                    className={`ac-fan-btn ${state.acFanSpeed === speed ? 'active' : ''}`}
                    onClick={() => handleAcFanSpeed(speed)}
                    disabled={!state.acPower}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              className="preset-btn"
              style={{ flex: 'none', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(224, 122, 95, 0.2)', color: 'var(--color-error)', background: 'transparent' }}
              onClick={onDecommission}
            >
              Reset Pairing
            </button>
          </div>
        </div>

        <div className="ac-dial-wrapper" style={{ flexShrink: 0 }}>
          <CircularSlider
            value={state.acTemp}
            min={16}
            max={30}
            onChange={handleAcTempChange}
            disabled={!state.acPower}
          />
        </div>
      </div>

      {/* 4. Collapsible Developer Logs Widget */}
      <div className={`logs-panel glass-panel ${logsCollapsed ? 'collapsed' : ''}`}>
        <div className="logs-header" onClick={() => setLogsCollapsed(!logsCollapsed)}>
          <div className="logs-title">
            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 6px var(--color-primary)' }}></span>
            Developer Matter Logs
          </div>
          <span className="logs-toggle-icon">▲</span>
        </div>
        
        {!logsCollapsed && (
          <div className="logs-content">
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No logs captured yet. Send commands to see activity...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`log-row ${log.level}`}>
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className="log-msg">{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
