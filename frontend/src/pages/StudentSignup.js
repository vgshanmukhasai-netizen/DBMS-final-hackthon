import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaGraduationCap,
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaBuilding,
  FaCalendarAlt,
  FaLayerGroup,
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './StudentSignup.css';

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

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    department: '',
    yearOfStudy: '',
    section: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validations
    if (
      !formData.fullName ||
      !formData.studentId ||
      !formData.email ||
      !formData.department ||
      !formData.yearOfStudy ||
      !formData.section ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill out all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      await registerStudent({
        fullName: formData.fullName,
        studentId: formData.studentId,
        email: formData.email,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        section: formData.section,
        password: formData.password,
      });

      setSuccess('Account created successfully! Redirecting to student login...');
      setTimeout(() => {
        navigate('/student/login');
      }, 2000);
    } catch (err) {
      console.error('Student registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.message === 'Network Error' || !err.response
          ? 'Backend server is not reachable on port 5000. Please ensure the backend server is running.'
          : 'Registration failed. Please check your information and try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page student-signup-page">
      <div className="signup-container">
        <Link to="/" className="auth-back-link">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="auth-card signup-card">
          <div className="auth-header">
            <div className="auth-icon-badge student-badge">
              <FaGraduationCap />
            </div>
            <h2>Create Student Account</h2>
            <p>Join the university events platform to register for events and earn certificates</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <FaCheckCircle />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name *
                </label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="form-control"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Student ID */}
              <div className="form-group">
                <label className="form-label" htmlFor="studentId">
                  Student ID *
                </label>
                <div className="input-with-icon">
                  <FaIdCard className="input-icon" />
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    className="form-control"
                    placeholder="e.g. 21CS045"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="form-group form-col-span">
                <label className="form-label" htmlFor="email">
                  University Email Address *
                </label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="johndoe@student.uni.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="department">
                  Department *
                </label>
                <div className="input-with-icon">
                  <FaBuilding className="input-icon" />
                  <select
                    id="department"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year of Study */}
              <div className="form-group">
                <label className="form-label" htmlFor="yearOfStudy">
                  Year of Study *
                </label>
                <div className="input-with-icon">
                  <FaCalendarAlt className="input-icon" />
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    className="form-control"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    {YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section */}
              <div className="form-group form-col-span">
                <label className="form-label" htmlFor="section">
                  Section *
                </label>
                <div className="input-with-icon">
                  <FaLayerGroup className="input-icon" />
                  <select
                    id="section"
                    name="section"
                    className="form-control"
                    value={formData.section}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Section</option>
                    {SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password * (min 6 chars)
                </label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Student Registration'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already registered?{' '}
              <Link to="/student/login" className="auth-footer-link">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;
