import React, { useEffect } from 'react';
import { formatDateTime } from '../../utils/dateFormat';
import { markNotificationsRead } from '../../api/student';

export default function NotificationInbox({ notifications, onNotificationsRead }) {
  useEffect(() => {
    // Automatically mark all as read when opening notification inbox
    const markAllRead = async () => {
      try {
        await markNotificationsRead();
        if (onNotificationsRead) onNotificationsRead();
      } catch (err) {
        console.error('Failed to mark notifications read:', err);
      }
    };
    markAllRead();
  }, []);

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px 0' }}>
          Notifications
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Direct verification alerts, updates, and clearance messages.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div
          style={{
            backgroundColor: '#0a0f1a',
            border: '1px solid #1a2234',
            borderRadius: '14px',
            padding: '48px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          No notifications yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notifications.map((n) => {
            let borderColor = '#1a2234';
            let icon = 'ℹ️';

            if (n.type === 'approval') {
              borderColor = '#065f46';
              icon = '✅';
            } else if (n.type === 'rejection') {
              borderColor = '#991b1b';
              icon = '⚠️';
            }

            return (
              <div
                key={n.id}
                style={{
                  backgroundColor: '#0a0f1a',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{icon}</span>
                    <strong style={{ fontSize: '14.5px', color: '#f1f5f9' }}>{n.subject}</strong>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {formatDateTime(n.sent_at)}
                  </span>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                  {n.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}