import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserShield, FaEnvelope, FaLock, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please provide administrator email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(formData.email, formData.password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Unauthorized access. This portal is restricted to system administrators.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials or login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-login-page">
      <div className="auth-container">
        <Link to="/" className="auth-back-link">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="auth-card admin-auth-card">
          <div className="auth-header">
            <div className="auth-icon-badge admin-badge">
              <FaUserShield />
            </div>
            <h2>System Administration</h2>
            <p>Institutional control panel and administrative governance</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Admin Email
              </label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="admin@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter administrator password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn admin-submit-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
            </button>
          </form>

          <div className="auth-footer admin-auth-footer">
            <p className="admin-notice">
              Administrative accounts are pre-provisioned. Unauthorized access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
