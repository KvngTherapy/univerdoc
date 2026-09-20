import React from 'react';

export default function StudentSidebar({
  user,
  activeTab,
  onTabChange,
  unreadCount,
  onLogout,
}) {
  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: '#0a0f1a',
        borderRight: '1px solid #1a2234',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 0',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        height: '100vh',
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <div>
        {/* Header */}
        <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #1a2234' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                UniverDoc
              </div>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '500' }}>Student Portal</div>
            </div>
          </div>

          {/* Student Info Card */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1f2937',
              borderRadius: '8px',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Student Candidate'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              {user?.matric_no || 'Matric Pending'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'documents', label: 'My Documents', icon: '📁' },
            { id: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
            { id: 'issues', label: 'Report Issue', icon: '🚩' },
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
                  backgroundColor: isActive ? '#111827' : 'transparent',
                  borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: '#38bdf8',
                      color: '#070b14',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                    }}
                  >
                    ({item.badge})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Log Out at bottom */}
      <div style={{ padding: '0 20px' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            color: '#f87171',
            padding: '10px',
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}