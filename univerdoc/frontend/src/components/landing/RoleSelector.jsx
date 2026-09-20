import React from 'react';

export default function RoleSelector({ onSelectRole }) {
  const roles = [
    {
      id: 'superadmin',
      icon: '🛡️',
      title: 'Super Admin',
      desc: 'Platform-wide control & access management',
      badge: 'Institution Admin',
      borderColor: '#6366f1',
    },
    {
      id: 'dept_staff',
      icon: '🏢',
      title: 'Department Staff',
      desc: 'Login with credentials issued by Super Admin',
      badge: 'Clearance Desk',
      borderColor: '#f59e0b',
    },
    {
      id: 'student',
      icon: '🎓',
      title: 'Student',
      desc: 'Self-register or sign in to your clearance portal',
      badge: 'PTI Candidates',
      borderColor: '#06b6d4',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        width: '100%',
        marginTop: '28px',
      }}
    >
      {roles.map((role) => (
        <div
          key={role.id}
          onClick={() => onSelectRole(role.id)}
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '14px',
            padding: '28px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = role.borderColor;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(99, 102, 241, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            {role.icon}
          </div>
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '20px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '8px',
            }}
          >
            {role.title}
          </h3>
          <p
            style={{
              fontSize: '13.5px',
              color: '#64748b',
              lineHeight: 1.5,
              marginBottom: '16px',
            }}
          >
            {role.desc}
          </p>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#4f46e5',
              backgroundColor: '#eef2ff',
              padding: '4px 10px',
              borderRadius: '9999px',
            }}
          >
            {role.badge} →
          </span>
        </div>
      ))}
    </div>
  );
}