import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCheck, FaSync } from 'react-icons/fa';
import { userService } from '../../services/userService';
import { eventService } from '../../services/eventService';
import LoadingSpinner from '../common/LoadingSpinner';
import './ManageStudents.css';

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

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const ManageStudents = ({ events = [] }) => {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetEventId, setTargetEventId] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [secFilter, setSecFilter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllStudents();
      setStudents(Array.isArray(data) ? data : data.students || []);
    } catch (err) {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const prof = s.profile || {};
    const matchesSearch =
      !search ||
      (prof.fullName && prof.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (prof.studentId && prof.studentId.toLowerCase().includes(search.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = !deptFilter || prof.department === deptFilter;
    const matchesYear = !yearFilter || prof.yearOfStudy === yearFilter;
    const matchesSec = !secFilter || prof.section === secFilter;

    return matchesSearch && matchesDept && matchesYear && matchesSec;
  });

  const toggleSelectStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFiltered = filteredStudents.map((s) => s.id);
    const areAllSelected = allFiltered.every((id) => selectedIds.includes(id));
    if (areAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFiltered.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFiltered])));
    }
  };

  const handleAssignEvent = async () => {
    if (!targetEventId) {
      setError('Please choose an event to assign students to.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Please select at least one student.');
      return;
    }

    try {
      setLoading(true);
      await eventService.assignEvent(targetEventId, selectedIds);
      setMessage(`Successfully assigned ${selectedIds.length} students to event!`);
      setSelectedIds([]);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-students-component">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card batch-toolbar">
        <div>
          <strong>{selectedIds.length}</strong> of <strong>{filteredStudents.length}</strong> students selected
        </div>

        <div className="batch-controls">
          <select
            className="form-control"
            value={targetEventId}
            onChange={(e) => setTargetEventId(e.target.value)}
          >
            <option value="">-- Choose Event to Assign --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={selectedIds.length === 0 || !targetEventId}
            onClick={handleAssignEvent}
          >
            <FaUserCheck /> Assign Selected
          </button>
        </div>
      </div>

      <div className="card filter-box">
        <div className="filter-grid">
          <div className="filter-input-wrapper">
            <FaSearch className="filter-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            {YEARS.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={secFilter}
            onChange={(e) => setSecFilter(e.target.value)}
          >
            <option value="">All Sections</option>
            {SECTIONS.map((sec) => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSpinner text="Fetching students..." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={
                        filteredStudents.length > 0 &&
                        filteredStudents.every((s) => selectedIds.includes(s.id))
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={isChecked ? 'row-selected' : ''}
                      onClick={() => toggleSelectStudent(s.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectStudent(s.id)}
                        />
                      </td>
                      <td><strong>{s.profile?.fullName || s.email}</strong></td>
                      <td><code>{s.profile?.studentId || '—'}</code></td>
                      <td>{s.email}</td>
                      <td>{s.profile?.department || '—'}</td>
                      <td>{s.profile?.yearOfStudy || '—'}</td>
                      <td><span className="badge badge-primary">Sec {s.profile?.section || 'A'}</span></td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No students match the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
