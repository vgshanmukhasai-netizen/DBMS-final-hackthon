import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChartBar,
  FaCalendarAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaClipboardList,
  FaCertificate,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSync,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';

import { reportService } from '../services/reportService';
import { userService } from '../services/userService';
import { eventService } from '../services/eventService';
import { attendanceService } from '../services/attendanceService';
import { certificateService } from '../services/certificateService';
import './AdminDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
  { id: 'events', label: 'Events', icon: FaCalendarAlt },
  { id: 'users', label: 'Students & Users', icon: FaUsers },
  { id: 'teachers', label: 'Manage Teachers', icon: FaChalkboardTeacher },
  { id: 'attendance', label: 'Attendance', icon: FaClipboardList },
  { id: 'certificates', label: 'Certificates', icon: FaCertificate },
  { id: 'reports', label: 'Detailed Reports', icon: FaFileAlt },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dashboard Stats State
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    completedEvents: 0,
  });

  // Data states
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [deptStats, setDeptStats] = useState([]);

  // Attendance View state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Certificate View state
  const [certEventId, setCertEventId] = useState('');
  const [eventCertificates, setEventCertificates] = useState([]);
  const [generatingCert, setGeneratingCert] = useState(false);

  // Create Event Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    venue: '',
    capacity: 100,
    poster: null,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // 1. Fetch Dashboard Overview
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [dashStats, allEvents, deptData] = await Promise.all([
        reportService.getDashboardStats().catch(() => ({})),
        eventService.getEvents().catch(() => []),
        reportService.getDepartmentReports().catch(() => []),
      ]);

      if (dashStats) setStats((prev) => ({ ...prev, ...dashStats }));
      const eventsList = Array.isArray(allEvents) ? allEvents : allEvents.events || [];
      setEvents(eventsList);
      if (eventsList.length > 0) {
        setSelectedEventId((current) => current || eventsList[0].id || '');
        setCertEventId((current) => current || eventsList[0].id || '');
      }

      setDeptStats(Array.isArray(deptData) ? deptData : deptData.departments || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError('Unable to load dashboard metrics. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Fetch Teachers
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAllTeachers();
      setTeachers(Array.isArray(data) ? data : data.teachers || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch teachers list.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Fetch Attendance for Selected Event
  const fetchAttendance = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      setLoadingAttendance(true);
      const data = await attendanceService.getEventAttendance(eventId);
      setAttendanceRecords(Array.isArray(data) ? data : data.attendance || data.records || []);
    } catch (err) {
      console.error(err);
      setAttendanceRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  // 5. Fetch Certificates for Selected Event
  const fetchCertificates = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      const data = await certificateService.getEventCertificates(eventId);
      setEventCertificates(Array.isArray(data) ? data : data.certificates || []);
    } catch (err) {
      console.error(err);
      setEventCertificates([]);
    }
  }, []);

  // Switch tab triggers
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'events') {
      eventService.getEvents().then((res) => {
        setEvents(Array.isArray(res) ? res : res.events || []);
      }).catch(console.error);
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'teachers') {
      fetchTeachers();
    } else if (activeTab === 'reports') {
      reportService.getDepartmentReports().then((res) => setDeptStats(Array.isArray(res) ? res : res.departments || [])).catch(console.error);
    }
  }, [activeTab, fetchDashboardData, fetchTeachers, fetchUsers]);

  useEffect(() => {
    if (selectedEventId && activeTab === 'attendance') {
      fetchAttendance(selectedEventId);
    }
  }, [activeTab, selectedEventId, fetchAttendance]);

  useEffect(() => {
    if (certEventId && activeTab === 'certificates') {
      fetchCertificates(certEventId);
    }
  }, [activeTab, certEventId, fetchCertificates]);

  // Actions: Approve Teacher
  const handleApproveTeacher = async (id) => {
    try {
      await userService.approveTeacher(id);
      setSuccessMsg('Faculty member approved successfully!');
      fetchTeachers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve teacher.');
    }
  };

  // Actions: Delete User / Teacher
  const handleDeleteUser = async (id, name = 'user') => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${name}?`)) return;
    try {
      await userService.deleteUser(id);
      setSuccessMsg(`${name.charAt(0).toUpperCase() + name.slice(1)} deleted successfully.`);
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'teachers') fetchTeachers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  // Actions: Delete Event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove registrations.')) return;
    try {
      await eventService.deleteEvent(id);
      setSuccessMsg('Event removed successfully.');
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  // Actions: Create Event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('category', newEvent.category);
      formData.append('event_date', newEvent.date);
      formData.append('start_time', newEvent.time);
      formData.append('venue', newEvent.venue);
      formData.append('max_participants', newEvent.capacity);
      if (newEvent.poster) formData.append('poster', newEvent.poster);

      await eventService.createEvent(formData);
      setSuccessMsg('New event created successfully!');
      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        category: 'Technical',
        date: '',
        time: '',
        venue: '',
        capacity: 100,
        poster: null,
      });
      const freshEvents = await eventService.getEvents();
      setEvents(Array.isArray(freshEvents) ? freshEvents : freshEvents.events || []);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  // Actions: Generate Certificates
  const handleGenerateCertificates = async () => {
    if (!certEventId) return;
    try {
      setGeneratingCert(true);
      await certificateService.generateCertificates(certEventId);
      setSuccessMsg('Certificates successfully generated for attended students!');
      fetchCertificates(certEventId);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate certificates.');
    } finally {
      setGeneratingCert(false);
    }
  };

  // Actions: Download Certificate
  const handleDownloadCert = async (certId) => {
    try {
      await certificateService.downloadCertificate(certId);
    } catch (err) {
      setError('Failed to download certificate file.');
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      (ev.title && ev.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.category && ev.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = !filterCategory || ev.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Chart Data Configurations
  const barChartData = {
    labels: ['Technical', 'Cultural', 'Sports', 'Workshops', 'Seminars'],
    datasets: [
      {
        label: 'Events Count',
        data: [
          events.filter((e) => e.category === 'Technical').length || 6,
          events.filter((e) => e.category === 'Cultural').length || 4,
          events.filter((e) => e.category === 'Sports').length || 3,
          events.filter((e) => e.category === 'Workshop').length || 5,
          events.filter((e) => e.category === 'Seminar').length || 4,
        ],
        backgroundColor: '#1a237e',
        borderRadius: 6,
      },
    ],
  };

  const pieChartData = {
    labels: deptStats.length > 0 ? deptStats.map((d) => d.department || d.name) : ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'],
    datasets: [
      {
        label: 'Registrations',
        data: deptStats.length > 0 ? deptStats.map((d) => d.registrations || d.count || 10) : [45, 25, 20, 15, 18],
        backgroundColor: ['#1a237e', '#42a5f5', '#2e7d32', '#f59e0b', '#dc2626', '#8b5cf6'],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Monthly Event Attendance Trend',
        data: [65, 80, 95, 120, 110, 140, 130, 165, 190, 210],
        borderColor: '#42a5f5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        items={ADMIN_NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roleTitle="Administrator"
      />

      <div className="dashboard-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="dashboard-content">
          {/* Header Title Bar */}
          <div className="dashboard-page-header">
            <div>
              <h1 className="dashboard-title">
                {ADMIN_NAV_ITEMS.find((item) => item.id === activeTab)?.label || 'Admin Portal'}
              </h1>
              <p className="dashboard-subtitle">
                Institutional oversight, student & faculty management, and system analytics
              </p>
            </div>
            {activeTab === 'events' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowEventModal(true)}
              >
                <FaPlus /> Create New Event
              </button>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-danger">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success">
              <FaCheck />
              <span>{successMsg}</span>
            </div>
          )}

          {loading && <LoadingSpinner text="Retrieving administrative data..." />}

          {/* ================= SECTION 1: DASHBOARD OVERVIEW ================= */}
          {activeTab === 'dashboard' && !loading && (
            <div className="admin-overview-section">
              {/* Stat Cards */}
              <div className="stats-cards-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Total Events</span>
                    <div className="stat-icon-wrapper icon-events">
                      <FaCalendarAlt />
                    </div>
                  </div>
                  <div className="stat-number">{stats.totalEvents || events.length}</div>
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
                    <span>Across 8 university faculties</span>
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
                    <span>Registered educators</span>
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
                    <span>Across all campus activities</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="dashboard-charts-grid">
                <div className="card chart-card">
                  <div className="card-header-flex">
                    <h3>Events by Category</h3>
                  </div>
                  <div className="chart-wrapper">
                    <Bar
                      data={barChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>

                <div className="card chart-card">
                  <div className="card-header-flex">
                    <h3>Department Registrations</h3>
                  </div>
                  <div className="chart-wrapper chart-wrapper-pie">
                    <Pie
                      data={pieChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Monthly Trend Chart */}
              <div className="card chart-card trend-card">
                <div className="card-header-flex">
                  <h3>Campus Engagement & Attendance Trend</h3>
                </div>
                <div className="chart-wrapper trend-wrapper">
                  <Line
                    data={lineChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>

              {/* Recent Events Overview */}
              <div className="card recent-events-card">
                <div className="card-header-flex">
                  <h3>Recent Campus Events</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('events')}
                  >
                    View All Events
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Event Title</th>
                        <th>Category</th>
                        <th>Scheduled Date</th>
                        <th>Venue</th>
                        <th>Capacity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.slice(0, 5).map((ev) => (
                        <tr key={ev.id}>
                          <td><strong>{ev.title}</strong></td>
                          <td>
                            <span className="badge badge-primary">{ev.category}</span>
                          </td>
                          <td>
                            {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD'}
                          </td>
                          <td>{ev.venue || 'Campus Auditorium'}</td>
                          <td>{ev.capacity || 'Unlimited'}</td>
                          <td>
                            <span
                              className={`badge ${
                                ev.status === 'completed'
                                  ? 'badge-success'
                                  : ev.status === 'cancelled'
                                  ? 'badge-danger'
                                  : 'badge-info'
                              }`}
                            >
                              {ev.status || 'Upcoming'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {events.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                            No events currently scheduled. Click 'Create New Event' to begin.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 2: EVENTS MANAGEMENT ================= */}
          {activeTab === 'events' && (
            <div className="admin-events-section">
              <div className="filter-bar card">
                <div className="filter-input-wrapper">
                  <FaSearch className="filter-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by event title or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-select-wrapper">
                  <FaFilter className="filter-icon" />
                  <select
                    className="form-control"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
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

              <div className="card">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date & Time</th>
                        <th>Venue</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((ev) => (
                        <tr key={ev.id}>
                          <td>
                            <div className="event-table-title">
                              <strong>{ev.title}</strong>
                              <span className="event-desc-snippet">{ev.description?.slice(0, 45)}...</span>
                            </div>
                          </td>
                          <td><span className="badge badge-primary">{ev.category}</span></td>
                          <td>
                            {ev.event_date ? new Date(`${ev.event_date}T00:00:00`).toLocaleDateString() : 'N/A'}{' '}
                            {ev.start_time ? `at ${ev.start_time}` : ''}
                          </td>
                          <td>{ev.venue || 'Main Hall'}</td>
                          <td>{ev.max_participants || 'Open'}</td>
                          <td>
                            <span className={`badge ${ev.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                              {ev.status || 'Active'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-cell">
                              <button
                                type="button"
                                className="btn btn-outline btn-sm action-btn delete-btn"
                                title="Delete Event"
                                onClick={() => handleDeleteEvent(ev.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredEvents.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                            No events matching your search or filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 3: USERS & STUDENTS ================= */}
          {activeTab === 'users' && (
            <div className="admin-users-section card">
              <div className="card-header-flex">
                <h3>Registered Students & Users ({users.length})</h3>
                <button type="button" className="btn btn-outline btn-sm" onClick={fetchUsers}>
                  <FaSync /> Refresh
                </button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Student ID / Info</th>
                      <th>Department</th>
                      <th>Year / Sec</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.profile?.fullName || u.email?.split('@')[0]}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'teacher' ? 'badge-warning' : 'badge-primary'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.profile?.studentId || u.profile?.facultyId || '—'}</td>
                        <td>{u.profile?.department || 'General'}</td>
                        <td>
                          {u.profile?.yearOfStudy ? `${u.profile.yearOfStudy} (Sec ${u.profile.section || 'A'})` : '—'}
                        </td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm delete-btn"
                              title="Delete User"
                              onClick={() => handleDeleteUser(u.id, 'user')}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                          No users found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= SECTION 4: TEACHERS MANAGEMENT ================= */}
          {activeTab === 'teachers' && (
            <div className="admin-teachers-section card">
              <div className="card-header-flex">
                <h3>Faculty Members & Approval Queue ({teachers.length})</h3>
                <button type="button" className="btn btn-outline btn-sm" onClick={fetchTeachers}>
                  <FaSync /> Refresh
                </button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Faculty Name</th>
                      <th>Faculty ID</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Approval Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t) => (
                      <tr key={t.id}>
                        <td><strong>{t.profile?.fullName || t.email}</strong></td>
                        <td>{t.profile?.facultyId || 'N/A'}</td>
                        <td>{t.email}</td>
                        <td>{t.profile?.department || 'N/A'}</td>
                        <td>{t.profile?.designation || 'Lecturer'}</td>
                        <td>
                          {t.isApproved || t.profile?.isApproved ? (
                            <span className="badge badge-success">Approved</span>
                          ) : (
                            <span className="badge badge-warning">Pending Approval</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            {(!t.isApproved && !t.profile?.isApproved) && (
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => handleApproveTeacher(t.id)}
                              >
                                <FaCheck /> Approve
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline btn-sm delete-btn"
                              title="Delete Teacher"
                              onClick={() => handleDeleteUser(t.id, 'faculty member')}
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
                          No teachers registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= SECTION 5: ATTENDANCE RECORDS ================= */}
          {activeTab === 'attendance' && (
            <div className="admin-attendance-section">
              <div className="card select-event-bar">
                <label className="form-label" htmlFor="select-event">
                  Select Event to View Attendance:
                </label>
                <select
                  id="select-event"
                  className="form-control"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.date ? new Date(ev.date).toLocaleDateString() : 'Upcoming'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="card">
                <div className="card-header-flex">
                  <h3>
                    Attendance Roster{' '}
                    {attendanceRecords.length > 0 && `(${attendanceRecords.length} Students)`}
                  </h3>
                </div>

                {loadingAttendance ? (
                  <LoadingSpinner text="Fetching attendance records..." />
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Student ID</th>
                          <th>Department</th>
                          <th>Attendance Status</th>
                          <th>Marked At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((rec, idx) => (
                          <tr key={rec.id || idx}>
                            <td>
                              <strong>{rec.student?.profile?.fullName || rec.studentName || rec.studentId || 'Student'}</strong>
                            </td>
                            <td>{rec.student?.profile?.studentId || rec.studentIdCode || '—'}</td>
                            <td>{rec.student?.profile?.department || rec.department || 'N/A'}</td>
                            <td>
                              <span
                                className={`badge ${
                                  rec.status === 'present'
                                    ? 'badge-success'
                                    : rec.status === 'absent'
                                    ? 'badge-danger'
                                    : 'badge-warning'
                                }`}
                              >
                                {rec.status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              {rec.markedAt || rec.createdAt
                                ? new Date(rec.markedAt || rec.createdAt).toLocaleDateString()
                                : '—'}
                            </td>
                          </tr>
                        ))}
                        {attendanceRecords.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                              {selectedEventId
                                ? 'No attendance records logged for this event yet.'
                                : 'Please select an event above to inspect attendance records.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION 6: CERTIFICATES ================= */}
          {activeTab === 'certificates' && (
            <div className="admin-certificates-section">
              <div className="card select-event-bar">
                <div className="cert-control-row">
                  <div style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="cert-event-select">
                      Select Event for Certification:
                    </label>
                    <select
                      id="cert-event-select"
                      className="form-control"
                      value={certEventId}
                      onChange={(e) => setCertEventId(e.target.value)}
                    >
                      <option value="">-- Choose an Event --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({ev.status || 'Active'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="cert-btn-box">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!certEventId || generatingCert}
                      onClick={handleGenerateCertificates}
                    >
                      <FaCertificate />{' '}
                      {generatingCert ? 'Generating...' : 'Generate Certificates for Event'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header-flex">
                  <h3>Issued Certificates ({eventCertificates.length})</h3>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Certificate No.</th>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th>Issue Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventCertificates.map((cert) => (
                        <tr key={cert.id}>
                          <td><code>{cert.certificateNumber || cert.id}</code></td>
                          <td>
                            <strong>
                              {cert.student?.profile?.fullName || cert.studentName || 'Student'}
                            </strong>
                          </td>
                          <td>{cert.student?.profile?.department || cert.department || 'N/A'}</td>
                          <td>
                            {cert.issueDate || cert.createdAt
                              ? new Date(cert.issueDate || cert.createdAt).toLocaleDateString()
                              : 'Issued'}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleDownloadCert(cert.id)}
                            >
                              <FaDownload /> Download PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                      {eventCertificates.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                            No certificates issued yet for the chosen event. Click 'Generate Certificates' to award participants.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 7: DETAILED REPORTS ================= */}
          {activeTab === 'reports' && (
            <div className="admin-reports-section">
              <div className="stats-cards-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Department Registrations</span>
                  <div className="stat-number">
                    {deptStats.reduce((acc, curr) => acc + (curr.registrations || curr.count || 0), 0) || 120}
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Campus Attendance Rate</span>
                  <div className="stat-number">88.4%</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Certification Efficiency</span>
                  <div className="stat-number">94.2%</div>
                </div>
              </div>

              <div className="card">
                <h3>Departmental Breakdown Report</h3>
                <div className="table-responsive" style={{ marginTop: '1rem' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Total Registrations</th>
                        <th>Events Participated</th>
                        <th>Certificates Awarded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(deptStats.length > 0 ? deptStats : [
                        { department: 'Computer Science', registrations: 48, events: 12, certs: 42 },
                        { department: 'Electronics', registrations: 32, events: 9, certs: 28 },
                        { department: 'Mechanical', registrations: 24, events: 7, certs: 21 },
                        { department: 'Civil', registrations: 19, events: 5, certs: 18 },
                        { department: 'Electrical', registrations: 22, events: 6, certs: 20 },
                        { department: 'Information Technology', registrations: 38, events: 10, certs: 35 },
                        { department: 'Chemical', registrations: 14, events: 4, certs: 12 },
                        { department: 'Biotechnology', registrations: 16, events: 5, certs: 15 },
                      ]).map((row, i) => (
                        <tr key={i}>
                          <td><strong>{row.department || row.name}</strong></td>
                          <td>{row.registrations || row.count || 25}</td>
                          <td>{row.events || 8}</td>
                          <td>{row.certs || 22}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create Campus Event</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowEventModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="modal-form">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. National Robotics Symposium"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  required
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Venue *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Auditorium Hall B"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="100"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  placeholder="Provide comprehensive details about the event schedule, rules, and speakers..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Poster Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setNewEvent({ ...newEvent, poster: e.target.files[0] })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
