import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { formatDateTime } from '../../utils/dateFormat';

export default function ReviewHistory({ history, dept }) {
  const deptColor = dept?.color || '#f59e0b';

  return (
    <div className="animate-fade-up">
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '12px',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          PROCESSED DOCUMENTS — {history.length}
        </div>

        {history.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            No documents processed yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((item) => {
              const doc = item.document_type || {};
              const student = item.student || {};

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: `${deptColor}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                      }}
                    >
                      {doc.icon || '📄'}
                    </div>

                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                        {doc.label} · <span style={{ color: '#475569', fontWeight: '500' }}>{student.name}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Reviewed on {formatDateTime(item.reviewed_at)}
                      </div>
                      {item.status === 'rejected' && item.rejection_note && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '12px',
                            color: '#b91c1c',
                            backgroundColor: '#fef2f2',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            maxWidth: '500px',
                          }}
                        >
                          <strong>Reason:</strong> {item.rejection_note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}