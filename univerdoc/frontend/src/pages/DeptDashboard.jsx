import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDeptQueue, getDeptHistory, getDeptIssues, getDeptStats } from '../api/dept';
import DeptSidebar from '../components/dept/DeptSidebar';
import DocumentQueue from '../components/dept/DocumentQueue';
import ReviewHistory from '../components/dept/ReviewHistory';
import FlagIssue from '../components/dept/FlagIssue';
import Spinner from '../components/shared/Spinner';
import { formatDateTime } from '../utils/dateFormat';
import { showToast } from '../components/shared/Toast';

const DEPT_CONFIGS = {
  finance: { name: 'Finance', icon: '💳', color: '#f59e0b' },
  library: { name: 'Library', icon: '📚', color: '#8b5cf6' },
  admin: { name: 'Administration', icon: '🏛️', color: '#06b6d4' },
  academic: { name: 'Academic Records', icon: '🎓', color: '#10b981' },
};

export default function DeptDashboard() {
  const { deptSlug } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'history' | 'issues'
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const dept = DEPT_CONFIGS[deptSlug] || { name: 'Department', icon: '🏢', color: '#f59e0b' };

  // Check role authorization
  useEffect(() => {
    if (user && user.role !== 'dept_staff') {
      showToast('Access denied. Department Staff only.', 'error');
      navigate('/');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [queueRes, historyRes, issuesRes, statsRes] = await Promise.all([
        getDeptQueue(),
        getDeptHistory(),
        getDeptIssues(),
        getDeptStats(),
      ]);
      setQueue(queueRes.data);
      setHistory(historyRes.data);
      setIssues(issuesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch department data:', err);
      showToast('Failed to load department desk data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deptSlug]);

  const tabTitles = {
    documents: 'Document Review Queue',
    history: 'Review History',
    issues: 'Flag an Issue',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <DeptSidebar
        dept={dept}
        username={user?.username || 'staff_slot'}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingCount={stats.pending}
        onLogout={logout}
      />

      {/* Main Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar (white, 1px bottom border) */}
        <header
          style={{
            height: '70px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Title */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
              {tabTitles[activeTab]}
            </h2>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              {dept.name} · {formatDateTime(new Date())}
            </div>
          </div>

          {/* Right Stat Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                backgroundColor: '#fef3c7',
                color: '#b45309',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Pending:</span>
              <strong style={{ fontSize: '13px' }}>{stats.pending}</strong>
            </div>

            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Approved:</span>
              <strong style={{ fontSize: '13px' }}>{stats.approved}</strong>
            </div>

            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Rejected:</span>
              <strong style={{ fontSize: '13px' }}>{stats.rejected}</strong>
            </div>
          </div>
        </header>

        {/* Tab Content Body */}
        <main style={{ padding: '28px 32px', flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <Spinner size={32} color={dept.color} />
            </div>
          ) : (
            <>
              {activeTab === 'documents' && (
                <DocumentQueue
                  queue={queue}
                  dept={dept}
                  onRefresh={fetchData}
                />
              )}
              {activeTab === 'history' && (
                <ReviewHistory
                  history={history}
                  dept={dept}
                />
              )}
              {activeTab === 'issues' && (
                <FlagIssue
                  issues={issues}
                  dept={dept}
                  onRefresh={fetchData}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}