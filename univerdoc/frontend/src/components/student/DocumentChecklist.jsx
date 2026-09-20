import React, { useState } from 'react';
import StatusBadge from '../shared/StatusBadge';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';
import { formatDateTime } from '../../utils/dateFormat';
import { uploadStudentDocument } from '../../api/student';
import { showToast } from '../shared/Toast';

export default function DocumentChecklist({
  departmentGroups,
  onRefresh,
  highlightDeptSlug,
}) {
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file format! Only PDF, PNG, and JPG files are accepted.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit. Please compress or choose a smaller file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadingDoc) return;

    setUploadLoading(true);
    setFileError('');

    try {
      const formData = new FormData();
      formData.append('document_type_id', uploadingDoc.document_type_id);
      formData.append('file', selectedFile);

      await uploadStudentDocument(formData);
      showToast(`${uploadingDoc.label} uploaded successfully!`, 'success');
      setUploadingDoc(null);
      setSelectedFile(null);
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Please try again.';
      setFileError(msg);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px 0' }}>
          My Documents
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Upload and verify required institutional clearance certificates and documents.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {departmentGroups.map((dept) => {
          const isHighlighted = highlightDeptSlug === dept.slug;

          return (
            <div key={dept.id} id={`dept-group-${dept.slug}`}>
              {/* Section label: coloured dot + "DEPARTMENT NAME" in small caps dimmed */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: dept.color,
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {dept.name} CLEARANCE DESK
                </span>
              </div>

              {/* Document rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dept.documents.map((doc) => {
                  const canUpload = doc.status === 'not_submitted' || doc.status === 'rejected';

                  return (
                    <div
                      key={doc.document_type_id}
                      style={{
                        backgroundColor: '#0a0f1a',
                        border: isHighlighted ? `1px solid ${dept.color}` : '1px solid #1a2234',
                        borderRadius: '12px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '24px' }}>{doc.icon}</span>
                          <div>
                            <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#f1f5f9', marginBottom: '3px' }}>
                              {doc.label}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {doc.uploaded_at ? `Submitted ${formatDateTime(doc.uploaded_at)}` : 'Not yet uploaded'}
                              {doc.file_name && ` · ${doc.file_name}`}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <StatusBadge status={doc.status} />

                          {canUpload && (
                            <button
                              onClick={() => {
                                setUploadingDoc(doc);
                                setFileError('');
                                setSelectedFile(null);
                              }}
                              style={{
                                backgroundColor: '#0f2347',
                                border: '1px solid #1e40af',
                                color: '#38bdf8',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {doc.status === 'rejected' ? 'Resubmit Document' : 'Upload Document'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* If rejected: red rejection reason box below */}
                      {doc.status === 'rejected' && doc.rejection_note && (
                        <div
                          style={{
                            backgroundColor: '#1f1315',
                            border: '1px solid #7f1d1d',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '12.5px',
                            color: '#f87171',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span>⚠</span>
                          <div>
                            <strong>Rejection Note:</strong> {doc.rejection_note}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={!!uploadingDoc}
        onClose={() => {
          if (!uploadLoading) setUploadingDoc(null);
        }}
        title={`Upload ${uploadingDoc?.label || 'Document'}`}
      >
        <form onSubmit={handleUploadSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              Accepted file formats: <strong>PDF, PNG, JPG</strong> (Maximum file size: 5MB)
            </p>

            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '28px 20px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={uploadLoading}
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>
          </div>

          {selectedFile && (
            <div style={{ fontSize: '12.5px', color: '#16a34a', marginBottom: '14px' }}>
              ✓ Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          {fileError && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                marginBottom: '16px',
              }}
            >
              {fileError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setUploadingDoc(null)}
              disabled={uploadLoading}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontSize: '13.5px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploadLoading}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedFile && !uploadLoading ? '#2563eb' : '#94a3b8',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: selectedFile && !uploadLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {uploadLoading ? (
                <>
                  <Spinner size={16} color="#ffffff" />
                  <span>UPLOADING…</span>
                </>
              ) : (
                'Upload & Submit'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}