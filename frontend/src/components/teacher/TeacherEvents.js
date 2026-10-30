import React from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const TeacherEvents = ({ events = [], onEdit, onDelete, onCreateNew }) => {
  return (
    <div className="card">
      <div className="card-header-flex">
        <h3>My Coordinated Events ({events.length})</h3>
        {onCreateNew && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onCreateNew}>
            <FaPlus /> New Event
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Category</th>
              <th>Date & Time</th>
              <th>Venue</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td><strong>{ev.title}</strong></td>
                <td><span className="badge badge-primary">{ev.category}</span></td>
                <td>
                  {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD'}{' '}
                  {ev.time ? `at ${ev.time}` : ''}
                </td>
                <td>{ev.venue || 'Campus Hall'}</td>
                <td>{ev.capacity || 'Open'}</td>
                <td>
                  <span className={`badge ${ev.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                    {ev.status || 'Active'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      title="Edit Event"
                      onClick={() => onEdit(ev)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm delete-btn"
                      title="Delete Event"
                      onClick={() => onDelete(ev.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No events found. Create your first event to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherEvents;
