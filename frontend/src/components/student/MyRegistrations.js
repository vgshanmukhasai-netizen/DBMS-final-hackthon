import React from 'react';

const MyRegistrations = ({ registrations = [], onCancelRegistration }) => {
  return (
    <div className="card">
      <div className="card-header-flex">
        <h3>My Registered Campus Events ({registrations.length})</h3>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Category</th>
              <th>Date & Time</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => {
              const ev = reg.event || reg;
              return (
                <tr key={reg.id}>
                  <td><strong>{ev.title || 'Campus Event'}</strong></td>
                  <td><span className="badge badge-primary">{ev.category || 'General'}</span></td>
                  <td>
                    {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD'}{' '}
                    {ev.time ? `at ${ev.time}` : ''}
                  </td>
                  <td>{ev.venue || 'Campus Hall'}</td>
                  <td>
                    <span
                      className={`badge ${
                        reg.status === 'confirmed' || reg.status === 'registered'
                          ? 'badge-success'
                          : reg.status === 'cancelled'
                          ? 'badge-danger'
                          : 'badge-info'
                      }`}
                    >
                      {reg.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    {reg.status !== 'cancelled' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm delete-btn"
                        onClick={() => onCancelRegistration(reg.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {registrations.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  You have not registered for any events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyRegistrations;
