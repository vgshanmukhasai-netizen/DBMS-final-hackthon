import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaSignOutAlt, FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCollege } from '../../context/CollegeContext';
import NotificationBell from './NotificationBell';
import CollegeLogo from './CollegeLogo';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { college, openSelector } = useCollege();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-danger';
      case 'teacher':
        return 'badge-warning';
      case 'student':
        return 'badge-primary';
      default:
        return 'badge-info';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {isAuthenticated && onToggleSidebar && (
            <button
              type="button"
              className="navbar-toggle-btn"
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <FaBars />
            </button>
          )}
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo">
              <FaGraduationCap />
            </div>
            <div className="navbar-title-box">
              <span className="navbar-title">EventSphere</span>
              <span className="navbar-subtitle">Smart Campus Event and Communication Portal</span>
            </div>
          </Link>

          {college && (
            <button
              type="button"
              className="navbar-college"
              onClick={openSelector}
              title={`${college.name} — click to change college`}
            >
              <CollegeLogo college={college} size={40} />
              <span className="navbar-college-text">
                <span className="navbar-college-label">Your Campus</span>
                <span className="navbar-college-name">{college.short || college.name}</span>
              </span>
            </button>
          )}
        </div>

        <div className="navbar-right">
          {isAuthenticated && user ? (
            <div className="navbar-user-section">
              <NotificationBell />
              
              <div className="navbar-user-info">
                <div className="user-avatar-circle">
                  <FaUserCircle />
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {user.profile?.fullName || user.email?.split('@')[0] || 'User'}
                  </span>
                  <span className={`badge ${getRoleBadgeClass(user.role)} user-role-badge`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline navbar-logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <FaSignOutAlt />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/student/login" className="btn btn-outline btn-sm">
                Student
              </Link>
              <Link to="/teacher/login" className="btn btn-outline btn-sm">
                Teacher
              </Link>
              <Link to="/admin/login" className="btn btn-primary btn-sm">
                Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
