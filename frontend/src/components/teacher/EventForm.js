import React, { useState } from 'react';
import './EventForm.css';

const EventForm = ({ onSubmit, initialData = null, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Technical',
    date: initialData?.date ? initialData.date.split('T')[0] : '',
    time: initialData?.time || '',
    venue: initialData?.venue || '',
    capacity: initialData?.capacity || 100,
    poster: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, poster: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="event-form-component">
      <div className="form-group">
        <label className="form-label" htmlFor="event-form-title">
          Event Title *
        </label>
        <input
          id="event-form-title"
          name="title"
          type="text"
          className="form-control"
          placeholder="e.g. Annual Web & AI Hackathon"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="event-form-category">
            Category *
          </label>
          <select
            id="event-form-category"
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="event-form-capacity">
            Participant Capacity
          </label>
          <input
            id="event-form-capacity"
            name="capacity"
            type="number"
            className="form-control"
            placeholder="100"
            value={formData.capacity}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="event-form-date">
            Event Date *
          </label>
          <input
            id="event-form-date"
            name="date"
            type="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="event-form-time">
            Time *
          </label>
          <input
            id="event-form-time"
            name="time"
            type="time"
            className="form-control"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="event-form-venue">
          Venue / Location *
        </label>
        <input
          id="event-form-venue"
          name="venue"
          type="text"
          className="form-control"
          placeholder="e.g. CS Lab 2 or Main Auditorium"
          value={formData.venue}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="event-form-desc">
          Description *
        </label>
        <textarea
          id="event-form-desc"
          name="description"
          className="form-control"
          rows="4"
          placeholder="Comprehensive event details, prerequisites, and instructions..."
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="event-form-poster">
          Event Poster Image
        </label>
        <input
          id="event-form-poster"
          type="file"
          accept="image/*"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>

      <div className="event-form-actions">
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving Event...' : initialData ? 'Update Event' : 'Publish Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
