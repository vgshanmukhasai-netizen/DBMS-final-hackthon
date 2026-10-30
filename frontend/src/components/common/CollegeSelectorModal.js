import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaSearch, FaUniversity, FaTimes, FaCheckCircle, FaMapMarkerAlt, FaPlus, FaArrowRight } from 'react-icons/fa';
import { COLLEGES, STATES } from '../../data/colleges';
import { useCollege } from '../../context/CollegeContext';
import CollegeLogo from './CollegeLogo';
import './CollegeSelectorModal.css';

const CollegeSelectorModal = () => {
  const { college, selectCollege, closeSelector } = useCollege();
  const canDismiss = Boolean(college);

  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [selected, setSelected] = useState(college && college.id !== 'custom' ? college : null);
  const [customMode, setCustomMode] = useState(college?.id === 'custom');
  const [customName, setCustomName] = useState(college?.id === 'custom' ? college.name : '');
  const [customCity, setCustomCity] = useState(college?.id === 'custom' ? college.city || '' : '');
  const searchRef = useRef(null);

  // Lock background scroll while open; allow Esc to close when a college already exists.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape' && canDismiss) closeSelector();
    };
    window.addEventListener('keydown', onKey);
    searchRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [canDismiss, closeSelector]);

  const results = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return COLLEGES.filter((c) => {
      if (stateFilter && c.state !== stateFilter) return false;
      return tokens.every((t) => c.keywords.includes(t));
    });
  }, [query, stateFilter]);

  const handleConfirm = () => {
    if (customMode) {
      const name = customName.trim();
      if (!name) return;
      selectCollege({
        id: 'custom',
        name,
        short: name,
        city: customCity.trim(),
        state: stateFilter || '',
        domain: null,
        type: 'College',
      });
    } else if (selected) {
      selectCollege(selected);
    }
  };

  const canConfirm = customMode ? customName.trim().length > 2 : Boolean(selected);

  return (
    <div className="csm-overlay" role="dialog" aria-modal="true" aria-labelledby="csm-title">
      <div className="csm-card">
        <div className="csm-header">
          <div className="csm-header-icon">
            <FaUniversity />
          </div>
          <div className="csm-header-text">
            <span className="csm-eyebrow">Welcome to EventSphere</span>
            <h2 id="csm-title">Which college are you studying at?</h2>
            <p>Your campus logo and identity will personalise the whole portal.</p>
          </div>
          {canDismiss && (
            <button type="button" className="csm-close" onClick={closeSelector} aria-label="Close">
              <FaTimes />
            </button>
          )}
        </div>

        {!customMode ? (
          <>
            <div className="csm-filters">
              <div className="csm-search">
                <FaSearch className="csm-search-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by name, short name or city (e.g. IIT, NIT Warangal, Pune)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className="csm-state"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                aria-label="Filter by state"
              >
                <option value="">All States</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="csm-count">
              {results.length} {results.length === 1 ? 'institution' : 'institutions'} found
            </div>

            <ul className="csm-list">
              {results.map((c) => {
                const isActive = selected?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`csm-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSelected(c)}
                      onDoubleClick={() => selectCollege(c)}
                    >
                      <CollegeLogo college={c} size={44} ring={false} />
                      <span className="csm-item-body">
                        <span className="csm-item-name">{c.name}</span>
                        <span className="csm-item-meta">
                          <FaMapMarkerAlt /> {c.city}, {c.state}
                        </span>
                      </span>
                      <span className="csm-item-type">{c.type}</span>
                      {isActive && <FaCheckCircle className="csm-item-check" />}
                    </button>
                  </li>
                );
              })}
              {results.length === 0 && (
                <li className="csm-empty">
                  No match found. You can add your college manually below.
                </li>
              )}
            </ul>

            <button type="button" className="csm-custom-link" onClick={() => setCustomMode(true)}>
              <FaPlus /> My college isn't listed — add it manually
            </button>
          </>
        ) : (
          <div className="csm-custom">
            <div className="csm-custom-preview">
              <CollegeLogo college={{ name: customName || 'Your College', short: customName }} size={72} />
              <span>Preview of your campus crest</span>
            </div>
            <label className="csm-label">
              College / University name
              <input
                type="text"
                className="csm-input"
                placeholder="e.g. Sri Krishna College of Engineering"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                autoFocus
              />
            </label>
            <div className="csm-custom-row">
              <label className="csm-label">
                City
                <input
                  type="text"
                  className="csm-input"
                  placeholder="City"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                />
              </label>
              <label className="csm-label">
                State
                <select
                  className="csm-input"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" className="csm-custom-link" onClick={() => setCustomMode(false)}>
              ← Back to college list
            </button>
          </div>
        )}

        <div className="csm-footer">
          <div className="csm-selected">
            {customMode
              ? customName.trim() && (
                  <>
                    <CollegeLogo college={{ name: customName, short: customName }} size={32} ring={false} />
                    <span>{customName}</span>
                  </>
                )
              : selected && (
                  <>
                    <CollegeLogo college={selected} size={32} ring={false} />
                    <span>{selected.short}</span>
                  </>
                )}
          </div>
          <button type="button" className="btn btn-primary csm-confirm" onClick={handleConfirm} disabled={!canConfirm}>
            Continue <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollegeSelectorModal;
