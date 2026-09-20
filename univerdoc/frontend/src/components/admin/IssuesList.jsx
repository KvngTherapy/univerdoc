import React, { useState } from 'react';
import StatusBadge from '../shared/StatusBadge';
import { formatDateTime } from '../../utils/dateFormat';
import { resolveIssue } from '../../api/admin';
import { showToast } from '../shared/Toast';

export default function IssuesList({ issues, onRefresh }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'open' | 'resolved'
  const [resolvingId, setResolvingId] = useState(null);

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  const handleResolve = async (issueId) => {
    setResolvingId(issueId);
    try {
      await resolveIssue(issueId);
      showToast('Issue marked as resolved!', 'success');
      onRefresh();
    } catch (err) {
      showToast('Failed to resolve issue', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
            Flagged Issues & Inquiries
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Issues submitted by students and department clearance staff.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '3px', gap: '4px' }}>
          {['all', 'open', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#ffffff' : 'transparent',
                color: filter === f ? '#0f172a' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredIssues.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '48px',
              textAlign: 'center',
              color: '#94a3b8',
              border: '1px solid #e2e8f0',
            }}
          >
            No issues found matching current filter.
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const reporterName = issue.reporter?.name || 'Unknown Reporter';
            const reporterRole = issue.reporter_role === 'student' ? 'Student' : 'Department Staff';
            const deptName = issue.department?.name || 'General';

            return (
              <div
                key={issue.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '22px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {issue.subject}
                  </h4>
                  <StatusBadge status={issue.status} />
                </div>

                <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
                  From <strong>{reporterName}</strong> ({reporterRole}) · <strong>{deptName}</strong> Dept · {formatDateTime(issue.created_at)}
                </div>

                <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, margin: '0 0 16px 0', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  {issue.body}
                </p>

                {issue.status === 'open' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleResolve(issue.id)}
                      disabled={resolvingId === issue.id}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      ✓ {resolvingId === issue.id ? 'Resolving…' : 'Mark Resolved'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}