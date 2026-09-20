import React, { useState } from 'react';
import { reportStudentIssue } from '../../api/student';
import { showToast } from '../shared/Toast';

export default function ReportIssue({ departments, onSuccess }) {
  const [departmentId, setDepartmentId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const isFilled = subject.trim().length > 0 && body.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFilled) return;

    setLoading(true);
    try {
      await reportStudentIssue({
        department_id: departmentId || null,
        subject: subject.trim(),
        body: body.trim(),
      });
      showToast('Your clearance inquiry has been submitted to the Super Admin!', 'success');
      setSubject('');
      setBody('');
      setDepartmentId('');
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast('Failed to submit issue. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px 0' }}>
          Report an Issue
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Need clarification or experiencing clearance issues? Submit a direct inquiry to the institution administrator.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#0a0f1a',
          border: '1px solid #1a2234',
          borderRadius: '14px',
          padding: '24px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
              DEPARTMENT (OPTIONAL)
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                backgroundColor: '#111827',
                color: '#f1f5f9',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="">General Inquiry / All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} Desk
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
              SUBJECT *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Issue with ND statement of result upload format"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                backgroundColor: '#111827',
                color: '#f1f5f9',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
              DETAILS (4 ROWS) *
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide complete details including receipt or tracking references..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                backgroundColor: '#111827',
                color: '#f1f5f9',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!isFilled || loading}
            style={{
              width: '100%',
              backgroundColor: isFilled ? '#2563eb' : '#1e293b',
              color: isFilled ? '#ffffff' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: isFilled && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Submitting…' : '🚩 Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
}