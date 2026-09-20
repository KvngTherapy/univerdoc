import React, { useState } from 'react';
import StatusBadge from '../shared/StatusBadge';
import { resetCredentials, toggleSlot, forceLogout } from '../../api/admin';
import { showToast } from '../shared/Toast';

export default function DeptCredentials({ departments, initialExpandedDeptId, onRefresh }) {
  const [expandedDeptId, setExpandedDeptId] = useState(initialExpandedDeptId || departments[0]?.id);
  const [copiedKey, setCopiedKey] = useState(null);
  const [resettingSlot, setResettingSlot] = useState(null);
  const [tempPasswords, setTempPasswords] = useState({});

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000); // 2 seconds per spec
  };

  const handleResetPassword = async (deptId, slotNumber, username) => {
    setResettingSlot(`${deptId}-${slotNumber}`);
    try {
      const res = await resetCredentials({ dept_id: deptId, slot_number: slotNumber });
      setTempPasswords((prev) => ({
        ...prev,
        [username]: res.data.password,
      }));
      showToast(`New password generated for ${username}!`, 'success');
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to reset password', 'error');
    } finally {
      setResettingSlot(null);
    }
  };

  const handleToggleSlot = async (userId, currentActive, username) => {
    try {
      await toggleSlot({ user_id: userId, is_active: !currentActive });
      showToast(`${username} ${!currentActive ? 'activated' : 'deactivated'} successfully!`, 'success');
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update slot status', 'error');
    }
  };

  const handleForceLogout = async (userId, username) => {
    try {
      await forceLogout({ user_id: userId });
      showToast(`Session for ${username} forcefully terminated!`, 'success');
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to force logout', 'error');
    }
  };

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
          Department Clearance Credentials Management
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Each clearance desk has exactly 2 credential slots with database-enforced single concurrent session locking.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {departments.map((dept) => {
          const isExpanded = expandedDeptId === dept.id;
          const staffSlots = dept.staff || [];
          const activeCount = staffSlots.filter((s) => s.is_active).length;
          const onlineCount = staffSlots.filter((s) => s.is_logged_in).length;

          return (
            <div
              key={dept.id}
              style={{
                backgroundColor: '#ffffff',
                border: isExpanded ? `2px solid ${dept.color}` : '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header / Collapsed view */}
              <div
                onClick={() => setExpandedDeptId(isExpanded ? null : dept.id)}
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? `${dept.color}08` : '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: `${dept.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                    }}
                  >
                    {dept.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                      {dept.name}
                    </h4>
                    <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                      {activeCount}/2 slots active · {onlineCount} online
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    color: '#94a3b8',
                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  ›
                </div>
              </div>

              {/* Expanded Slot Panels */}
              {isExpanded && (
                <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {staffSlots.map((slot) => {
                    const tempPass = tempPasswords[slot.username];
                    const isCopiedUser = copiedKey === `u-${slot.id}`;
                    const isCopiedPass = copiedKey === `p-${slot.id}`;

                    return (
                      <div
                        key={slot.id}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                              Slot {slot.slot_number}
                            </span>
                            <StatusBadge
                              status={slot.is_active ? 'active' : 'inactive'}
                              label={slot.is_active ? 'Active' : 'Deactivated'}
                              size="sm"
                            />
                            {slot.is_logged_in && (
                              <StatusBadge status="online" label="Online Now" size="sm" />
                            )}
                          </div>
                        </div>

                        {/* Monospace Credential Box */}
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            marginBottom: '14px',
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>
                              Username: <strong style={{ color: '#0f172a' }}>{slot.username}</strong>
                            </span>
                            <button
                              onClick={() => handleCopy(slot.username, `u-${slot.id}`)}
                              style={{
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                borderRadius: '4px',
                                padding: '3px 8px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                color: isCopiedUser ? '#16a34a' : '#475569',
                                fontWeight: '600',
                              }}
                            >
                              {isCopiedUser ? '✓ Copied' : 'Copy'}
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>
                              Password:{' '}
                              {tempPass ? (
                                <strong style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '1px 4px', borderRadius: '4px' }}>
                                  {tempPass} (shown once)
                                </strong>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>••••••••••••</span>
                              )}
                            </span>
                            {tempPass && (
                              <button
                                onClick={() => handleCopy(tempPass, `p-${slot.id}`)}
                                style={{
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  borderRadius: '4px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  color: isCopiedPass ? '#16a34a' : '#475569',
                                  fontWeight: '600',
                                }}
                              >
                                {isCopiedPass ? '✓ Copied' : 'Copy'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <button
                            onClick={() => handleResetPassword(dept.id, slot.slot_number, slot.username)}
                            disabled={resettingSlot === `${dept.id}-${slot.slot_number}`}
                            style={{
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>🔄</span>
                            <span>
                              {resettingSlot === `${dept.id}-${slot.slot_number}` ? 'Resetting…' : 'Reset Password'}
                            </span>
                          </button>

                          <button
                            onClick={() => handleToggleSlot(slot.id, slot.is_active, slot.username)}
                            style={{
                              backgroundColor: slot.is_active ? '#fff1f2' : '#f0fdf4',
                              border: `1px solid ${slot.is_active ? '#fecdd3' : '#bbf7d0'}`,
                              color: slot.is_active ? '#9f1239' : '#166534',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{slot.is_active ? '⛔' : '✅'}</span>
                            <span>{slot.is_active ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          {slot.is_logged_in && (
                            <button
                              onClick={() => handleForceLogout(slot.id, slot.username)}
                              style={{
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fca5a5',
                                color: '#b91c1c',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              🚪 Force Logout
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}