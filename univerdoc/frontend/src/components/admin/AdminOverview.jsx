import React from 'react';
import StatusBadge from '../shared/StatusBadge';

export default function AdminOverview({ stats, departments, onSelectDept, onTriggerWeeklySummary, summaryLoading }) {
  return (
    <div className="animate-fade-up">
      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Departments
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '34px', fontWeight: '800', color: '#6366f1', margin: '8px 0 4px 0' }}>
            {stats?.total_depts ?? 4}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Clearance desks</div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Students Registered
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '34px', fontWeight: '800', color: '#10b981', margin: '8px 0 4px 0' }}>
            {stats?.total_students ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>PTI Candidates</div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Open Issues
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '34px', fontWeight: '800', color: '#f59e0b', margin: '8px 0 4px 0' }}>
            {stats?.open_issues ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Awaiting resolution</div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Sessions
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '34px', fontWeight: '800', color: '#06b6d4', margin: '8px 0 4px 0' }}>
            {stats?.active_sessions ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Dept staff online</div>
        </div>
      </div>

      {/* Action Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '18px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>Weekly Pending Review Automation</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Automated node-cron schedule runs every Monday at 8:00 AM. You can also dispatch summary notifications immediately.
          </p>
        </div>
        <button
          onClick={onTriggerWeeklySummary}
          disabled={summaryLoading}
          style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: '600',
            cursor: summaryLoading ? 'not-allowed' : 'pointer',
            opacity: summaryLoading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📧</span>
          <span>{summaryLoading ? 'Sending Summaries…' : 'Send Summary Now'}</span>
        </button>
      </div>

      {/* 2x2 Grid of Department Status Cards */}
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
        Department Clearance Desks Status
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {departments.map((dept) => {
          const staffSlots = dept.staff || [];
          const slot1 = staffSlots.find((s) => s.slot_number === 1);
          const slot2 = staffSlots.find((s) => s.slot_number === 2);

          const getSlotPill = (slot) => {
            if (!slot) return <StatusBadge status="inactive" label="Slot Empty" size="sm" />;
            if (!slot.is_active) return <StatusBadge status="off" label="Off" size="sm" />;
            if (slot.is_logged_in) return <StatusBadge status="online" label="Online" size="sm" />;
            return <StatusBadge status="ready" label="Ready" size="sm" />;
          };

          return (
            <div
              key={dept.id}
              onClick={() => onSelectDept(dept.id)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '22px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.borderColor = dept.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: `${dept.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    {dept.icon}
                  </span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{dept.name}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{dept.document_types?.length || 0} clearance documents</span>
                  </div>
                </div>
                <span style={{ fontSize: '18px', color: '#94a3b8' }}>›</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ flex: 1, fontSize: '12px', color: '#64748b' }}>
                  <div style={{ marginBottom: '4px' }}>Slot 1:</div>
                  {getSlotPill(slot1)}
                </div>
                <div style={{ flex: 1, fontSize: '12px', color: '#64748b' }}>
                  <div style={{ marginBottom: '4px' }}>Slot 2:</div>
                  {getSlotPill(slot2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}