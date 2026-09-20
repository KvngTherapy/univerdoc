import React from 'react';

const STATUS_CONFIGS = {
  approved: { bg: '#dcfce7', text: '#16a34a', label: 'Approved' },
  pending: { bg: '#fef9c3', text: '#ca8a04', label: 'Pending' },
  rejected: { bg: '#fee2e2', text: '#dc2626', label: 'Rejected' },
  not_submitted: { bg: '#f3f4f6', text: '#6b7280', label: 'Not Submitted' },
  open: { bg: '#fef3c7', text: '#d97706', label: 'Open' },
  resolved: { bg: '#dcfce7', text: '#16a34a', label: 'Resolved' },
  active: { bg: '#dbeafe', text: '#1d4ed8', label: 'Active' },
  inactive: { bg: '#f3f4f6', text: '#9ca3af', label: 'Inactive' },
  online: { bg: '#dcfce7', text: '#16a34a', label: 'Online' },
  ready: { bg: '#f1f5f9', text: '#64748b', label: 'Ready' },
  off: { bg: '#fee2e2', text: '#dc2626', label: 'Off' },
};

export default function StatusBadge({ status, label, size = 'md' }) {
  const normalizedKey = (status || '').toLowerCase().replace(' ', '_');
  const config = STATUS_CONFIGS[normalizedKey] || { bg: '#f3f4f6', text: '#6b7280', label: status || 'Unknown' };

  const padding = size === 'sm' ? '3px 8px' : '5px 12px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: config.bg,
        color: config.text,
        padding,
        borderRadius: '9999px',
        fontSize,
        fontWeight: '600',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
        letterSpacing: '0.2px',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          display: 'inline-block',
        }}
      />
      {label || config.label}
    </span>
  );
}