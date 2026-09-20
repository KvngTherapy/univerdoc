import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../api/admin';
import { formatDateTime } from '../../utils/dateFormat';
import Spinner from '../shared/Spinner';
import { showToast } from '../shared/Toast';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await getAuditLogs(currentPage, 15);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      showToast('Failed to load audit trail', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
            System Audit Trail
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Immutable security log of sensitive institutional clearance actions (Total records: {total})
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '12.5px',
            fontWeight: '600',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh Log
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Spinner size={32} color="#6366f1" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px' }}>Timestamp</th>
                  <th style={{ padding: '14px 18px' }}>Actor</th>
                  <th style={{ padding: '14px 18px' }}>Action</th>
                  <th style={{ padding: '14px 18px' }}>Target Type</th>
                  <th style={{ padding: '14px 18px' }}>Metadata / Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    let metaObj = {};
                    try {
                      metaObj = log.metadata ? JSON.parse(log.metadata) : {};
                    } catch {
                      metaObj = { raw: log.metadata };
                    }

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {formatDateTime(log.created_at)}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: '600', color: '#0f172a' }}>
                          {log.actor ? (
                            <div>
                              <div>{log.actor.name}</div>
                              <div style={{ fontSize: '11px', color: '#6366f1', fontFamily: "'IBM Plex Mono', monospace" }}>
                                @{log.actor.username} ({log.actor.role})
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>System</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#475569', textTransform: 'capitalize' }}>
                          {log.target_type || '—'}
                        </td>
                        <td style={{ padding: '14px 18px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', color: '#475569' }}>
                          {Object.keys(metaObj).length > 0 ? (
                            <span style={{ backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'inline-block', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {JSON.stringify(metaObj)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f9fafb',
            }}
          >
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: page <= 1 ? '#94a3b8' : '#334155',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12.5px',
                }}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: page >= totalPages ? '#94a3b8' : '#334155',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12.5px',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}