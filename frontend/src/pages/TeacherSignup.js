import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaChalkboardTeacher,
  FaUser,
  FaIdBadge,
  FaEnvelope,
  FaBuilding,
  FaBriefcase,
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './TeacherSignup.css';

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

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Head of Department (HOD)',
  'Senior Lecturer',
  'Lecturer',
  'Dean / Director',
];

const TeacherSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    facultyId: '',
    email: '',
    department: '',
    designation: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerTeacher } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (
      !formData.fullName ||
      !formData.facultyId ||
      !formData.email ||
      !formData.department ||
      !formData.designation ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await registerTeacher({
        fullName: formData.fullName,
        facultyId: formData.facultyId,
        email: formData.email,
        department: formData.department,
        designation: formData.designation,
        password: formData.password,
      });

      setSuccess(
        'Registration submitted successfully! Your account will require admin approval before access. Redirecting to login...'
      );
      setTimeout(() => {
        navigate('/teacher/login');
      }, 3500);
    } catch (err) {
      console.error('Teacher registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page teacher-signup-page">
      <div className="signup-container">
        <Link to="/" className="auth-back-link">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="auth-card signup-card">
          <div className="auth-header">
            <div className="auth-icon-badge teacher-badge">
              <FaChalkboardTeacher />
            </div>
            <h2>Faculty Account Registration</h2>
            <p>Join the university events coordination and faculty management system</p>
          </div>

          <div className="alert alert-info approval-notice">
            <FaInfoCircle className="notice-icon" />
            <div>
              <strong>Important Notice:</strong> Your account will require administrator approval
              before you are granted access to the faculty portal.
            </div>
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
                    placeholder="Prof. Jane Smith"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Faculty ID */}
              <div className="form-group">
                <label className="form-label" htmlFor="facultyId">
                  Faculty / Staff ID *
                </label>
                <div className="input-with-icon">
                  <FaIdBadge className="input-icon" />
                  <input
                    type="text"
                    id="facultyId"
                    name="facultyId"
                    className="form-control"
                    placeholder="e.g. FAC-2023-019"
                    value={formData.facultyId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="form-group form-col-span">
                <label className="form-label" htmlFor="email">
                  Official Institutional Email *
                </label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="j.smith@faculty.uni.edu"
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

              {/* Designation */}
              <div className="form-group">
                <label className="form-label" htmlFor="designation">
                  Designation *
                </label>
                <div className="input-with-icon">
                  <FaBriefcase className="input-icon" />
                  <select
                    id="designation"
                    name="designation"
                    className="form-control"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Designation</option>
                    {DESIGNATIONS.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
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
                    placeholder="Create secure password"
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
                    placeholder="Verify password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn teacher-submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting Application...' : 'Register for Faculty Access'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an active account?{' '}
              <Link to="/teacher/login" className="auth-footer-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSignup;
