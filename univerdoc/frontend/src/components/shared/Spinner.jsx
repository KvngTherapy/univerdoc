import React from 'react';

export default function Spinner({ size = 20, color = '#6366f1' }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `2.5px solid rgba(255, 255, 255, 0.3)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}