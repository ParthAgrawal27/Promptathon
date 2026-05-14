import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRiskEngine } from '../context/RiskEngine';
import './Topbar.css';

export default function Topbar() {
  const navigate = useNavigate();
  const { scoredVendors } = useRiskEngine();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);

  // Filter vendors based on query
  const results = query.trim().length >= 1
    ? scoredVendors.filter(v => {
        const q = query.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.vendorId.toLowerCase().includes(q) ||
          v.region.toLowerCase().includes(q) ||
          v.country.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.tier.toLowerCase().includes(q) ||
          v.riskBand.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  const showDropdown = focused && query.trim().length >= 1 && results.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectVendor = (vendor) => {
    setQuery('');
    setFocused(false);
    navigate(`/vendor/${vendor.id}`);
  };

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        wrapperRef.current?.querySelector('input')?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-search" ref={wrapperRef}>
          <svg className="search-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search vendors, alerts, metrics... (⌘K)"
            className="topbar-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setFocused(false); setQuery(''); }
              if (e.key === 'Enter' && results.length > 0) selectVendor(results[0]);
            }}
          />
          <kbd className="kbd-hint">⌘K</kbd>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="search-dropdown">
              <div className="search-dropdown-header">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map(v => (
                <button
                  key={v.id}
                  className="search-result-item"
                  onMouseDown={() => selectVendor(v)}
                >
                  <div className="search-result-left">
                    <span className="search-result-name">{v.name}</span>
                    <span className="search-result-meta">{v.vendorId} · {v.region} · {v.tier} · {v.category}</span>
                  </div>
                  <div className="search-result-right">
                    <span className="font-mono" style={{ color: v.riskColor, fontWeight: 700, fontSize: 'var(--text-sm)' }}>{v.riskScore}</span>
                    <span className={`badge ${v.riskBand.toLowerCase()}`}>{v.riskBand}</span>
                  </div>
                </button>
              ))}
              {query.trim().length >= 1 && results.length === 0 && (
                <div className="search-no-results">No vendors found for "{query}"</div>
              )}
            </div>
          )}

          {/* No results message */}
          {focused && query.trim().length >= 1 && results.length === 0 && (
            <div className="search-dropdown">
              <div className="search-no-results">No vendors match "{query}"</div>
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn ai-chat-btn" onClick={() => navigate('/assistant')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a8 8 0 0 0-8 8c0 3.5 2.5 6.5 6 7.5V22l4-3h2a8 8 0 0 0 0-16H12z"/>
          </svg>
          <span>AI Chat</span>
          <div className="ai-pulse"></div>
        </button>

        <button className="topbar-icon-btn" title="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="notification-dot"></span>
        </button>

        <div className="topbar-divider"></div>

        <div className="topbar-user">
          <div className="user-avatar">
            <span>PK</span>
          </div>
          <div className="user-info">
            <span className="user-name">Parth K.</span>
            <span className="user-role">Risk Analyst</span>
          </div>
        </div>
      </div>
    </header>
  );
}
