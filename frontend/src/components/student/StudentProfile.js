import React from 'react';
import { FaUser, FaIdCard, FaBuilding, FaLayerGroup } from 'react-icons/fa';

const StudentProfile = ({ user, attendanceHistory = [] }) => {
  const profile = user?.profile || {};

  return (
    <div className="profile-grid">
      <div className="card profile-info-card">
        <div className="profile-avatar-box">
          <div className="profile-avatar-circle">
            <FaUser />
          </div>
          <h3>{profile.fullName || user?.email}</h3>
          <span className="badge badge-primary">Student</span>
        </div>

        <div className="profile-details-list">
          <div className="profile-detail-item">
            <span className="detail-label">
              <FaIdCard className="detail-icon" /> Student ID:
            </span>
            <span className="detail-value">{profile.studentId || '—'}</span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">
              <FaBuilding className="detail-icon" /> Department:
            </span>
            <span className="detail-value">{profile.department || '—'}</span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">
              <FaLayerGroup className="detail-icon" /> Year / Section:
            </span>
            <span className="detail-value">
              {profile.yearOfStudy || '—'}{' '}
              {profile.section ? `(Sec ${profile.section})` : ''}
            </span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="card attendance-history-card">
        <h3>Attendance History</h3>
        <p className="card-subtitle">Verified attendance records</p>

        <div className="table-responsive" style={{ marginTop: '1rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Status</th>
                <th>Marked Date</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((rec, i) => (
                <tr key={rec.id || i}>
                  <td><strong>{rec.event?.title || rec.eventName || 'Campus Activity'}</strong></td>
                  <td>
                    <span className={`badge ${rec.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>
                    {rec.markedAt || rec.createdAt
                      ? new Date(rec.markedAt || rec.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {attendanceHistory.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                    No attendance records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
