import React, { useState, useEffect } from 'react';

export default function Commissioning({ onCommissionSuccess }) {
  console.log("Commissioning component rendered");
  const [pairingCode, setPairingCode] = useState('');
  const [discoveredDevice, setDiscoveredDevice] = useState(null);
  const [pairingStatus, setPairingStatus] = useState(null); // { status: 'pairing' | 'success' | 'error', message: string }
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    console.log("Commissioning useEffect mounted");
    // Start scanning for devices when mounted
    setIsScanning(true);
    window.api.discoverDevices();

    // Listen for discovered devices
    const unsubscribeDiscovered = window.api.onDeviceDiscovered((device) => {
      setDiscoveredDevice(device);
      setIsScanning(false);
    });

    // Listen for commissioning status updates
    const unsubscribeStatus = window.api.onCommissionStatus((statusUpdate) => {
      setPairingStatus(statusUpdate);
      if (statusUpdate.status === 'success') {
        setTimeout(() => {
          onCommissionSuccess();
        }, 1500);
      }
    });

    return () => {
      unsubscribeDiscovered();
      unsubscribeStatus();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pairingCode.trim()) return;
    setPairingStatus({ status: 'pairing', message: 'Starting pairing process...' });
    window.api.commissionDevice(pairingCode.trim());
  };

  return (
    <div className="setup-container">
      <div className="setup-card glass-panel">
        <div className="setup-icon">⚛</div>
        <h2 className="setup-title">Commission Matter Device</h2>
        <p className="setup-description">
          The Laptop Basestation acts as a Matter controller to set up your ESP32 device locally.
        </p>

        {isScanning && (
          <div style={{ margin: '20px 0', color: '#94a3b8', fontSize: '14px' }}>
            🔍 Scanning local network for uncommissioned devices...
          </div>
        )}

        {discoveredDevice && (
          <div style={{ 
            margin: '0 0 24px 0', 
            padding: '16px', 
            borderRadius: '6px', 
            background: 'rgba(229, 193, 133, 0.03)', 
            border: '1px solid rgba(229, 193, 133, 0.15)',
            textAlign: 'left'
          }}>
            <h4 style={{ color: '#e5c185', fontSize: '12px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📡 Discovered Device
            </h4>
            <p style={{ fontSize: '13px', color: '#f1f1f5' }}>
              <strong>Name:</strong> {discoveredDevice.name}
            </p>
            <p style={{ fontSize: '12px', color: '#a0a0b0' }}>
              <strong>Discriminator:</strong> {discoveredDevice.discriminator}
            </p>
          </div>
        )}

        <div className="alexa-help-box">
          <div className="help-header">
            <span>🔗 Connected to Alexa already?</span>
          </div>
          <p className="help-content">
            Matter supports <strong>Multi-Admin</strong> natively! You can control this module from both Alexa and your laptop:
          </p>
          <ol className="help-steps" style={{ textAlign: 'left', listStylePosition: 'inside' }}>
            <li>Open the <strong>Alexa App</strong> on your phone.</li>
            <li>Go to <strong>Devices</strong> &rarr; select your Smart Home module.</li>
            <li>Tap the <strong>Settings (gear)</strong> &rarr; select <strong>Other Assistants and Apps</strong>.</li>
            <li>Tap <strong>Add Another</strong> to generate a temporary Manual Pairing Code.</li>
            <li>Enter that 11-digit code in the field below!</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="pairing-code">Manual Pairing Code</label>
            <input
              id="pairing-code"
              className="text-input"
              type="text"
              placeholder="e.g. 34905731221"
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value)}
              disabled={pairingStatus?.status === 'pairing'}
              autoFocus
            />
          </div>

          <button 
            className="btn-primary" 
            type="submit"
            disabled={!pairingCode.trim() || pairingStatus?.status === 'pairing'}
          >
            {pairingStatus?.status === 'pairing' ? 'Pairing Device...' : 'Commission Device'}
          </button>
        </form>

        {pairingStatus && (
          <div className={`pairing-status-box ${pairingStatus.status}`}>
            {pairingStatus.status === 'pairing' && '🔄 '}
            {pairingStatus.status === 'success' && '✅ '}
            {pairingStatus.status === 'error' && '❌ '}
            {pairingStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}
