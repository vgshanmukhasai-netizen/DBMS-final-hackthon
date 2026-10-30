import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', fullPage = false }) => {
  const content = (
    <div className={`spinner-container ${size}`}>
      <div className="spinner-circle"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="spinner-full-page">{content}</div>;
  }

  return content;
};

export default LoadingSpinner;
