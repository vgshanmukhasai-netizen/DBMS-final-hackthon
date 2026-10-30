import React, { useState, useEffect } from 'react';
import { FaTrash, FaSync, FaSearch } from 'react-icons/fa';
import { userService } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError('Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.deleteUser(id);
      setSuccess('User removed successfully.');
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const name = u.profile?.fullName?.toLowerCase() || '';
    const email = u.email?.toLowerCase() || '';
    const role = u.role?.toLowerCase() || '';
    return name.includes(term) || email.includes(term) || role.includes(term);
  });

  return (
    <div className="card">
      <div className="card-header-flex">
        <h3>User Management ({filtered.length})</h3>
        <button type="button" className="btn btn-outline btn-sm" onClick={fetchUsers}>
          <FaSync /> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-group" style={{ maxWidth: '360px', marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Filter users by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Loading users..." />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>ID / Code</th>
                <th>Department</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.profile?.fullName || u.email?.split('@')[0]}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'teacher' ? 'badge-warning' : 'badge-primary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.profile?.studentId || u.profile?.facultyId || '—'}</td>
                  <td>{u.profile?.department || '—'}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm delete-btn"
                        onClick={() => handleDelete(u.id)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No users match your search.
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

export default ManageUsers;
