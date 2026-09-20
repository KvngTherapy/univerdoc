import React, { useEffect, useState } from 'react';

export default function ProgressBar({
  percentage = 0,
  height = 8,
  gradient = 'linear-gradient(90deg, #1d4ed8 0%, #38bdf8 100%)',
  bgColor = '#1e293b',
  borderRadius = 8,
  showLabel = false,
  labelColor = '#64748b',
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => {
      setWidth(Math.min(100, Math.max(0, percentage)));
    }, 50);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: labelColor }}>
          <span>Clearance Progress</span>
          <span style={{ fontWeight: '700' }}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: bgColor,
          borderRadius: `${borderRadius}px`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: gradient,
            borderRadius: `${borderRadius}px`,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}