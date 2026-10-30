import React from 'react';

const MyAnnouncements = ({ announcements = [] }) => {
  return (
    <div className="card">
      <div className="card-header-flex">
        <h3>Campus Announcements ({announcements.length})</h3>
      </div>

      <div className="announcements-grid-list">
        {announcements.map((a) => (
          <div key={a.id} className="announcement-full-card">
            <div className="announcement-card-header">
              <div>
                <h4>{a.title}</h4>
                <span className="announcement-meta">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'} &bull;{' '}
                  Target: {a.targetType || 'Department'}
                </span>
              </div>
              <span className={`badge ${a.type === 'urgent' ? 'badge-danger' : 'badge-primary'}`}>
                {a.type || 'Notice'}
              </span>
            </div>
            <p className="announcement-card-body">{a.message}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No announcements available for your department.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyAnnouncements;
