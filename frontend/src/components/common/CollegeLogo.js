import React, { useEffect, useState } from 'react';
import { getCollegeInitials, getCollegeLogoUrl } from '../../data/colleges';
import './CollegeLogo.css';

/**
 * Renders a college emblem inside a clean circular white frame so that logos of
 * any shape/size look consistent. Falls back to a navy monogram crest when the
 * real logo is unavailable (custom college, offline, or low-res favicon).
 */
const CollegeLogo = ({ college, size = 40, className = '', ring = true }) => {
  const src = getCollegeLogoUrl(college);
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  const handleLoad = (e) => {
    // Google returns a tiny generic globe when a site has no proper icon.
    if (e.currentTarget.naturalWidth < 32) setFailed(true);
  };

  return (
    <span
      className={`college-logo-frame ${ring ? 'with-ring' : ''} ${failed ? 'is-monogram' : ''} ${className}`}
      style={{ width: size, height: size }}
      title={college?.name}
    >
      {!failed && src ? (
        <img
          src={src}
          alt={`${college?.name || 'College'} logo`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="college-monogram" style={{ fontSize: Math.max(10, size * 0.3) }}>
          {getCollegeInitials(college)}
        </span>
      )}
    </span>
  );
};

export default CollegeLogo;
