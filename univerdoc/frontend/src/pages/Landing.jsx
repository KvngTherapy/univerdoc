import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleSelector from '../components/landing/RoleSelector';
import LoginForm from '../components/landing/LoginForm';
import RegisterForm from '../components/landing/RegisterForm';
import { showToast } from '../components/shared/Toast';

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [studentMode, setStudentMode] = useState('login'); // 'login' | 'register'

  // If already authenticated, redirect to appropriate dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') navigate('/admin');
      else if (user.role === 'dept_staff' && user.department_slug) navigate(`/dept/${user.department_slug}`);
      else if (user.role === 'student') navigate('/student');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSuccess = (loggedInUser) => {
    showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
    if (loggedInUser.role === 'superadmin') {
      navigate('/admin');
    } else if (loggedInUser.role === 'dept_staff') {
      navigate(`/dept/${loggedInUser.department_slug || 'finance'}`);
    } else {
      navigate('/student');
    }
  };

  const handleRegisterSuccess = (username) => {
    showToast('Registration successful! Please sign in with your credentials.', 'success');
    setStudentMode('login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 50%, #f0fdf4 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="animate-fade-up"
        style={{
          width: '100%',
          maxWidth: selectedRole ? '860px' : '920px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Top Branding Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)',
              }}
            >
              🎓
            </div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '32px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                color: '#0f172a',
              }}
            >
              UniverDoc
            </h1>
          </div>
          <p
            style={{
              fontSize: '15px',
              color: '#475569',
              fontWeight: '500',
              marginBottom: '4px',
            }}
          >
            University Document Verification & Clearance Management Platform
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#6366f1',
              backgroundColor: '#ffffff',
              border: '1px solid #e0e7ff',
              padding: '4px 12px',
              borderRadius: '9999px',
              marginTop: '4px',
              fontWeight: '600',
            }}
          >
            <span>🏛️ Petroleum Training Institute (PTI), Effurun</span>
            <span>•</span>
            <span>NBTE Accredited</span>
          </div>
        </div>

        {/* Content Area: Role Selector vs Auth Form */}
        {!selectedRole ? (
          <RoleSelector onSelectRole={(role) => setSelectedRole(role)} />
        ) : selectedRole === 'student' && studentMode === 'register' ? (
          <div style={{ width: '100%' }}>
            <RegisterForm
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setStudentMode('login')}
            />
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {selectedRole === 'student' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '4px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <button
                    onClick={() => setStudentMode('login')}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: studentMode === 'login' ? '#4f46e5' : 'transparent',
                      color: studentMode === 'login' ? '#ffffff' : '#64748b',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setStudentMode('register')}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: studentMode === 'register' ? '#4f46e5' : 'transparent',
                      color: studentMode === 'register' ? '#ffffff' : '#64748b',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Register
                  </button>
                </div>
              </div>
            )}
            <LoginForm
              role={selectedRole}
              onBack={() => {
                setSelectedRole(null);
                setStudentMode('login');
              }}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        )}

        {/* Footer info */}
        <div style={{ marginTop: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
          Automation of Admission Clearance Process Using Web Based Application · PTI Case Study
        </div>
      </div>
    </div>
  );
}