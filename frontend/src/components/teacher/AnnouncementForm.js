import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import './AnnouncementForm.css';

const DEPARTMENTS = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Information Technology',
  'Chemical',
  'Biotechnology',
];

const AnnouncementForm = ({ onSubmit, loading = false, selectedCount = 0 }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetType: selectedCount > 0 ? 'specific' : 'all',
    targetValue: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="announcement-form-component">
      <div className="form-group">
        <label className="form-label" htmlFor="ann-title">Announcement Title *</label>
        <input
          id="ann-title"
          name="title"
          type="text"
          className="form-control"
          placeholder="e.g. Schedule Change for Hackathon 2026"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="ann-type">Priority / Type</label>
          <select
            id="ann-type"
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="general">General Notice</option>
            <option value="urgent">Urgent Alert</option>
            <option value="event">Event Update</option>
            <option value="academic">Academic Notice</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ann-target">Target Audience</label>
          <select
            id="ann-target"
            name="targetType"
            className="form-control"
            value={formData.targetType}
            onChange={handleChange}
          >
            <option value="all">Entire University Campus</option>
            <option value="department">Specific Department</option>
            <option value="year">Specific Year</option>
            {selectedCount > 0 && (
              <option value="specific">Selected Students ({selectedCount})</option>
            )}
          </select>
        </div>
      </div>

      {formData.targetType === 'department' && (
        <div className="form-group">
          <label className="form-label" htmlFor="ann-dept">Select Department *</label>
          <select
            id="ann-dept"
            name="targetValue"
            className="form-control"
            value={formData.targetValue}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose Department --</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="ann-msg">Announcement Message *</label>
        <textarea
          id="ann-msg"
          name="message"
          className="form-control"
          rows="4"
          placeholder="Enter the complete announcement message..."
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        <FaPaperPlane /> {loading ? 'Broadcasting...' : 'Broadcast Announcement'}
      </button>
    </form>
  );
};

export default AnnouncementForm;
