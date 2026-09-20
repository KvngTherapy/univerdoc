import React, { useState, useEffect } from 'react';

let toastListener = null;

export function showToast(message, type = 'success') {
  if (toastListener) {
    toastListener({ id: Date.now(), message, type });
  }
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3800); // Auto-dismiss after 3.8 seconds per spec
    };
    return () => {
      toastListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {toasts.map((toast) => {
        let bg = '#0f172a';
        let border = '#334155';
        let icon = 'ℹ️';

        if (toast.type === 'success') {
          bg = '#064e3b';
          border = '#059669';
          icon = '✓';
        } else if (toast.type === 'error') {
          bg = '#7f1d1d';
          border = '#dc2626';
          icon = '⚠️';
        }

        return (
          <div
            key={toast.id}
            style={{
              minWidth: '280px',
              maxWidth: '420px',
              backgroundColor: bg,
              color: '#ffffff',
              border: `1px solid ${border}`,
              borderRadius: '10px',
              padding: '12px 18px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              animation: 'slideInRight 0.25s ease forwards',
            }}
          >
            <span style={{ fontSize: '16px' }}>{icon}</span>
            <div style={{ flex: 1 }}>{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
}