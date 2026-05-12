import { useState } from 'react';
import './Topbar.css';

export default function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-search">
          <svg className="search-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search vendors, alerts, metrics... (⌘K)"
            className="topbar-search-input"
          />
          <kbd className="kbd-hint">⌘K</kbd>
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn ai-chat-btn">
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
