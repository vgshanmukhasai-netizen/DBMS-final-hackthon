import React, { useState, useEffect } from 'react';
import { FaCheck, FaTrash, FaSync } from 'react-icons/fa';
import { userService } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllTeachers();
      setTeachers(Array.isArray(data) ? data : data.teachers || []);
    } catch (err) {
      setError('Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await userService.approveTeacher(id);
      setSuccess('Faculty member approved.');
      fetchTeachers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to approve teacher.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await userService.deleteUser(id);
      setSuccess('Teacher deleted.');
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete teacher.');
    }
  };

  return (
    <div className="card">
      <div className="card-header-flex">
        <h3>Faculty Management & Approvals ({teachers.length})</h3>
        <button type="button" className="btn btn-outline btn-sm" onClick={fetchTeachers}>
          <FaSync /> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <LoadingSpinner text="Loading faculty members..." />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Faculty ID</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.profile?.fullName || t.email}</strong></td>
                  <td>{t.profile?.facultyId || '—'}</td>
                  <td>{t.email}</td>
                  <td>{t.profile?.department || '—'}</td>
                  <td>{t.profile?.designation || 'Lecturer'}</td>
                  <td>
                    {t.isApproved || t.profile?.isApproved ? (
                      <span className="badge badge-success">Approved</span>
                    ) : (
                      <span className="badge badge-warning">Pending Approval</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(!t.isApproved && !t.profile?.isApproved) && (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleApprove(t.id)}
                        >
                          <FaCheck /> Approve
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm delete-btn"
                        onClick={() => handleDelete(t.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No faculty registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
