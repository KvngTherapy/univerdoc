import React, { useState } from 'react';
import StatusBadge from '../shared/StatusBadge';
import { formatDateTime } from '../../utils/dateFormat';
import { flagDeptIssue } from '../../api/dept';
import { showToast } from '../shared/Toast';

export default function FlagIssue({ issues, dept, onRefresh }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const deptColor = dept?.color || '#f59e0b';
  const isValid = subject.trim() && body.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      await flagDeptIssue({ subject: subject.trim(), body: body.trim() });
      showToast('Issue flagged to Super Admin! Email notification dispatched.', 'success');
      setSubject('');
      setBody('');
      onRefresh();
    } catch (err) {
      showToast('Failed to flag issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: '560px' }}>
      {/* Submission Form */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
          Report an Issue
        </h3>
        <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#64748b' }}>
          Flag administrative or clearance inquiries directly to the Super Administrator.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
              SUBJECT
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Student fee payment bank slip verification discrepancy"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
              DETAILS
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue or clearance inquiry with relevant student details..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            style={{
              width: '100%',
              backgroundColor: isValid ? deptColor : '#cbd5e1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: isValid && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Submitting…' : '🚩 Submit to Super Admin'}
          </button>
        </form>
      </div>

      {/* My Submitted Issues */}
      {issues && issues.length > 0 && (
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
              padding: '14px 20px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '11.5px',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            MY SUBMITTED ISSUES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {issues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                    {issue.subject}
                  </h4>
                  <StatusBadge status={issue.status} size="sm" />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {formatDateTime(issue.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}