import React from 'react';

export default function DeptSidebar({
  dept,
  username,
  activeTab,
  onTabChange,
  pendingCount,
  onLogout,
}) {
  const accentColor = dept?.color || '#f59e0b';

  return (
    <aside
      style={{
        width: '230px',
        minWidth: '230px',
        backgroundColor: '#111827',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 0',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div>
        {/* Header */}
        <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              {dept?.icon || '🏢'}
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                {dept?.name || 'Department'}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>UniverDoc Portal</div>
            </div>
          </div>

          {/* Monospace Username dark box */}
          <div
            style={{
              backgroundColor: '#1f2937',
              borderRadius: '6px',
              padding: '5px 10px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11.5px',
              color: '#d1d5db',
              display: 'inline-block',
              marginTop: '6px',
            }}
          >
            {username}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {[
            { id: 'documents', label: 'Documents', icon: '📋', badge: pendingCount },
            { id: 'history', label: 'History', icon: '🕐' },
            { id: 'issues', label: 'Flag Issue', icon: '🚩' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 20px',
                  border: 'none',
                  backgroundColor: isActive ? `${accentColor}1a` : 'transparent',
                  borderLeft: isActive ? `3px solid ${accentColor}` : '3px solid transparent',
                  color: isActive ? accentColor : '#9ca3af',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '700' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: accentColor,
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div style={{ padding: '0 20px' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#f87171',
            padding: '10px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}