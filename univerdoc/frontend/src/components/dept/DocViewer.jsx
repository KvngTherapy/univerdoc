import React from 'react';
import { formatDateTime } from '../../utils/dateFormat';

export default function DocViewer({
  submission,
  deptColor,
  onClose,
  onApprove,
  onOpenRejectModal,
  actionLoading,
}) {
  if (!submission) return null;

  const doc = submission.document_type || {};
  const student = submission.student || {};
  const fileUrl = submission.file_url ? submission.file_url : null;
  const isImage = submission.file_name?.match(/\.(png|jpe?g)$/i);

  return (
    <div
      className="animate-slide-in"
      style={{
        backgroundColor: '#ffffff',
        border: `2px solid ${deptColor}`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: `${deptColor}15`,
          borderBottom: `1px solid ${deptColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
            {doc.label || 'Document Review'}
          </h4>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{student.name}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Document Preview Area (light gray bg) */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '70px',
            backgroundColor: '#ffffff',
            border: `2px solid ${deptColor}`,
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            marginBottom: '12px',
          }}
        >
          {doc.icon || '📄'}
        </div>

        <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a', marginBottom: '4px', textAlign: 'center', wordBreak: 'break-word' }}>
          {submission.file_name || 'Uploaded Document'}
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
          Version {submission.version} · Uploaded {formatDateTime(submission.uploaded_at)}
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '9999px',
            padding: '4px 14px',
            fontSize: '11.5px',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '16px',
          }}
        >
          <span>🔒</span>
          <span>Secure document preview</span>
        </div>

        {/* Embedded preview frame or image */}
        {fileUrl && (
          <div
            style={{
              width: '100%',
              maxHeight: '260px',
              overflow: 'hidden',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
            }}
          >
            {isImage ? (
              <img
                src={fileUrl}
                alt="Document preview"
                style={{ width: '100%', height: '260px', objectFit: 'contain' }}
              />
            ) : (
              <iframe
                src={fileUrl}
                title="Document viewer"
                style={{ width: '100%', height: '260px', border: 'none' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Student Information Panel */}
      <div style={{ padding: '20px', flex: 1 }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}
        >
          STUDENT INFORMATION
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Name</span>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{student.name}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Matric No.</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: '700', color: '#4338ca' }}>
              {student.matric_no}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Email</span>
            <span style={{ color: '#475569' }}>{student.email}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: '#64748b' }}>File Name</span>
            <span style={{ color: '#0f172a', fontWeight: '500', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {submission.file_name}
            </span>
          </div>
        </div>

        {/* Action Buttons (2-column grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => onApprove(submission.id)}
            disabled={actionLoading}
            style={{
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #10b981',
              color: '#047857',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1fae5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ecfdf5')}
          >
            <span>✓</span>
            <span>Approve</span>
          </button>

          <button
            onClick={() => onOpenRejectModal(submission)}
            disabled={actionLoading}
            style={{
              backgroundColor: '#fef2f2',
              border: '1.5px solid #ef4444',
              color: '#b91c1c',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
          >
            <span>✕</span>
            <span>Reject</span>
          </button>
        </div>
      </div>
    </div>
  );
}