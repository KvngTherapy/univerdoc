import React, { useState } from 'react';

export default function RejectModal({ isOpen, onClose, submission, onConfirmReject, loading }) {
  const [reason, setReason] = useState('');

  if (!isOpen || !submission) return null;

  const docLabel = submission.document_type?.label || 'Document';
  const studentName = submission.student?.name || 'Student';
  const isValid = reason.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onConfirmReject(submission.id, reason.trim());
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#00000055',
        backdropFilter: 'blur(3px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-up"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          padding: '24px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
          Reject Document
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
          {docLabel} · {studentName}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '700',
                color: '#dc2626',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              REJECTION REASON *
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a clear reason for rejection. This will be sent to the student."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1.5px solid ${isValid ? '#ef4444' : '#cbd5e1'}`,
                backgroundColor: isValid ? '#fef2f2' : '#ffffff',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isValid ? '#dc2626' : '#cbd5e1',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
              }}
            >
              {loading ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}