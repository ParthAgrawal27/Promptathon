import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Command Center', icon: '◎' },
  { path: '/vendors', label: 'Vendor Intelligence', icon: '◫' },
  { path: '/vendor/1', label: 'Vendor Deep Dive', icon: '◉' },
  { path: '/weights', label: 'Weight Engine', icon: '⚖' },
  { path: '/events', label: 'Global Events', icon: '🌍' },
  { path: '/simulation', label: 'Simulation Lab', icon: '◬' },
  { path: '/network', label: 'Risk Propagation', icon: '◍' },
  { path: '/assistant', label: 'Decision Assistant', icon: '◇' },
  { path: '/alerts', label: 'Alert Intelligence', icon: '◆' },
  { path: '/comparison', label: 'Vendor Comparison', icon: '◫' },
  { path: '/geo', label: 'Geo-Intelligence', icon: '◐' },
  { path: '/security', label: 'Security & Audit', icon: '◈' },
  { path: '/settings', label: 'Settings', icon: '◎' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3B82F6" opacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 12L12 17L22 12" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-brand">VendorIQ</span>
              <span className="logo-sub">Risk Intelligence</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            {collapsed ? (
              <path d="M6 3l5 5-5 5V3z" />
            ) : (
              <path d="M10 3L5 8l5 5V3z" />
            )}
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            end={item.path === '/'}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
            {!collapsed && item.path === '/alerts' && (
              <span className="nav-badge">3</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="system-status">
            <div className="status-dot online"></div>
            <span className="status-text">Risk Engine Active</span>
          </div>
        )}
      </div>
    </aside>
  );
}
