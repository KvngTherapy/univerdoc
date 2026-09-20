import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentDocuments, getStudentProgress, getStudentNotifications } from '../api/student';
import StudentSidebar from '../components/student/StudentSidebar';
import ProgressOverview from '../components/student/ProgressOverview';
import DocumentChecklist from '../components/student/DocumentChecklist';
import NotificationInbox from '../components/student/NotificationInbox';
import ReportIssue from '../components/student/ReportIssue';
import Spinner from '../components/shared/Spinner';
import { showToast } from '../components/shared/Toast';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'documents' | 'notifications' | 'issues'
  const [progressData, setProgressData] = useState(null);
  const [departmentGroups, setDepartmentGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [highlightDeptSlug, setHighlightDeptSlug] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'student') {
      showToast('Access restricted to students', 'error');
      navigate('/');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [progressRes, docsRes, notifsRes] = await Promise.all([
        getStudentProgress(),
        getStudentDocuments(),
        getStudentNotifications(),
      ]);
      setProgressData(progressRes.data);
      setDepartmentGroups(docsRes.data);
      setNotifications(notifsRes.data.notifications || []);
      setUnreadCount(notifsRes.data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
      showToast('Failed to load clearance status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNavigateToDocs = (deptSlug) => {
    setHighlightDeptSlug(deptSlug);
    setActiveTab('documents');
    setTimeout(() => {
      const elem = document.getElementById(`dept-group-${deptSlug}`);
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#070b14',
        color: '#f1f5f9',
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {/* Sidebar */}
      <StudentSidebar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        unreadCount={unreadCount}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          padding: '32px 36px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Top bar info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            paddingBottom: '20px',
            borderBottom: '1px solid #1a2234',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Petroleum Training Institute, Effurun · Clearance Desk
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
              Academic Session 2025/2026
            </div>
          </div>
          <button
            onClick={fetchData}
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1f2937',
              color: '#38bdf8',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'inherit',
            }}
          >
            🔄 Refresh Status
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Spinner size={32} color="#38bdf8" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <ProgressOverview
                user={user}
                progressData={progressData}
                onNavigateToDocs={handleNavigateToDocs}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentChecklist
                departmentGroups={departmentGroups}
                onRefresh={fetchData}
                highlightDeptSlug={highlightDeptSlug}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationInbox
                notifications={notifications}
                onNotificationsRead={() => setUnreadCount(0)}
              />
            )}
            {activeTab === 'issues' && (
              <ReportIssue
                departments={departmentGroups}
                onSuccess={() => setActiveTab('overview')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}