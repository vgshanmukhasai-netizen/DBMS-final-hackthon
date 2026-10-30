import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaTimes } from 'react-icons/fa';
import { useCollege } from '../../context/CollegeContext';
import CollegeLogo from './CollegeLogo';
import './Sidebar.css';

const Sidebar = ({ items, activeTab, onTabChange, isOpen, onClose, roleTitle }) => {
  const { college, openSelector } = useCollege();
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Logo Header to fill the top 70px space */}
        <div className="sidebar-brand-section">
          <Link to="/" className="sidebar-brand-link">
            <div className="sidebar-brand-logo-icon">
              <FaGraduationCap />
            </div>
            <div className="sidebar-brand-info">
              <span className="sidebar-brand-name">EventSphere</span>
              <span className="sidebar-brand-desc">Smart Campus Portal</span>
            </div>
          </Link>
          {onClose && (
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Selected college identity card */}
        {college && (
          <button type="button" className="sidebar-college-card" onClick={openSelector} title="Change college">
            <CollegeLogo college={college} size={46} />
            <span className="sidebar-college-info">
              <span className="sidebar-college-name">{college.name}</span>
              {(college.city || college.state) && (
                <span className="sidebar-college-loc">
                  {[college.city, college.state].filter(Boolean).join(', ')}
                </span>
              )}
            </span>
          </button>
        )}

        <div className="sidebar-header">
          <div className="sidebar-badge">{roleTitle || 'Portal'}</div>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="sidebar-item">
                  <button
                    type="button"
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange(item.id);
                      if (onClose) onClose();
                    }}
                  >
                    {Icon && <Icon className="sidebar-item-icon" />}
                    <span className="sidebar-item-label">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="sidebar-item-badge">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
