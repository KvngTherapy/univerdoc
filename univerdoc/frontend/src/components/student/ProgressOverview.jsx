import React from 'react';
import ProgressBar from '../shared/ProgressBar';

export default function ProgressOverview({
  user,
  progressData,
  onNavigateToDocs,
}) {
  const firstName = user?.name?.split(' ')[0] || 'Candidate';
  const overallPct = progressData?.overall_pct ?? 0;
  const perDept = progressData?.per_dept || [];

  return (
    <div className="animate-fade-up">
      {/* Welcome Banner */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px 0' }}>
          Welcome back, {firstName} 👋
        </h2>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Matric:{' '}
          <span style={{ color: '#38bdf8', fontFamily: "'IBM Plex Mono', monospace", fontWeight: '600' }}>
            {user?.matric_no}
          </span>
        </div>
      </div>

      {/* Progress Bar Card (dark bg, #1a2234 border, rounded-14) */}
      <div
        style={{
          backgroundColor: '#0a0f1a',
          border: '1px solid #1a2234',
          borderRadius: '14px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            OVERALL VERIFICATION PROGRESS
          </span>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '22px',
              fontWeight: '800',
              color: '#38bdf8',
            }}
          >
            {overallPct}%
          </span>
        </div>

        {/* 8px rounded progress bar: dark track -> blue-to-cyan gradient fill */}
        <ProgressBar
          percentage={overallPct}
          height={8}
          bgColor="#1e293b"
          gradient="linear-gradient(90deg, #1d4ed8 0%, #38bdf8 100%)"
        />

        {/* Four Stat Counters Below Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #1a2234',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Approved</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
              {progressData?.approved_count ?? 0}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
              {progressData?.pending_count ?? 0}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Rejected</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>
              {progressData?.rejected_count ?? 0}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Missing</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: '800', color: '#94a3b8', marginTop: '4px' }}>
              {progressData?.missing_count ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Department Progress Cards (2x2 grid, dark cards) */}
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' }}>
        Department Clearance Breakdown
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {perDept.map((dept) => (
          <div
            key={dept.id}
            onClick={() => onNavigateToDocs(dept.slug)}
            style={{
              backgroundColor: '#0a0f1a',
              border: '1px solid #1a2234',
              borderRadius: '14px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = dept.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1a2234';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>{dept.icon}</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>
                    {dept.name}
                  </h4>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {dept.total} documents required
                  </span>
                </div>
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: '700', color: dept.color, fontSize: '15px' }}>
                {dept.percentage}%
              </span>
            </div>

            {/* Thin Accent-Coloured Progress Bar */}
            <div style={{ marginBottom: '14px' }}>
              <ProgressBar
                percentage={dept.percentage}
                height={5}
                bgColor="#1e293b"
                gradient={dept.color}
              />
            </div>

            <div style={{ fontSize: '12px', display: 'flex', gap: '8px', color: '#64748b' }}>
              <span style={{ color: '#10b981' }}>{dept.approved} approved</span>
              <span>·</span>
              <span style={{ color: '#f59e0b' }}>{dept.pending} pending</span>
              <span>·</span>
              <span style={{ color: '#ef4444' }}>{dept.rejected} rejected</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}