import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../shared/Spinner';

export default function LoginForm({ role, onBack, onLoginSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleTitles = {
    superadmin: 'Super Administrator Portal',
    dept_staff: 'Department Staff Clearance Portal',
    student: 'Student Clearance Portal',
  };

  const handleFillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      onLoginSuccess(user);
    } catch (err) {
      const msg = err.response?.data?.error || 'Authentication failed. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) 300px',
        gap: '24px',
        width: '100%',
        marginTop: '20px',
      }}
    >
      {/* Left Form Panel */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '16px',
            fontWeight: '600',
          }}
        >
          ← Back to Role Selection
        </button>

        <h2
          style={{
            fontSize: '22px',
            fontFamily: "'Syne', sans-serif",
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '6px',
          }}
        >
          {roleTitles[role]}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Enter authorized institutional credentials to continue.
        </p>

        {role === 'dept_staff' && (
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '12.5px',
              color: '#92400e',
              lineHeight: 1.45,
            }}
          >
            <strong>Notice:</strong> Credentials are issued exclusively by the Super Admin. Max 2 concurrent active sessions per department.
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '18px',
              fontSize: '13px',
              color: '#dc2626',
              fontWeight: '500',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. superadmin, finance_01, alex.mercer"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontFamily: role === 'student' ? 'inherit' : "'IBM Plex Mono', monospace",
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: loading
                ? '#94a3b8'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
            }}
          >
            {loading ? (
              <>
                <Spinner size={16} color="#ffffff" />
                <span>Processing…</span>
              </>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>
      </div>

      {/* Right Info Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Demo Credentials Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <h4
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🔑 Demo Credentials
          </h4>
          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
            Click any account to auto-fill:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              onClick={() => handleFillCredentials('superadmin', 'Admin@123')}
              style={{
                padding: '8px 10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              <div style={{ fontWeight: '600', color: '#4338ca' }}>🛡️ superadmin</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Pass: Admin@123</div>
            </div>

            <div
              onClick={() => handleFillCredentials('finance_01', 'Staff@123')}
              style={{
                padding: '8px 10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              <div style={{ fontWeight: '600', color: '#d97706' }}>💳 finance_01 (Slot 1)</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Pass: Staff@123</div>
            </div>

            <div
              onClick={() => handleFillCredentials('academic_01', 'Staff@123')}
              style={{
                padding: '8px 10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              <div style={{ fontWeight: '600', color: '#059669' }}>🎓 academic_01 (Slot 1)</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Pass: Staff@123</div>
            </div>

            <div
              onClick={() => handleFillCredentials('alex.mercer', 'Alex@123')}
              style={{
                padding: '8px 10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              <div style={{ fontWeight: '600', color: '#0284c7' }}>🎓 alex.mercer (Student)</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Pass: Alex@123</div>
            </div>
          </div>
        </div>

        {/* Security Stack Checklist */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <h4
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}
          >
            🛡️ Security Stack
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#16a34a' }}>✓</span> JWT Bearer Tokens (8h)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#16a34a' }}>✓</span> bcrypt Hashing (12 rounds)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#16a34a' }}>✓</span> HTTPS Transport Layer
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#16a34a' }}>✓</span> Role-Based Access Control
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#16a34a' }}>✓</span> Max 2 Concurrent Dept Logins
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}