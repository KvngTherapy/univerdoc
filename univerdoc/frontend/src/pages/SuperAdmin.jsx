import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats, getDepartments, getStudents, getIssues, triggerWeeklySummary } from '../api/admin';
import AdminOverview from '../components/admin/AdminOverview';
import DeptCredentials from '../components/admin/DeptCredentials';
import StudentRegistry from '../components/admin/StudentRegistry';
import IssuesList from '../components/admin/IssuesList';
import AuditLogViewer from '../components/admin/AuditLogViewer';
import Spinner from '../components/shared/Spinner';
import { showToast } from '../components/shared/Toast';

export default function SuperAdmin() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'departments' | 'students' | 'issues' | 'audit'
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, deptsRes, studentsRes, issuesRes] = await Promise.all([
        getStats(),
        getDepartments(),
        getStudents(),
        getIssues('all'),
      ]);
      setStats(statsRes.data);
      setDepartments(deptsRes.data);
      setStudents(studentsRes.data);
      setIssues(issuesRes.data);
    } catch (err) {
      console.error('Failed to load superadmin data:', err);
      showToast('Error loading administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectDeptFromOverview = (deptId) => {
    setSelectedDeptId(deptId);
    setActiveTab('departments');
  };

  const handleTriggerSummary = async () => {
    setSummaryLoading(true);
    try {
      await triggerWeeklySummary();
      showToast('Weekly summary emails dispatched to all active staff!', 'success');
    } catch (err) {
      showToast('Failed to trigger weekly summary', 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  const openIssuesCount = issues.filter((i) => i.status === 'open').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Dark Sidebar (width: 230px, background: #0f172a) */}
      <aside
        style={{
          width: '230px',
          minWidth: '230px',
          backgroundColor: '#0f172a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 0',
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div>
          {/* Logo Area */}
          <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                🛡️
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                  UniverDoc
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Super Admin</div>
              </div>
            </div>

            {/* Username display tag */}
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '6px',
                padding: '4px 8px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#818cf8',
                display: 'inline-block',
                marginTop: '6px',
              }}
            >
              {user?.username || 'superadmin'}
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'departments', label: 'Departments', icon: '🏢' },
              { id: 'students', label: 'Students', icon: '🎓' },
              { id: 'issues', label: 'Issues', icon: '🚩', badge: openIssuesCount },
              { id: 'audit', label: 'Audit Trail', icon: '📜' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 20px',
                    border: 'none',
                    backgroundColor: isActive ? '#1e293b' : 'transparent',
                    borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: '13.5px',
                    fontWeight: isActive ? '600' : '400',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '9999px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Log Out Button at bottom */}
        <div style={{ padding: '0 20px' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f87171',
              padding: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: '28px 32px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            paddingBottom: '18px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Petroleum Training Institute
            </h2>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Central Document Verification & Clearance Management Control
            </div>
          </div>
          <button
            onClick={fetchData}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Spinner size={32} color="#6366f1" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverview
                stats={stats}
                departments={departments}
                onSelectDept={handleSelectDeptFromOverview}
                onTriggerWeeklySummary={handleTriggerSummary}
                summaryLoading={summaryLoading}
              />
            )}
            {activeTab === 'departments' && (
              <DeptCredentials
                departments={departments}
                initialExpandedDeptId={selectedDeptId}
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'students' && (
              <StudentRegistry students={students} />
            )}
            {activeTab === 'issues' && (
              <IssuesList issues={issues} onRefresh={fetchData} />
            )}
            {activeTab === 'audit' && (
              <AuditLogViewer />
            )}
          </>
        )}
      </main>
    </div>
  );
}