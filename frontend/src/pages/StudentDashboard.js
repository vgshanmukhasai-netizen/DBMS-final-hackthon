import React, { useState, useEffect, useCallback } from 'react';
import {
  FaGraduationCap,
  FaCalendarAlt,
  FaClipboardList,
  FaBullhorn,
  FaBell,
  FaCertificate,
  FaUser,
  FaSearch,
  FaFilter,
  FaDownload,
  FaCheck,
  FaTimes,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaExclamationCircle,
  FaCheckCircle,
  FaIdCard,
  FaBuilding,
  FaLayerGroup,
} from 'react-icons/fa';

import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';

import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { announcementService } from '../services/announcementService';
import { notificationService } from '../services/notificationService';
import { certificateService } from '../services/certificateService';
import { attendanceService } from '../services/attendanceService';
import './StudentDashboard.css';

const STUDENT_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaGraduationCap },
  { id: 'events', label: 'Browse Events', icon: FaCalendarAlt },
  { id: 'registrations', label: 'My Registrations', icon: FaClipboardList },
  { id: 'announcements', label: 'Announcements', icon: FaBullhorn },
  { id: 'notifications', label: 'Notifications', icon: FaBell },
  { id: 'certificates', label: 'My Certificates', icon: FaCertificate },
  { id: 'profile', label: 'My Profile', icon: FaUser },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Search & Filter state for events
  const [eventSearch, setEventSearch] = useState('');
  const [eventCategory, setEventCategory] = useState('');

  // Modal for event detail
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  // 1. Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      const data = await eventService.getEvents();
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }, []);

  // 2. Fetch My Registrations
  const fetchMyRegistrations = useCallback(async () => {
    try {
      const data = await registrationService.getMyRegistrations();
      setMyRegistrations(Array.isArray(data) ? data : data.registrations || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
    }
  }, []);

  // 3. Fetch My Announcements
  const fetchMyAnnouncements = useCallback(async () => {
    try {
      const data = await announcementService.getMyAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : data.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    }
  }, []);

  // 4. Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  // 5. Fetch My Certificates
  const fetchCertificates = useCallback(async () => {
    try {
      const data = await certificateService.getMyCertificates();
      setCertificates(Array.isArray(data) ? data : data.certificates || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    }
  }, []);

  // 6. Fetch Student Attendance History
  const fetchAttendanceHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await attendanceService.getStudentAttendance(user.id);
      setAttendanceHistory(Array.isArray(data) ? data : data.attendance || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    }
  }, [user]);

  // Initial Data Fetch
  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
    fetchMyAnnouncements();
    fetchNotifications();
    fetchCertificates();
    fetchAttendanceHistory();
  }, [
    fetchEvents,
    fetchMyRegistrations,
    fetchMyAnnouncements,
    fetchNotifications,
    fetchCertificates,
    fetchAttendanceHistory,
  ]);

  // Handle Event Registration
  const handleRegister = async (eventId) => {
    try {
      setLoading(true);
      setError('');
      await registrationService.registerForEvent(eventId);
      setSuccess('You have registered successfully for this event!');
      fetchMyRegistrations();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed or you are already registered.';
      setError(msg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration Cancellation
  const handleCancelRegistration = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel this event registration?')) return;
    try {
      setLoading(true);
      await registrationService.cancelRegistration(regId);
      setSuccess('Registration cancelled successfully.');
      fetchMyRegistrations();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Certificate Download
  const handleDownloadCertificate = async (certId) => {
    try {
      await certificateService.downloadCertificate(certId, `Certificate_${certId}.pdf`);
    } catch (err) {
      setError('Failed to download certificate.');
    }
  };

  // Check if student registered for event
  const isRegisteredForEvent = (eventId) => {
    return myRegistrations.some(
      (r) => (r.eventId === eventId || r.event?.id === eventId) && r.status !== 'cancelled'
    );
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      !eventSearch ||
      (ev.title && ev.title.toLowerCase().includes(eventSearch.toLowerCase())) ||
      (ev.venue && ev.venue.toLowerCase().includes(eventSearch.toLowerCase()));
    const matchesCat = !eventCategory || ev.category === eventCategory;
    return matchesSearch && matchesCat;
  });

  const studentProfile = user?.profile || {};

  return (
    <div className="dashboard-layout">
      <Sidebar
        items={STUDENT_NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roleTitle="Student Portal"
      />

      <div className="dashboard-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="dashboard-content">
          {/* Header Title Bar */}
          <div className="dashboard-page-header">
            <div>
              <h1 className="dashboard-title">
                {activeTab === 'dashboard'
                  ? `Welcome back, ${studentProfile.fullName || 'Student'}!`
                  : STUDENT_NAV_ITEMS.find((item) => item.id === activeTab)?.label}
              </h1>
              <p className="dashboard-subtitle">
                {studentProfile.department || 'Undergraduate Program'} &bull;{' '}
                {studentProfile.yearOfStudy || 'Student'}{' '}
                {studentProfile.section ? `(Section ${studentProfile.section})` : ''} &bull; ID:{' '}
                {studentProfile.studentId || 'N/A'}
              </p>
            </div>
            {activeTab === 'dashboard' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveTab('events')}
              >
                <FaSearch /> Explore All Events
              </button>
            )}
          </div>

          {/* Feedback alerts */}
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

          {/* ================= TAB 1: DASHBOARD OVERVIEW ================= */}
          {activeTab === 'dashboard' && (
            <div className="student-overview-section">
              {/* Quick Stat Cards */}
              <div className="stats-cards-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Available Events</span>
                    <div className="stat-icon-wrapper icon-events">
                      <FaCalendarAlt />
                    </div>
                  </div>
                  <div className="stat-number">{events.length}</div>
                  <div className="stat-footer text-success">
                    <span>Upcoming activities</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">My Registrations</span>
                    <div className="stat-icon-wrapper icon-registrations">
                      <FaClipboardList />
                    </div>
                  </div>
                  <div className="stat-number">
                    {myRegistrations.filter((r) => r.status !== 'cancelled').length}
                  </div>
                  <div className="stat-footer text-muted">
                    <span>Active event enrolments</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Earned Certificates</span>
                    <div className="stat-icon-wrapper icon-teachers">
                      <FaCertificate />
                    </div>
                  </div>
                  <div className="stat-number">{certificates.length}</div>
                  <div className="stat-footer text-success">
                    <span>Verified participations</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Notifications</span>
                    <div className="stat-icon-wrapper icon-students">
                      <FaBell />
                    </div>
                  </div>
                  <div className="stat-number">
                    {notifications.filter((n) => !n.isRead).length}
                  </div>
                  <div className="stat-footer text-muted">
                    <span>Unread alerts</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Events Carousel/Grid */}
              <div className="overview-events-container card">
                <div className="card-header-flex">
                  <h3>Featured Campus Events</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('events')}
                  >
                    View All ({events.length})
                  </button>
                </div>

                <div className="events-grid-cards">
                  {events.slice(0, 3).map((ev) => {
                    const registered = isRegisteredForEvent(ev.id);
                    return (
                      <div key={ev.id} className="student-event-card">
                        <div className="event-card-header">
                          <span className="badge badge-primary">{ev.category}</span>
                          <span className="event-date-chip">
                            {ev.date ? new Date(ev.date).toLocaleDateString() : 'Upcoming'}
                          </span>
                        </div>
                        <h4 className="event-card-title">{ev.title}</h4>
                        <p className="event-card-desc">
                          {ev.description?.slice(0, 85)}...
                        </p>
                        <div className="event-card-meta">
                          <div className="meta-row">
                            <FaClock className="meta-icon" />
                            <span>{ev.time || '10:00 AM'}</span>
                          </div>
                          <div className="meta-row">
                            <FaMapMarkerAlt className="meta-icon" />
                            <span>{ev.venue || 'Campus Auditorium'}</span>
                          </div>
                        </div>
                        <div className="event-card-footer">
                          {registered ? (
                            <span className="badge badge-success registered-badge">
                              <FaCheck /> Registered
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm register-btn"
                              onClick={() => handleRegister(ev.id)}
                            >
                              Register Now
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedEventModal(ev)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {events.length === 0 && (
                    <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No upcoming campus events found at this moment.
                    </p>
                  )}
                </div>
              </div>

              {/* Announcements & Notifications 2-column preview */}
              <div className="two-column-overview">
                <div className="card">
                  <div className="card-header-flex">
                    <h3>Recent Campus Announcements</h3>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab('announcements')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="recent-announcements-list">
                    {announcements.slice(0, 3).map((a) => (
                      <div key={a.id} className="announcement-preview-card">
                        <div className="preview-top">
                          <strong>{a.title}</strong>
                          <span className="badge badge-info">{a.type || 'Notice'}</span>
                        </div>
                        <p className="preview-text">{a.message}</p>
                        <span className="preview-date">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <p className="empty-text">No announcements for your department yet.</p>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header-flex">
                    <h3>Recent Notifications</h3>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab('notifications')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="notifications-feed">
                    {notifications.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        className={`notification-card ${!n.isRead ? 'unread' : ''}`}
                      >
                        <div className="notif-feed-header">
                          <strong>{n.title}</strong>
                          <span className="notif-feed-time">
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="notif-feed-message">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="empty-text">You have no new notifications.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BROWSE EVENTS ================= */}
          {activeTab === 'events' && (
            <div className="student-events-section">
              <div className="card filter-bar">
                <div className="filter-input-wrapper">
                  <FaSearch className="filter-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search events by title or venue..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                  />
                </div>
                <div className="filter-select-wrapper">
                  <FaFilter className="filter-icon" />
                  <select
                    className="form-control"
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
              </div>

              <div className="events-grid-cards">
                {filteredEvents.map((ev) => {
                  const registered = isRegisteredForEvent(ev.id);
                  return (
                    <div key={ev.id} className="student-event-card">
                      <div className="event-card-header">
                        <span className="badge badge-primary">{ev.category}</span>
                        <span className="event-date-chip">
                          {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      <h4 className="event-card-title">{ev.title}</h4>
                      <p className="event-card-desc">{ev.description}</p>
                      <div className="event-card-meta">
                        <div className="meta-row">
                          <FaClock className="meta-icon" />
                          <span>{ev.time || '10:00 AM'}</span>
                        </div>
                        <div className="meta-row">
                          <FaMapMarkerAlt className="meta-icon" />
                          <span>{ev.venue || 'Campus Auditorium'}</span>
                        </div>
                        <div className="meta-row">
                          <FaUsers className="meta-icon" />
                          <span>Capacity: {ev.capacity || 'Open Registration'}</span>
                        </div>
                      </div>
                      <div className="event-card-footer">
                        {registered ? (
                          <span className="badge badge-success registered-badge">
                            <FaCheck /> Registered
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary register-btn"
                            onClick={() => handleRegister(ev.id)}
                            disabled={loading}
                          >
                            Register
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setSelectedEventModal(ev)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                      No events match your current filter criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: MY REGISTRATIONS ================= */}
          {activeTab === 'registrations' && (
            <div className="card my-registrations-section">
              <div className="card-header-flex">
                <h3>My Event Registrations ({myRegistrations.length})</h3>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Category</th>
                      <th>Date & Time</th>
                      <th>Venue</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRegistrations.map((reg) => {
                      const ev = reg.event || reg;
                      return (
                        <tr key={reg.id}>
                          <td><strong>{ev.title || 'Campus Event'}</strong></td>
                          <td><span className="badge badge-primary">{ev.category || 'General'}</span></td>
                          <td>
                            {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD'}{' '}
                            {ev.time ? `at ${ev.time}` : ''}
                          </td>
                          <td>{ev.venue || 'Campus Hall'}</td>
                          <td>
                            <span
                              className={`badge ${
                                reg.status === 'confirmed' || reg.status === 'registered'
                                  ? 'badge-success'
                                  : reg.status === 'cancelled'
                                  ? 'badge-danger'
                                  : 'badge-info'
                              }`}
                            >
                              {reg.status || 'Registered'}
                            </span>
                          </td>
                          <td>
                            {reg.status !== 'cancelled' && (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm delete-btn"
                                onClick={() => handleCancelRegistration(reg.id)}
                              >
                                Cancel Registration
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {myRegistrations.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          You have not registered for any events yet.{' '}
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ marginLeft: '8px' }}
                            onClick={() => setActiveTab('events')}
                          >
                            Explore Events
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: ANNOUNCEMENTS ================= */}
          {activeTab === 'announcements' && (
            <div className="card announcements-section">
              <div className="card-header-flex">
                <h3>Campus & Department Announcements ({announcements.length})</h3>
              </div>

              <div className="announcements-grid-list">
                {announcements.map((a) => (
                  <div key={a.id} className="announcement-full-card">
                    <div className="announcement-card-header">
                      <div>
                        <h4>{a.title}</h4>
                        <span className="announcement-meta">
                          Published: {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'} &bull;{' '}
                          Target: {a.targetType || 'Department'}
                        </span>
                      </div>
                      <span
                        className={`badge ${
                          a.type === 'urgent' ? 'badge-danger' : 'badge-primary'
                        }`}
                      >
                        {a.type || 'Notice'}
                      </span>
                    </div>
                    <p className="announcement-card-body">{a.message}</p>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No announcements available for your department at this time.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 5: NOTIFICATIONS ================= */}
          {activeTab === 'notifications' && (
            <div className="card notifications-tab-card">
              <div className="card-header-flex">
                <h3>Notifications ({notifications.length})</h3>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={async () => {
                    await notificationService.markAllAsRead();
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                  }}
                >
                  Mark All as Read
                </button>
              </div>

              <div className="notifications-feed">
                {notifications.map((n) => (
                  <div key={n.id} className={`notification-card ${!n.isRead ? 'unread' : ''}`}>
                    <div className="notif-feed-header">
                      <strong>{n.title}</strong>
                      <span className="notif-feed-time">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="notif-feed-message">{n.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No notifications available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 6: MY CERTIFICATES ================= */}
          {activeTab === 'certificates' && (
            <div className="certificates-section">
              <div className="card-header-flex" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h3>Participation Certificates ({certificates.length})</h3>
                  <p className="card-subtitle">
                    Verified digital credentials awarded for verified attendance at university events
                  </p>
                </div>
              </div>

              <div className="certificates-grid">
                {certificates.map((cert) => (
                  <div key={cert.id} className="certificate-card">
                    <div className="cert-card-icon">
                      <FaCertificate />
                    </div>
                    <span className="cert-badge">Official Certificate</span>
                    <h4 className="cert-event-title">{cert.event?.title || cert.eventTitle || 'Event Certificate'}</h4>
                    <p className="cert-student-name">
                      Awarded to: <strong>{studentProfile.fullName || 'Student'}</strong>
                    </p>
                    <div className="cert-meta">
                      <span>ID: <code>{cert.certificateNumber || cert.id}</code></span>
                      <span>
                        Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-block cert-download-btn"
                      onClick={() => handleDownloadCertificate(cert.id)}
                    >
                      <FaDownload /> Download PDF
                    </button>
                  </div>
                ))}
                {certificates.length === 0 && (
                  <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                    <FaCertificate style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <h4>No Certificates Issued Yet</h4>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto' }}>
                      Once you attend campus workshops and your presence is verified by faculty, your downloadable certificate will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 7: PROFILE & ATTENDANCE RECORD ================= */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-grid">
                {/* Profile Information Card */}
                <div className="card profile-info-card">
                  <div className="profile-avatar-box">
                    <div className="profile-avatar-circle">
                      <FaUser />
                    </div>
                    <h3>{studentProfile.fullName || user?.email}</h3>
                    <span className="badge badge-primary">Student Account</span>
                  </div>

                  <div className="profile-details-list">
                    <div className="profile-detail-item">
                      <span className="detail-label">
                        <FaIdCard className="detail-icon" /> Student ID:
                      </span>
                      <span className="detail-value">{studentProfile.studentId || '—'}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="detail-label">
                        <FaBuilding className="detail-icon" /> Department:
                      </span>
                      <span className="detail-value">{studentProfile.department || 'General'}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="detail-label">
                        <FaLayerGroup className="detail-icon" /> Year & Section:
                      </span>
                      <span className="detail-value">
                        {studentProfile.yearOfStudy || '—'}{' '}
                        {studentProfile.section ? `(Sec ${studentProfile.section})` : ''}
                      </span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="detail-label">Email Address:</span>
                      <span className="detail-value">{user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Record History Card */}
                <div className="card attendance-history-card">
                  <h3>My Attendance History</h3>
                  <p className="card-subtitle">Verified attendance logged across attended events</p>

                  <div className="table-responsive" style={{ marginTop: '1rem' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Status</th>
                          <th>Recorded Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceHistory.map((rec, i) => (
                          <tr key={rec.id || i}>
                            <td><strong>{rec.event?.title || rec.eventName || 'Campus Session'}</strong></td>
                            <td>
                              <span
                                className={`badge ${
                                  rec.status === 'present' ? 'badge-success' : 'badge-danger'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td>
                              {rec.markedAt || rec.createdAt
                                ? new Date(rec.markedAt || rec.createdAt).toLocaleDateString()
                                : 'Recorded'}
                            </td>
                          </tr>
                        ))}
                        {attendanceHistory.length === 0 && (
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                              No attendance records logged yet. Attend events to build your attendance record.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEventModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{selectedEventModal.title}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedEventModal(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="event-modal-content">
              <div className="event-modal-badge-row">
                <span className="badge badge-primary">{selectedEventModal.category}</span>
                <span className="badge badge-info">
                  Capacity: {selectedEventModal.capacity || 'Open'}
                </span>
              </div>

              <p className="event-modal-desc">{selectedEventModal.description}</p>

              <div className="event-modal-meta-grid">
                <div className="modal-meta-box">
                  <strong>Date:</strong>{' '}
                  {selectedEventModal.date
                    ? new Date(selectedEventModal.date).toLocaleDateString()
                    : 'TBD'}
                </div>
                <div className="modal-meta-box">
                  <strong>Time:</strong> {selectedEventModal.time || '10:00 AM'}
                </div>
                <div className="modal-meta-box">
                  <strong>Venue:</strong> {selectedEventModal.venue || 'Campus Auditorium'}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedEventModal(null)}
                >
                  Close
                </button>
                {isRegisteredForEvent(selectedEventModal.id) ? (
                  <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    <FaCheck /> Already Registered
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      handleRegister(selectedEventModal.id);
                      setSelectedEventModal(null);
                    }}
                  >
                    Confirm Registration
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
