import React, { useState } from 'react';
import ProgressBar from '../shared/ProgressBar';

export default function StudentRegistry({ students }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.matric_no.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
            Student Clearance Registry
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Total registered candidates: {students.length}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search students by name, matric no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            minWidth: '260px',
            outline: 'none',
          }}
        />
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 20px' }}>Name</th>
                <th style={{ padding: '14px 20px' }}>Email</th>
                <th style={{ padding: '14px 20px' }}>Matric No.</th>
                <th style={{ padding: '14px 20px' }}>Username</th>
                <th style={{ padding: '14px 20px', minWidth: '180px' }}>Clearance Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    No students registered yet.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a' }}>
                      {student.name}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>
                      {student.email}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#4338ca', fontFamily: "'IBM Plex Mono', monospace", fontWeight: '600' }}>
                      {student.matric_no}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontFamily: "'IBM Plex Mono', monospace" }}>
                      {student.username}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <ProgressBar
                            percentage={student.progress}
                            height={7}
                            bgColor="#f1f5f9"
                            gradient="linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                          />
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#10b981', minWidth: '36px' }}>
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}