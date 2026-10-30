import React from 'react';
import { FaClock, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import './EventDetails.css';

const EventDetails = ({ event, onClose, onRegister, isRegistered = false }) => {
  if (!event) return null;

  return (
    <div className="event-details-modal-overlay">
      <div className="event-details-modal">
        <div className="event-details-header">
          <div>
            <span className="badge badge-primary">{event.category}</span>
            <h2>{event.title}</h2>
          </div>
          <button type="button" className="details-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="event-details-body">
          <p className="event-full-description">{event.description}</p>

          <div className="event-details-meta-grid">
            <div className="detail-meta-card">
              <FaCalendarAlt className="meta-icon" />
              <div>
                <span className="meta-label">Date</span>
                <span className="meta-value">
                  {event.date ? new Date(event.date).toLocaleDateString() : 'To Be Announced'}
                </span>
              </div>
            </div>

            <div className="detail-meta-card">
              <FaClock className="meta-icon" />
              <div>
                <span className="meta-label">Time</span>
                <span className="meta-value">{event.time || '10:00 AM'}</span>
              </div>
            </div>

            <div className="detail-meta-card">
              <FaMapMarkerAlt className="meta-icon" />
              <div>
                <span className="meta-label">Venue</span>
                <span className="meta-value">{event.venue || 'Campus Hall'}</span>
              </div>
            </div>

            <div className="detail-meta-card">
              <FaUsers className="meta-icon" />
              <div>
                <span className="meta-label">Capacity</span>
                <span className="meta-value">{event.capacity || 'Open Registration'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="event-details-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {onRegister && (
            isRegistered ? (
              <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Already Registered
              </span>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onRegister(event.id);
                  if (onClose) onClose();
                }}
              >
                Register for Event
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
