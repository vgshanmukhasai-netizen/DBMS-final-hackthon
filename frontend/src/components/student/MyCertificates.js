import React from 'react';
import { FaCertificate, FaDownload } from 'react-icons/fa';

const MyCertificates = ({ certificates = [], studentName = 'Student', onDownload }) => {
  return (
    <div className="card">
      <div className="card-header-flex">
        <h3>My Earned Certificates ({certificates.length})</h3>
      </div>

      <div className="certificates-grid">
        {certificates.map((cert) => (
          <div key={cert.id} className="certificate-card">
            <div className="cert-card-icon">
              <FaCertificate />
            </div>
            <span className="cert-badge">Official Certificate</span>
            <h4 className="cert-event-title">{cert.event?.title || cert.eventTitle || 'Event Certificate'}</h4>
            <p className="cert-student-name">
              Awarded to: <strong>{studentName}</strong>
            </p>
            <div className="cert-meta">
              <span>ID: <code>{cert.certificateNumber || cert.id}</code></span>
              <span>
                Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Recent'}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block cert-download-btn"
              onClick={() => onDownload(cert.id)}
            >
              <FaDownload /> Download PDF
            </button>
          </div>
        ))}
        {certificates.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <FaCertificate style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h4>No Certificates Yet</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Attend verified campus events to receive your participation certificates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificates;
