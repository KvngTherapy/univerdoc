import React, { useState } from 'react';
import StatusBadge from '../shared/StatusBadge';
import DocViewer from './DocViewer';
import RejectModal from './RejectModal';
import { formatDateTime } from '../../utils/dateFormat';
import { approveDocument, rejectDocument } from '../../api/dept';
import { showToast } from '../shared/Toast';

export default function DocumentQueue({
  queue,
  dept,
  onRefresh,
}) {
  const [selectedSub, setSelectedSub] = useState(null);
  const [rejectingSub, setRejectingSub] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const deptColor = dept?.color || '#f59e0b';

  const handleApprove = async (subId) => {
    setActionLoading(true);
    try {
      await approveDocument(subId);
      showToast('Document approved successfully! Email notification dispatched to student.', 'success');
      setSelectedSub(null);
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve document', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (subId, reason) => {
    setActionLoading(true);
    try {
      await rejectDocument(subId, reason);
      showToast('Document rejected. Student notified with mandatory rejection note.', 'success');
      setRejectingSub(null);
      setSelectedSub(null);
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to reject document', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (queue.length === 0) {
    return (
      <div
        className="animate-fade-up"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '64px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', margin: '0 0 6px 0' }}>
          All clear!
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          No documents pending review in this department desk.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedSub ? 'minmax(340px, 1.2fr) minmax(340px, 1fr)' : '1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Column 1: Queue List */}
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
            PENDING REVIEW — {queue.length} DOCUMENTS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {queue.map((sub) => {
              const isSelected = selectedSub?.id === sub.id;
              const doc = sub.document_type || {};
              const student = sub.student || {};

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSub(sub)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? `${deptColor}10` : '#ffffff',
                    borderLeft: isSelected ? `4px solid ${deptColor}` : '4px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: `${deptColor}20`,
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
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '3px' }}>
                        {doc.label}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span>{student.name}</span>
                        <span>·</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#4338ca', fontWeight: '600' }}>
                          {student.matric_no}
                        </span>
                        <span>·</span>
                        <span>Submitted {formatDateTime(sub.uploaded_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <StatusBadge status="pending" size="sm" />
                    <span style={{ fontSize: '18px', color: isSelected ? deptColor : '#cbd5e1' }}>›</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Side-by-Side Viewer */}
        {selectedSub && (
          <DocViewer
            submission={selectedSub}
            deptColor={deptColor}
            onClose={() => setSelectedSub(null)}
            onApprove={handleApprove}
            onOpenRejectModal={(sub) => setRejectingSub(sub)}
            actionLoading={actionLoading}
          />
        )}
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={!!rejectingSub}
        onClose={() => setRejectingSub(null)}
        submission={rejectingSub}
        onConfirmReject={handleConfirmReject}
        loading={actionLoading}
      />
    </div>
  );
}