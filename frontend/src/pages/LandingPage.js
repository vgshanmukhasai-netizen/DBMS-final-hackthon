import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserShield,
  FaCalendarAlt,
  FaBullhorn,
  FaAward,
  FaArrowRight,
  FaCheckCircle,
} from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CollegeLogo from '../components/common/CollegeLogo';
import { useCollege } from '../context/CollegeContext';
import './LandingPage.css';

const LandingPage = () => {
  const { college, openSelector } = useCollege();
  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-grid" aria-hidden="true"></div>
        <div className="hero-content">
          {college && (
            <button type="button" className="hero-college" onClick={openSelector} title="Change college">
              <CollegeLogo college={college} size={84} />
              <span className="hero-college-text">
                <span className="hero-college-label">Official event portal of</span>
                <span className="hero-college-name">{college.name}</span>
              </span>
            </button>
          )}
          <div className="hero-badge">
            <FaGraduationCap className="hero-badge-icon" /> Your campus, in its element
          </div>
          <h1 className="hero-title">
            EventSphere
          </h1>
          <p className="hero-kicker">Smart Campus Event and Communication Portal</p>
          <p className="hero-subtitle">
            Find your people, try something new, and make every campus moment count.
            One lively hub for students, faculty, and the events that bring them together.
          </p>

          <div className="hero-cta-group">
            <a href="#portal-selection" className="btn btn-accent btn-lg">
              Find your next event <FaArrowRight />
            </a>
            <Link to="/student/signup" className="btn btn-outline hero-secondary-btn btn-lg">
              Join the campus
            </Link>
          </div>
          <div className="hero-promise">
            <span><FaCheckCircle /> Discover</span>
            <span><FaCheckCircle /> Connect</span>
            <span><FaCheckCircle /> Celebrate</span>
          </div>
        </div>
      </section>

      {/* Login Portals Section */}
      <section id="portal-selection" className="portals-section">
        <div className="section-header">
          <span className="section-eyebrow">A place for every campus role</span>
          <h2>Pick your path</h2>
          <p>Sign in to your space and make something great happen on campus.</p>
        </div>

        <div className="portal-cards-grid">
          {/* Student Card */}
          <div className="portal-card student-card">
            <div className="portal-icon-wrapper student-icon">
              <FaGraduationCap />
            </div>
            <span className="portal-tag">Students</span>
            <h3 className="portal-title">Student Portal</h3>
            <p className="portal-description">
              Find the workshops, celebrations, and new interests you didn’t know you were looking for.
            </p>
            <ul className="portal-features">
              <li><FaCheckCircle className="check-icon" /> Explore & register for events</li>
              <li><FaCheckCircle className="check-icon" /> Track your attendance record</li>
              <li><FaCheckCircle className="check-icon" /> Download verified certificates</li>
            </ul>
            <div className="portal-actions">
              <Link to="/student/login" className="btn btn-primary btn-portal">
                Student Login
              </Link>
              <div className="portal-subtext">
                Don't have an account?{' '}
                <Link to="/student/signup" className="portal-link">
                  Sign up here
                </Link>
              </div>
            </div>
          </div>

          {/* Teacher Card */}
          <div className="portal-card teacher-card">
            <div className="portal-icon-wrapper teacher-icon">
              <FaChalkboardTeacher />
            </div>
            <span className="portal-tag">Faculty</span>
            <h3 className="portal-title">Faculty Portal</h3>
            <p className="portal-description">
              Bring good ideas to life with easy event planning, clear updates, and smoother attendance.
            </p>
            <ul className="portal-features">
              <li><FaCheckCircle className="check-icon" /> Create & coordinate events</li>
              <li><FaCheckCircle className="check-icon" /> Filter & assign student cohorts</li>
              <li><FaCheckCircle className="check-icon" /> Take real-time attendance</li>
            </ul>
            <div className="portal-actions">
              <Link to="/teacher/login" className="btn btn-primary btn-portal">
                Teacher Login
              </Link>
              <div className="portal-subtext">
                New faculty member?{' '}
                <Link to="/teacher/signup" className="portal-link">
                  Register here
                </Link>
              </div>
            </div>
          </div>

          {/* Admin Card */}
          <div className="portal-card admin-card">
            <div className="portal-icon-wrapper admin-icon">
              <FaUserShield />
            </div>
            <span className="portal-tag">Administration</span>
            <h3 className="portal-title">Admin Portal</h3>
            <p className="portal-description">
              Keep your campus community connected with thoughtful oversight and helpful insights.
            </p>
            <ul className="portal-features">
              <li><FaCheckCircle className="check-icon" /> Approve faculty applications</li>
              <li><FaCheckCircle className="check-icon" /> Departmental analytics & charts</li>
              <li><FaCheckCircle className="check-icon" /> System-wide audits & reports</li>
            </ul>
            <div className="portal-actions">
              <Link to="/admin/login" className="btn btn-primary btn-portal admin-btn">
                Admin Login
              </Link>
              <div className="portal-subtext">
                Restricted to authorized system administrators.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-eyebrow">Good things happen together</span>
          <h2>More than a calendar</h2>
          <p>Little tools that make it easier to show up, get involved, and feel part of campus.</p>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon"><FaCalendarAlt /></div>
            <h4>Make something happen</h4>
            <p>Turn a seminar, club meetup, or big idea into an event everyone can find and join.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FaBullhorn /></div>
            <h4>Keep everyone in the loop</h4>
            <p>Share the right updates with the right people, so no one misses the moment.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FaAward /></div>
            <h4>Celebrate your milestones</h4>
            <p>Keep a record of the events you attend and download certificates for your achievements.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
