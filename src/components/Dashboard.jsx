import React, { useState, useEffect } from 'react';
import CircularSlider from './CircularSlider';

export default function Dashboard({ state, logs, onDecommission }) {
  const [logsCollapsed, setLogsCollapsed] = useState(false);
  const [tempHistory, setTempHistory] = useState([25.5, 25.4, 25.5, 25.6, 25.5, 25.4, 25.6, 25.5, 25.5, 25.5]);

  // Record temperature history for trend line
  useEffect(() => {
    if (state.ambientTemp !== undefined) {
      setTempHistory(prev => {
        const next = [...prev, state.ambientTemp];
        if (next.length > 20) next.shift(); // Keep last 20 samples
        return next;
      });
    }
  }, [state.ambientTemp]);

  const handleLightToggle = (channel, currentState) => {
    window.api.toggleRelay(channel, !currentState);
  };

  const handleFanToggle = (currentPower) => {
    window.api.toggleRelay(3, !currentPower); // Fan is Relay 3
  };

  const handleFanSpeedChange = (e) => {
    const val = parseInt(e.target.value, 10);
    window.api.setFanSpeed(val);
  };

  const handleFanPreset = (presetSpeed) => {
    window.api.setFanSpeed(presetSpeed);
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

  // Generate SVG path for temperature trend sparkline
  const generateSparklinePath = () => {
    if (tempHistory.length < 2) return '';
    const width = 250;
    const height = 50;
    const minVal = Math.min(...tempHistory) - 0.2;
    const maxVal = Math.max(...tempHistory) + 0.2;
    const valRange = maxVal - minVal || 1;

    const points = tempHistory.map((val, idx) => {
      const x = (idx / (tempHistory.length - 1)) * width;
      const y = height - ((val - minVal) / valRange) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Determine spin speed class
  let fanSpinClass = '';
  if (state.fanPower && state.fanSpeed > 0) {
    fanSpinClass = 'spinning';
    if (state.fanSpeed > 66) fanSpinClass += ' fast';
    else if (state.fanSpeed > 33) fanSpinClass += ' medium';
    else fanSpinClass += ' slow';
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

        <div className="fan-controller-body">
          <div className="fan-toggle-section">
            <div 
              className={`fan-disc ${fanSpinClass}`}
              onClick={() => handleFanToggle(state.fanPower)}
            >
              <span className="fan-blades">🌀</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: state.fanPower ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              {state.fanPower ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>

          <div className="fan-speed-section">
            <div className="fan-slider-label">
              <span>Speed Level</span>
              <strong style={{ color: 'var(--color-primary)' }}>{state.fanPower ? `${state.fanSpeed}%` : 'OFF'}</strong>
            </div>

            <input
              type="range"
              className="range-slider"
              min="0"
              max="100"
              step="10"
              value={state.fanPower ? state.fanSpeed : 0}
              onChange={handleFanSpeedChange}
              disabled={!state.fanPower}
            />

            <div className="fan-presets">
              <button 
                className={`preset-btn ${!state.fanPower ? 'active' : ''}`}
                onClick={() => handleFanPreset(0)}
              >
                Off
              </button>
              <button 
                className={`preset-btn ${state.fanPower && state.fanSpeed <= 33 && state.fanSpeed > 0 ? 'active' : ''}`}
                onClick={() => handleFanPreset(33)}
                disabled={!state.fanPower}
              >
                Low
              </button>
              <button 
                className={`preset-btn ${state.fanPower && state.fanSpeed > 33 && state.fanSpeed <= 66 ? 'active' : ''}`}
                onClick={() => handleFanPreset(66)}
                disabled={!state.fanPower}
              >
                Med
              </button>
              <button 
                className={`preset-btn ${state.fanPower && state.fanSpeed > 66 ? 'active' : ''}`}
                onClick={() => handleFanPreset(100)}
                disabled={!state.fanPower}
              >
                High
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Ambient Environment Widget */}
      <div className="widget-card glass-panel">
        <div className="widget-title-bar">
          <h3 className="widget-title">
            <span className="widget-icon">🌡️</span> Environment
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Matter Endpoint 8</span>
        </div>

        <div className="env-container">
          <div className="env-metric-box">
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Room Temperature
              </span>
              <div className="env-value-display">
                {state.ambientTemp !== undefined ? state.ambientTemp.toFixed(1) : '25.5'}
                <span className="env-unit">°C</span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                mDNS Status
              </span>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: state.connected ? 'var(--color-success)' : 'var(--color-error)'
              }}>
                {state.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div className="env-chart-wrapper">
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live Temperature Trend (20s history)
            </span>
            <svg width="100%" height="40" style={{ overflow: 'visible' }}>
              <path
                d={generateSparklinePath()}
                fill="none"
                stroke="url(#sparklineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0, 242, 254, 0.4))' }}
              />
              <defs>
                <linearGradient id="sparklineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* 4. AC Thermostat Control Widget */}
      <div className="widget-card glass-panel" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'center' }}>
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
              style={{ flex: 'none', padding: '10px 18px', borderRadius: '20px', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }}
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

      {/* 5. Collapsible Developer Logs Widget */}
      <div className={`logs-panel glass-panel ${logsCollapsed ? 'collapsed' : ''}`}>
        <div className="logs-header" onClick={() => setLogsCollapsed(!logsCollapsed)}>
          <div className="logs-title">
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 8px #00f2fe' }}></span>
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
