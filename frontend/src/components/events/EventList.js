import React, { useState } from 'react';
import { FaSearch, FaFilter, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import './EventList.css';

const EventList = ({
  events = [],
  onSelectEvent,
  onRegister,
  registeredEventIds = [],
  actionLabel = 'View Details',
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filtered = events.filter((e) => {
    const matchesSearch =
      !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !category || e.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="event-list-component">
      <div className="card filter-bar">
        <div className="filter-input-wrapper">
          <FaSearch className="filter-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search events by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-wrapper">
          <FaFilter className="filter-icon" />
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
          </select>
        </div>
      </div>

      <div className="event-list-grid">
        {filtered.map((ev) => {
          const isRegistered = registeredEventIds.includes(ev.id);
          return (
            <div key={ev.id} className="event-list-card">
              <div className="event-card-header">
                <span className="badge badge-primary">{ev.category}</span>
                <span className="event-date-chip">
                  {ev.date ? new Date(ev.date).toLocaleDateString() : 'Upcoming'}
                </span>
              </div>

              <h4 className="event-card-title">{ev.title}</h4>
              <p className="event-card-desc">{ev.description?.slice(0, 85)}...</p>

              <div className="event-card-meta">
                <div className="meta-row">
                  <FaClock className="meta-icon" />
                  <span>{ev.time || '10:00 AM'}</span>
                </div>
                <div className="meta-row">
                  <FaMapMarkerAlt className="meta-icon" />
                  <span>{ev.venue || 'Auditorium'}</span>
                </div>
                {ev.capacity && (
                  <div className="meta-row">
                    <FaUsers className="meta-icon" />
                    <span>Capacity: {ev.capacity}</span>
                  </div>
                )}
              </div>

              <div className="event-card-footer">
                {onRegister && (
                  isRegistered ? (
                    <span className="badge badge-success">Registered</span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm register-btn"
                      onClick={() => onRegister(ev.id)}
                    >
                      Register
                    </button>
                  )
                )}
                {onSelectEvent && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => onSelectEvent(ev)}
                  >
                    {actionLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No campus events match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
