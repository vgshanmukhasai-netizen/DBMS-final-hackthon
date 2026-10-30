import React, { useState, useEffect } from 'react';
import { FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { attendanceService } from '../../services/attendanceService';
import LoadingSpinner from '../common/LoadingSpinner';
import './AttendanceManager.css';

const AttendanceManager = ({ events = [], students = [] }) => {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) return;

    const fetchEventAttendance = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await attendanceService.getEventAttendance(selectedEventId);
        const records = Array.isArray(data) ? data : data.attendance || data.records || [];

        if (records.length > 0) {
          setRoster(
            records.map((r) => ({
              studentId: r.studentId || r.student?.id || r.id,
              name: r.student?.profile?.fullName || r.studentName || 'Student',
              studentCode: r.student?.profile?.studentId || r.studentIdCode || '—',
              department: r.student?.profile?.department || r.department || '—',
              status: r.status || 'present',
            }))
          );
        } else {
          // Pre-fill with enrolled students
          setRoster(
            students.map((s) => ({
              studentId: s.id,
              name: s.profile?.fullName || s.email,
              studentCode: s.profile?.studentId || '—',
              department: s.profile?.department || '—',
              status: 'present',
            }))
          );
        }
      } catch (err) {
        setRoster(
          students.map((s) => ({
            studentId: s.id,
            name: s.profile?.fullName || s.email,
            studentCode: s.profile?.studentId || '—',
            department: s.profile?.department || '—',
            status: 'present',
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventAttendance();
  }, [selectedEventId, students]);

  const handleStatusChange = (studentId, status) => {
    setRoster((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleSave = async () => {
    if (!selectedEventId) return;
    try {
      setSaving(true);
      setError('');
      const records = roster.map((r) => ({
        studentId: r.studentId,
        status: r.status,
      }));
      await attendanceService.markAttendance(selectedEventId, records);
      setSuccess('Attendance roster successfully submitted!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="attendance-manager-component card">
      <div className="card-header-flex">
        <h3>Attendance Management</h3>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FaCheck />
          <span>{success}</span>
        </div>
      )}

      <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
        <label className="form-label" htmlFor="att-event-select">Select Event:</label>
        <select
          id="att-event-select"
          className="form-control"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Choose Event --</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} ({ev.date ? new Date(ev.date).toLocaleDateString() : 'Active'})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading event attendance roster..." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((item) => (
                  <tr key={item.studentId}>
                    <td><strong>{item.name}</strong></td>
                    <td><code>{item.studentCode}</code></td>
                    <td>{item.department}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="status-radio-group">
                        <label
                          className={`status-btn ${
                            item.status === 'present' ? 'present-active' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={`att-${item.studentId}`}
                            value="present"
                            checked={item.status === 'present'}
                            onChange={() => handleStatusChange(item.studentId, 'present')}
                          />
                          Present
                        </label>
                        <label
                          className={`status-btn ${
                            item.status === 'absent' ? 'absent-active' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={`att-${item.studentId}`}
                            value="absent"
                            checked={item.status === 'absent'}
                            onChange={() => handleStatusChange(item.studentId, 'absent')}
                          />
                          Absent
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                      No student records found for the selected event.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="attendance-footer-actions">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSave}
              disabled={saving || !selectedEventId || roster.length === 0}
            >
              <FaCheck /> {saving ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceManager;
