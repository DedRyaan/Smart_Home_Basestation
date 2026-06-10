import React, { useState, useRef, useEffect } from 'react';

export default function CircularSlider({ value, min, max, onChange, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef(null);
  
  // Dimensions
  const size = 170;
  const center = size / 2;
  const radius = 65;
  const strokeWidth = 8;
  
  // Arc definitions (from -135deg to 135deg, leaving a 90deg gap at the bottom)
  const startAngle = -135;
  const endAngle = 135;
  const angleRange = endAngle - startAngle;
  
  // Convert value to angle
  const getAngle = (val) => {
    const percentage = (val - min) / (max - min);
    return startAngle + percentage * angleRange;
  };
  
  // Convert angle to value
  const getValueFromAngle = (angle) => {
    // Normalize angle to startAngle based
    let normalizedAngle = angle;
    if (normalizedAngle < -180) normalizedAngle += 360;
    if (normalizedAngle > 180) normalizedAngle -= 360;
    
    // Constrain angle to the arc range
    let relativeAngle = normalizedAngle - startAngle;
    if (relativeAngle < 0) {
      relativeAngle = Math.abs(relativeAngle) < (360 - angleRange) / 2 ? 0 : angleRange;
    }
    if (relativeAngle > angleRange) {
      relativeAngle = angleRange;
    }
    
    const percentage = relativeAngle / angleRange;
    const rawVal = min + percentage * (max - min);
    return Math.round(rawVal);
  };
  
  // Helper to describe SVG arc path
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };
  
  const getArcPath = (start, end) => {
    const startPt = polarToCartesian(center, center, radius, end);
    const endPt = polarToCartesian(center, center, radius, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endPt.x} ${endPt.y}`;
  };

  const handleUpdate = (clientX, clientY) => {
    if (!svgRef.current || disabled) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - center;
    const y = clientY - rect.top - center;
    
    // Calculate angle in degrees from top vertical center (0 to 180, -180 to 0)
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle > 180) angle -= 360;
    
    const newValue = getValueFromAngle(angle);
    onChange(newValue);
  };

  const handleMouseDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    handleUpdate(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      handleUpdate(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const currentAngle = getAngle(value);
  const trackPath = getArcPath(startAngle, endAngle);
  const activePath = getArcPath(startAngle, currentAngle);
  const thumbPos = polarToCartesian(center, center, radius, currentAngle);
  
  return (
    <div className="circular-slider" style={{ position: 'relative', width: size, height: size }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        onMouseDown={handleMouseDown}
      >
        {/* Glow Filter for Active Arc */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background Track Arc */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Active Value Arc */}
        <path
          d={activePath}
          fill="none"
          stroke={disabled ? 'rgba(255, 255, 255, 0.15)' : 'url(#activeGradiant)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={disabled ? '' : 'url(#glow)'}
        />
        
        <defs>
          <linearGradient id="activeGradiant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>
        </defs>
        
        {/* Thumb Knob */}
        {!disabled && (
          <circle
            cx={thumbPos.x}
            cy={thumbPos.y}
            r={10}
            fill="#00f2fe"
            stroke="#121026"
            strokeWidth={3}
            style={{
              transition: isDragging ? 'none' : 'all 0.1s ease',
              filter: 'drop-shadow(0 0 5px rgba(0, 242, 254, 0.8))'
            }}
          />
        )}
      </svg>
      
      {/* Center Label Display */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <span
          style={{
            fontFamily: 'Outfit',
            fontSize: '44px',
            fontWeight: '700',
            color: disabled ? '#64748b' : '#f8fafc',
            lineHeight: 1,
            textShadow: disabled ? 'none' : '0 0 20px rgba(0, 242, 254, 0.2)'
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: '13px',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '600',
            marginTop: '4px'
          }}
        >
          Target °C
        </span>
      </div>
    </div>
  );
}
