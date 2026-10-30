import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaPlusCircle,
  FaUsers,
  FaBullhorn,
  FaClipboardCheck,
  FaBell,
  FaSearch,
  FaCheck,
  FaTrash,
  FaEdit,
  FaUserCheck,
  FaPaperPlane,
  FaExclamationCircle,
} from 'react-icons/fa';

import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import { announcementService } from '../services/announcementService';
import { attendanceService } from '../services/attendanceService';
import { notificationService } from '../services/notificationService';
import './TeacherDashboard.css';

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

const TEACHER_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChalkboardTeacher },
  { id: 'my-events', label: 'My Events', icon: FaCalendarAlt },
  { id: 'create-event', label: 'Create Event', icon: FaPlusCircle },
  { id: 'students', label: 'Manage Students', icon: FaUsers },
  { id: 'announcements', label: 'Announcements', icon: FaBullhorn },
  { id: 'attendance', label: 'Attendance Marking', icon: FaClipboardCheck },
  { id: 'notifications', label: 'Notifications', icon: FaBell },
];

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Events data
  const [events, setEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);

  // Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    venue: '',
    capacity: 100,
    poster: null,
  });

  // Students Data & Multi-Select state
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [assignTargetEventId, setAssignTargetEventId] = useState('');

  // Announcements Data & Form State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'general',
    targetType: 'all',
    targetValue: '',
  });

  // Attendance state
  const [attendanceEventId, setAttendanceEventId] = useState('');
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  // 1. Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      const data = await eventService.getEvents();
      const list = Array.isArray(data) ? data : data.events || [];
      setEvents(list);
      if (list.length > 0 && !attendanceEventId) {
        setAttendanceEventId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [attendanceEventId]);

  // 2. Fetch Students
  const fetchStudents = useCallback(async () => {
    try {
      const data = await userService.getAllStudents();
      setStudents(Array.isArray(data) ? data : data.students || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // 3. Fetch Announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await announcementService.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : data.announcements || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // 4. Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEvents();
    fetchStudents();
    fetchAnnouncements();
    fetchNotifications();
  }, [fetchEvents, fetchStudents, fetchAnnouncements, fetchNotifications]);

  // Load attendance when attendanceEventId changes or attendance tab opened
  const loadAttendanceRoster = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      setLoading(true);
      const data = await attendanceService.getEventAttendance(eventId);
      const records = Array.isArray(data) ? data : data.attendance || data.records || [];
      
      // If records exist from backend, initialize status map; otherwise prepare with students list
      if (records.length > 0) {
        setAttendanceRoster(
          records.map((r) => ({
            studentId: r.studentId || r.student?.id || r.id,
            name: r.student?.profile?.fullName || r.studentName || 'Student',
            studentCode: r.student?.profile?.studentId || r.studentIdCode || '—',
            department: r.student?.profile?.department || r.department || '—',
            status: r.status || 'present',
          }))
        );
      } else {
        // Fallback to students list
        setAttendanceRoster(
          students.map((s) => ({
            studentId: s.id,
            name: s.profile?.fullName || s.email,
            studentCode: s.profile?.studentId || '—',
            department: s.profile?.department || '—',
            status: 'present',
          }))
        );
      }
    } catch (err) {
      console.error(err);
      // Populate with students
      setAttendanceRoster(
        students.map((s) => ({
          studentId: s.id,
          name: s.profile?.fullName || s.email,
          studentCode: s.profile?.studentId || '—',
          department: s.profile?.department || '—',
          status: 'present',
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [students]);

  useEffect(() => {
    if (activeTab === 'attendance' && attendanceEventId) {
      loadAttendanceRoster(attendanceEventId);
    }
  }, [activeTab, attendanceEventId, loadAttendanceRoster]);

  // Handle Event Form Submit (Create or Update)
  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('category', eventForm.category);
      formData.append('event_date', eventForm.date);
      formData.append('start_time', eventForm.time);
      formData.append('venue', eventForm.venue);
      formData.append('max_participants', eventForm.capacity);
      if (eventForm.poster) {
        formData.append('poster', eventForm.poster);
      }

      if (editingEventId) {
        await eventService.updateEvent(editingEventId, formData);
        setSuccess('Event updated successfully!');
      } else {
        await eventService.createEvent(formData);
        setSuccess('New event created and announced to campus!');
      }

      // Reset form
      setEventForm({
        title: '',
        description: '',
        category: 'Technical',
        date: '',
        time: '',
        venue: '',
        capacity: 100,
        poster: null,
      });
      setEditingEventId(null);
      fetchEvents();
      setActiveTab('my-events');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  // Edit Event trigger
  const handleEditEvent = (ev) => {
    setEditingEventId(ev.id);
    setEventForm({
      title: ev.title || '',
      description: ev.description || '',
      category: ev.category || 'Technical',
      date: ev.event_date ? ev.event_date.split('T')[0] : '',
      time: ev.start_time || '',
      venue: ev.venue || '',
      capacity: ev.max_participants || 100,
      poster: null,
    });
    setActiveTab('create-event');
  };

  // Delete Event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setSuccess('Event deleted successfully.');
      fetchEvents();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  // Multi-Student Filter Logic
  const filteredStudents = students.filter((s) => {
    const prof = s.profile || {};
    const matchesSearch =
      !studentSearch ||
      (prof.fullName && prof.fullName.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (prof.studentId && prof.studentId.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()));

    const matchesDept = !selectedDept || prof.department === selectedDept;
    const matchesYear = !selectedYear || prof.yearOfStudy === selectedYear;
    const matchesSec = !selectedSection || prof.section === selectedSection;

    return matchesSearch && matchesDept && matchesYear && matchesSec;
  });

  // Toggle single student checkbox
  const handleToggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all or deselect filtered students
  const handleSelectAllStudents = () => {
    const allFilteredIds = filteredStudents.map((s) => s.id);
    const areAllSelected = allFilteredIds.every((id) => selectedStudentIds.includes(id));
    if (areAllSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // Assign Selected Students to Event
  const handleAssignToEvent = async () => {
    if (!assignTargetEventId) {
      setError('Please select a target event to assign students.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student.');
      return;
    }

    try {
      setLoading(true);
      await eventService.assignEvent(assignTargetEventId, selectedStudentIds);
      setSuccess(`Successfully assigned ${selectedStudentIds.length} students to event!`);
      setSelectedStudentIds([]);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign students to event.');
    } finally {
      setLoading(false);
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.message) {
      setError('Title and message are required.');
      return;
    }

    try {
      setLoading(true);
      await announcementService.createAnnouncement({
        ...announcementForm,
        studentIds: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
      });

      setSuccess('Announcement broadcasted successfully!');
      setAnnouncementForm({
        title: '',
        message: '',
        type: 'general',
        targetType: 'all',
        targetValue: '',
      });
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to broadcast announcement.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementService.deleteAnnouncement(id);
      setSuccess('Announcement removed.');
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to delete announcement.');
    }
  };

  // Attendance Status Change
  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  // Submit Attendance Records
  const handleSaveAttendance = async () => {
    if (!attendanceEventId) {
      setError('Please select an event.');
      return;
    }

    try {
      setSavingAttendance(true);
      const records = attendanceRoster.map((item) => ({
        studentId: item.studentId,
        status: item.status,
      }));

      await attendanceService.markAttendance(attendanceEventId, records);
      setSuccess('Attendance roster recorded successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record attendance.');
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        items={TEACHER_NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roleTitle="Faculty Portal"
      />

      <div className="dashboard-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="dashboard-content">
          {/* Header Title */}
          <div className="dashboard-page-header">
            <div>
              <h1 className="dashboard-title">
                {activeTab === 'dashboard'
                  ? `Welcome, ${user?.profile?.fullName || 'Professor'}`
                  : TEACHER_NAV_ITEMS.find((item) => item.id === activeTab)?.label}
              </h1>
              <p className="dashboard-subtitle">
                {user?.profile?.designation || 'Faculty Member'} &bull; {user?.profile?.department || 'Department of Engineering'}
              </p>
            </div>
            {activeTab === 'my-events' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditingEventId(null);
                  setActiveTab('create-event');
                }}
              >
                <FaPlusCircle /> Host New Event
              </button>
            )}
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="alert alert-danger">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <FaCheck />
              <span>{success}</span>
            </div>
          )}

          {/* ================= TAB 1: TEACHER DASHBOARD OVERVIEW ================= */}
          {activeTab === 'dashboard' && (
            <div className="teacher-overview-section">
              {/* Quick Stat Cards */}
              <div className="stats-cards-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Active Events</span>
                    <div className="stat-icon-wrapper icon-events">
                      <FaCalendarAlt />
                    </div>
                  </div>
                  <div className="stat-number">{events.length}</div>
                  <div className="stat-footer text-success">
                    <span>Events coordinated by faculty</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Total Students Enrolled</span>
                    <div className="stat-icon-wrapper icon-students">
                      <FaUsers />
                    </div>
                  </div>
                  <div className="stat-number">{students.length}</div>
                  <div className="stat-footer text-muted">
                    <span>Eligible campus participants</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Announcements Sent</span>
                    <div className="stat-icon-wrapper icon-teachers">
                      <FaBullhorn />
                    </div>
                  </div>
                  <div className="stat-number">{announcements.length}</div>
                  <div className="stat-footer text-muted">
                    <span>Broadcasted campus notices</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card quick-actions-card">
                <h3>Quick Management Actions</h3>
                <div className="quick-actions-grid">
                  <button
                    type="button"
                    className="quick-action-btn"
                    onClick={() => {
                      setEditingEventId(null);
                      setActiveTab('create-event');
                    }}
                  >
                    <FaPlusCircle className="qa-icon" />
                    <span>Create Event</span>
                  </button>

                  <button
                    type="button"
                    className="quick-action-btn"
                    onClick={() => setActiveTab('students')}
                  >
                    <FaUserCheck className="qa-icon" />
                    <span>Manage Cohorts</span>
                  </button>

                  <button
                    type="button"
                    className="quick-action-btn"
                    onClick={() => setActiveTab('announcements')}
                  >
                    <FaBullhorn className="qa-icon" />
                    <span>Send Notice</span>
                  </button>

                  <button
                    type="button"
                    className="quick-action-btn"
                    onClick={() => setActiveTab('attendance')}
                  >
                    <FaClipboardCheck className="qa-icon" />
                    <span>Mark Attendance</span>
                  </button>
                </div>
              </div>

              {/* Events & Announcements 2-column preview */}
              <div className="two-column-overview">
                <div className="card">
                  <div className="card-header-flex">
                    <h3>Upcoming Events</h3>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab('my-events')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.slice(0, 4).map((ev) => (
                          <tr key={ev.id}>
                            <td><strong>{ev.title}</strong></td>
                            <td>{ev.event_date ? new Date(`${ev.event_date}T00:00:00`).toLocaleDateString() : 'TBD'}</td>
                            <td><span className="badge badge-primary">{ev.category}</span></td>
                          </tr>
                        ))}
                        {events.length === 0 && (
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '1.5rem' }}>
                              No events scheduled yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header-flex">
                    <h3>Recent Announcements</h3>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab('announcements')}
                    >
                      Broadcast New
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
                      <p className="empty-text">No announcements broadcasted yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: MY EVENTS ================= */}
          {activeTab === 'my-events' && (
            <div className="teacher-events-section card">
              <div className="card-header-flex">
                <h3>Coordinated Events ({events.length})</h3>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingEventId(null);
                    setActiveTab('create-event');
                  }}
                >
                  <FaPlusCircle /> Create Event
                </button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Category</th>
                      <th>Date & Time</th>
                      <th>Venue</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td>
                          <div className="event-table-title">
                            <strong>{ev.title}</strong>
                            <span className="event-desc-snippet">{ev.description?.slice(0, 45)}...</span>
                          </div>
                        </td>
                        <td><span className="badge badge-primary">{ev.category}</span></td>
                        <td>
                          {ev.event_date ? new Date(`${ev.event_date}T00:00:00`).toLocaleDateString() : 'TBD'}{' '}
                          {ev.start_time ? `at ${ev.start_time}` : ''}
                        </td>
                        <td>{ev.venue || 'Campus Main Hall'}</td>
                        <td>{ev.max_participants || '100'}</td>
                        <td>
                          <span className={`badge ${ev.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                            {ev.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Edit Event"
                              onClick={() => handleEditEvent(ev)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm delete-btn"
                              title="Delete Event"
                              onClick={() => handleDeleteEvent(ev.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                          You have not created any events yet. Click 'Host New Event' to begin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: CREATE / EDIT EVENT ================= */}
          {activeTab === 'create-event' && (
            <div className="card create-event-card">
              <h3>{editingEventId ? 'Edit Event Details' : 'Create & Host Campus Event'}</h3>
              <p className="card-subtitle">
                Publish a new workshop, technical symposium, or cultural event for university students
              </p>

              <form onSubmit={handleEventFormSubmit} className="event-form" style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AI & Machine Learning Workshop 2026"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      required
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Capacity Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="100"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Scheduled Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Central Auditorium or Lab Block 3"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Event Description & Rules *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Outline event agenda, eligibility criteria, prerequisites, and session milestones..."
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Event Poster Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => setEventForm({ ...eventForm, poster: e.target.files[0] })}
                  />
                </div>

                <div className="form-actions-bar">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setActiveTab('my-events')}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : editingEventId ? 'Update Event' : 'Publish & Announce Event'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 4: MANAGE STUDENTS (MULTI-SELECT) ================= */}
          {activeTab === 'students' && (
            <div className="manage-students-section">
              {/* Batch Action Toolbar */}
              <div className="card batch-action-card">
                <div className="batch-status-text">
                  <strong>{selectedStudentIds.length}</strong> of{' '}
                  <strong>{filteredStudents.length}</strong> students selected
                </div>

                <div className="batch-actions-controls">
                  <div className="assign-event-selector">
                    <select
                      className="form-control"
                      value={assignTargetEventId}
                      onChange={(e) => setAssignTargetEventId(e.target.value)}
                    >
                      <option value="">-- Choose Event to Assign --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={selectedStudentIds.length === 0 || !assignTargetEventId}
                    onClick={handleAssignToEvent}
                  >
                    <FaUserCheck /> Assign Selected to Event
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={selectedStudentIds.length === 0}
                    onClick={() => {
                      setAnnouncementForm((prev) => ({
                        ...prev,
                        targetType: 'specific',
                      }));
                      setActiveTab('announcements');
                    }}
                  >
                    <FaPaperPlane /> Broadcast to Selected
                  </button>
                </div>
              </div>

              {/* Filter controls */}
              <div className="card student-filter-card">
                <div className="student-filter-grid">
                  <div className="filter-input-wrapper">
                    <FaSearch className="filter-icon" />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, student ID, or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-control"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="">All Years</option>
                    {YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    <option value="">All Sections</option>
                    {SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Students Multi-select Table */}
              <div className="card">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={
                              filteredStudents.length > 0 &&
                              filteredStudents.every((s) => selectedStudentIds.includes(s.id))
                            }
                            onChange={handleSelectAllStudents}
                            aria-label="Select all students"
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
                        const isSelected = selectedStudentIds.includes(s.id);
                        return (
                          <tr
                            key={s.id}
                            className={isSelected ? 'row-selected' : ''}
                            onClick={() => handleToggleStudent(s.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td
                              style={{ textAlign: 'center' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleStudent(s.id)}
                                aria-label={`Select ${s.profile?.fullName || 'student'}`}
                              />
                            </td>
                            <td>
                              <strong>{s.profile?.fullName || s.email?.split('@')[0]}</strong>
                            </td>
                            <td><code>{s.profile?.studentId || '—'}</code></td>
                            <td>{s.email}</td>
                            <td>{s.profile?.department || '—'}</td>
                            <td>{s.profile?.yearOfStudy || '—'}</td>
                            <td>
                              <span className="badge badge-primary">
                                Sec {s.profile?.section || 'A'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                            No students match the current filters or search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: ANNOUNCEMENTS ================= */}
          {activeTab === 'announcements' && (
            <div className="teacher-announcements-section">
              {/* Broadcast Announcement Form */}
              <div className="card announcement-create-card">
                <h3>Broadcast Campus Announcement</h3>
                <p className="card-subtitle">
                  Send targeted or campus-wide updates, schedule changes, or registration alerts
                </p>

                <form onSubmit={handleCreateAnnouncement} style={{ marginTop: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Announcement Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Schedule Revision for Robotics Symposium"
                      value={announcementForm.title}
                      onChange={(e) =>
                        setAnnouncementForm({ ...announcementForm, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Announcement Priority / Type</label>
                      <select
                        className="form-control"
                        value={announcementForm.type}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, type: e.target.value })
                        }
                      >
                        <option value="general">General Notice</option>
                        <option value="urgent">Urgent Alert</option>
                        <option value="event">Event Update</option>
                        <option value="academic">Academic Notice</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Target Audience</label>
                      <select
                        className="form-control"
                        value={announcementForm.targetType}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, targetType: e.target.value })
                        }
                      >
                        <option value="all">Entire University Campus</option>
                        <option value="department">Specific Department</option>
                        <option value="year">Specific Year of Study</option>
                        {selectedStudentIds.length > 0 && (
                          <option value="specific">
                            Selected Students ({selectedStudentIds.length})
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  {announcementForm.targetType === 'department' && (
                    <div className="form-group">
                      <label className="form-label">Select Target Department</label>
                      <select
                        className="form-control"
                        value={announcementForm.targetValue}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, targetValue: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Choose Department --</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {announcementForm.targetType === 'year' && (
                    <div className="form-group">
                      <label className="form-label">Select Academic Year</label>
                      <select
                        className="form-control"
                        value={announcementForm.targetValue}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, targetValue: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Choose Year --</option>
                        {YEARS.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Message Content *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Write your announcement details here..."
                      value={announcementForm.message}
                      onChange={(e) =>
                        setAnnouncementForm({ ...announcementForm, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <FaPaperPlane /> Broadcast Announcement
                  </button>
                </form>
              </div>

              {/* Announcements Feed */}
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header-flex">
                  <h3>Active Announcements ({announcements.length})</h3>
                </div>

                <div className="announcements-grid-list">
                  {announcements.map((item) => (
                    <div key={item.id} className="announcement-full-card">
                      <div className="announcement-card-header">
                        <div>
                          <h4>{item.title}</h4>
                          <span className="announcement-meta">
                            Target: {item.targetType || 'All'} &bull;{' '}
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <div className="announcement-card-actions">
                          <span
                            className={`badge ${
                              item.type === 'urgent' ? 'badge-danger' : 'badge-primary'
                            }`}
                          >
                            {item.type || 'Notice'}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm delete-btn"
                            title="Delete"
                            onClick={() => handleDeleteAnnouncement(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <p className="announcement-card-body">{item.message}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No announcements published yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: ATTENDANCE MARKING ================= */}
          {activeTab === 'attendance' && (
            <div className="teacher-attendance-section">
              <div className="card select-event-bar">
                <div className="attendance-select-row">
                  <div style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="teacher-att-select">
                      Select Event for Attendance Verification:
                    </label>
                    <select
                      id="teacher-att-select"
                      className="form-control"
                      value={attendanceEventId}
                      onChange={(e) => setAttendanceEventId(e.target.value)}
                    >
                      <option value="">-- Choose Event --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({ev.date ? new Date(ev.date).toLocaleDateString() : 'Active'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="attendance-quick-toggles">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        setAttendanceRoster((prev) =>
                          prev.map((item) => ({ ...item, status: 'present' }))
                        )
                      }
                    >
                      Mark All Present
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        setAttendanceRoster((prev) =>
                          prev.map((item) => ({ ...item, status: 'absent' }))
                        )
                      }
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header-flex">
                  <h3>
                    Attendance Roster ({attendanceRoster.length} Students)
                  </h3>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance || !attendanceEventId || attendanceRoster.length === 0}
                  >
                    <FaCheck /> {savingAttendance ? 'Saving...' : 'Submit Attendance Records'}
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th>Department</th>
                        <th style={{ width: '240px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRoster.map((item) => (
                        <tr key={item.studentId}>
                          <td><strong>{item.name}</strong></td>
                          <td><code>{item.studentCode}</code></td>
                          <td>{item.department}</td>
                          <td>
                            <div className="attendance-radio-group">
                              <label
                                className={`attendance-option ${
                                  item.status === 'present' ? 'active-present' : ''
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`status-${item.studentId}`}
                                  value="present"
                                  checked={item.status === 'present'}
                                  onChange={() =>
                                    handleAttendanceStatusChange(item.studentId, 'present')
                                  }
                                />
                                Present
                              </label>

                              <label
                                className={`attendance-option ${
                                  item.status === 'absent' ? 'active-absent' : ''
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`status-${item.studentId}`}
                                  value="absent"
                                  checked={item.status === 'absent'}
                                  onChange={() =>
                                    handleAttendanceStatusChange(item.studentId, 'absent')
                                  }
                                />
                                Absent
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {attendanceRoster.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                            {attendanceEventId
                              ? 'No students found for this event roster.'
                              : 'Select an event above to start marking attendance.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: NOTIFICATIONS ================= */}
          {activeTab === 'notifications' && (
            <div className="card notifications-tab-card">
              <div className="card-header-flex">
                <h3>Notifications Inbox ({notifications.length})</h3>
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
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default TeacherDashboard;
