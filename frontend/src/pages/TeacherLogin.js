import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaEnvelope, FaLock, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './TeacherLogin.css';

const TeacherLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

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
      setError('Please provide both email/faculty ID and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(formData.email, formData.password);
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        setError('This portal is intended for teachers only. Please use your designated portal.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials or login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page teacher-login-page">
      <div className="auth-container">
        <Link to="/" className="auth-back-link">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-badge teacher-badge">
              <FaChalkboardTeacher />
            </div>
            <h2>Faculty Sign In</h2>
            <p>Coordinate student cohorts, host events, and broadcast announcements</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          {showForgotNotice && (
            <div className="alert alert-info">
              <span>Please contact the Campus Academic Dean or Admin Office to reset faculty login credentials.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email or Faculty ID
              </label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="text"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. prof@uni.edu or FAC987"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn teacher-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In as Faculty'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              New faculty member?{' '}
              <Link to="/teacher/signup" className="auth-footer-link">
                Register for Faculty Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
