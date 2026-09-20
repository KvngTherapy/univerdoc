import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validateMatricNumber, MATRIC_GUIDE } from '../../utils/matricValidation';
import Spinner from '../shared/Spinner';

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matric_no: 'M.24/ND/PEG/',
    username: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setGeneralError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.email.trim()) errors.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email is required.';

    if (!formData.matric_no.trim()) {
      errors.matric_no = 'Matric number is required.';
    } else if (!validateMatricNumber(formData.matric_no.trim())) {
      errors.matric_no = 'Must match format M.YY/PROGRAM/DEPT/NUMBER (e.g. M.24/ND/PEG/11245)';
    }

    if (!formData.username.trim()) errors.username = 'Username is required.';
    if (!formData.password) errors.password = 'Password is required.';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        matric_no: formData.matric_no.trim(),
        username: formData.username.trim(),
        password: formData.password,
      });
      onRegisterSuccess(formData.username);
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontFamily: "'Syne', sans-serif", fontWeight: '700', color: '#0f172a' }}>
          Student Clearance Registration
        </h2>
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#4f46e5',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Already registered? Sign In →
        </button>
      </div>

      {generalError && (
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
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Alex Mercer"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${fieldErrors.name ? '#ef4444' : '#cbd5e1'}`,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.name && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.name}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="alex@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${fieldErrors.email ? '#ef4444' : '#cbd5e1'}`,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {fieldErrors.email && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.email}</div>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
              Portal Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="e.g. alex.mercer"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${fieldErrors.username ? '#ef4444' : '#cbd5e1'}`,
                fontSize: '14px',
                fontFamily: "'IBM Plex Mono', monospace",
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {fieldErrors.username && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.username}</div>}
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
            PTI Matriculation Number *
          </label>
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '11.5px',
              color: '#166534',
              marginBottom: '6px',
            }}
          >
            {MATRIC_GUIDE}
          </div>
          <input
            type="text"
            value={formData.matric_no}
            onChange={(e) => handleChange('matric_no', e.target.value.toUpperCase())}
            placeholder="M.24/ND/PEG/11245"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${fieldErrors.matric_no ? '#ef4444' : '#cbd5e1'}`,
              fontSize: '14px',
              fontFamily: "'IBM Plex Mono', monospace",
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.matric_no && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.matric_no}</div>}
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
            Password (minimum 6 characters) *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••••••"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${fieldErrors.password ? '#ef4444' : '#cbd5e1'}`,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.password && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.password}</div>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {loading ? (
            <>
              <Spinner size={16} color="#ffffff" />
              <span>Creating Account…</span>
            </>
          ) : (
            'Create Account →'
          )}
        </button>
      </form>
    </div>
  );
}