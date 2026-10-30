import React from 'react';
import { FaCalendarAlt, FaUserGraduate, FaChalkboardTeacher, FaClipboardList } from 'react-icons/fa';

const AdminStats = ({ stats = {} }) => {
  return (
    <div className="stats-cards-grid">
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Events</span>
          <div className="stat-icon-wrapper icon-events">
            <FaCalendarAlt />
          </div>
        </div>
        <div className="stat-number">{stats.totalEvents || 0}</div>
        <div className="stat-footer text-success">
          <span>{stats.upcomingEvents || 0} upcoming active</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Enrolled Students</span>
          <div className="stat-icon-wrapper icon-students">
            <FaUserGraduate />
          </div>
        </div>
        <div className="stat-number">{stats.totalStudents || 0}</div>
        <div className="stat-footer text-muted">
          <span>Across all academic departments</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Faculty Members</span>
          <div className="stat-icon-wrapper icon-teachers">
            <FaChalkboardTeacher />
          </div>
        </div>
        <div className="stat-number">{stats.totalTeachers || 0}</div>
        <div className="stat-footer text-muted">
          <span>Registered faculty educators</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Registrations</span>
          <div className="stat-icon-wrapper icon-registrations">
            <FaClipboardList />
          </div>
        </div>
        <div className="stat-number">{stats.totalRegistrations || 0}</div>
        <div className="stat-footer text-success">
          <span>Participation records</span>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
