import React from 'react';
import { FaGraduationCap, FaHeart } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <FaGraduationCap className="footer-logo-icon" />
          <span>EventSphere — Smart Campus Event and Communication Portal</span>
        </div>
        <p className="footer-text">
          &copy; {currentYear} EventSphere. Made with <FaHeart className="footer-heart-icon" /> for campus communities.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
