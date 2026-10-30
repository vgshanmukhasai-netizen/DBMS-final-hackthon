import React from 'react';
import { FaClock, FaMapMarkerAlt, FaCheck, FaUsers } from 'react-icons/fa';
import './EventCard.css';

const EventCard = ({ event, isRegistered, onRegister, onViewDetails }) => {
  return (
    <div className="event-card-item">
      <div className="event-card-top">
        <span className="badge badge-primary">{event.category}</span>
        <span className="event-date">
          {event.date ? new Date(event.date).toLocaleDateString() : 'Upcoming'}
        </span>
      </div>

      <h4 className="event-title">{event.title}</h4>
      <p className="event-snippet">{event.description?.slice(0, 90)}...</p>

      <div className="event-meta-info">
        <div className="meta-line">
          <FaClock className="meta-icon" />
          <span>{event.time || '10:00 AM'}</span>
        </div>
        <div className="meta-line">
          <FaMapMarkerAlt className="meta-icon" />
          <span>{event.venue || 'Campus Auditorium'}</span>
        </div>
        {event.capacity && (
          <div className="meta-line">
            <FaUsers className="meta-icon" />
            <span>Capacity: {event.capacity}</span>
          </div>
        )}
      </div>

      <div className="event-actions-row">
        {isRegistered ? (
          <span className="badge badge-success registered-label">
            <FaCheck /> Registered
          </span>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onRegister(event.id)}
          >
            Register Now
          </button>
        )}
        {onViewDetails && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onViewDetails(event)}
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
