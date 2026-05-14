import { useRiskEngine } from '../context/RiskEngine';
import { useTheme } from '../context/ThemeContext';
import { riskProfiles, parameterConfig } from '../data/mockData';
import './Settings.css';

export default function Settings() {
  const { weights, activeProfile, applyProfile, activeEvents, clearEvents, stats } = useRiskEngine();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="settings-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Risk framework profiles · Appearance · System configuration · Platform preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Main column */}
        <div className="settings-main">

          {/* Appearance */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🎨 Appearance</span>
              <span className="badge info">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className="settings-form">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Dark Mode</span>
                  <span className="setting-desc">Switch between light and dark theme across the entire application</span>
                </div>
                <label className="theme-toggle-wrapper">
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={isDark}
                    onChange={toggleTheme}
                  />
                  <span className="theme-toggle-status">{isDark ? '🌙 Dark' : '☀️ Light'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Risk Framework Profiles */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⚖ Risk Framework Profiles</span>
              <span className="badge info">Active: {riskProfiles.find(p => p.id === activeProfile)?.name || 'Custom'}</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
              Switch between risk assessment frameworks. Each profile reconfigures parameter weights to match different enterprise priorities.
              Rankings, decision trees, and alerts recalculate instantly.
            </p>
            <div className="st-profiles-grid">
              {riskProfiles.map(p => (
                <div key={p.id} className={`st-profile-card ${activeProfile === p.id ? 'active' : ''}`}
                  onClick={() => applyProfile(p.id)}>
                  <div className="st-profile-header">
                    <span className="st-profile-icon">{p.icon}</span>
                    <span className="st-profile-name">{p.name}</span>
                    {activeProfile === p.id && <span className="badge low" style={{ fontSize: '9px' }}>Active</span>}
                  </div>
                  <p className="st-profile-desc">{p.desc}</p>
                  <div className="st-profile-weights">
                    {Object.entries(p.weights).sort(([,a],[,b]) => b - a).slice(0, 4).map(([key, val]) => (
                      <div key={key} className="st-pw-row">
                        <span>{parameterConfig[key]?.icon} {parameterConfig[key]?.label}</span>
                        <span className="font-mono">{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Settings */}
          <div className="card">
            <div className="card-header"><span className="card-title">⚙ General Settings</span></div>
            <div className="settings-form">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Real-Time Updates</span>
                  <span className="setting-desc">Enable live data streaming for dashboards</span>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Analytical Auto-Scoring</span>
                  <span className="setting-desc">Automatically run heuristic analysis on new vendor data</span>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Alert Sound</span>
                  <span className="setting-desc">Play audio notification for critical alerts</span>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Data Refresh Interval</span>
                  <span className="setting-desc">How often to fetch new data from sources</span>
                </div>
                <select defaultValue="5" style={{ width: 120 }}>
                  <option value="1">1 min</option>
                  <option value="5">5 min</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="settings-sidebar">
          <div className="card">
            <div className="card-header"><span className="card-title">System Status</span></div>
            <div className="st-status-rows">
              <div className="st-status-row"><span>Risk Engine</span><span className="badge low">Active</span></div>
              <div className="st-status-row"><span>Theme</span><span className="font-mono">{isDark ? 'Dark' : 'Light'}</span></div>
              <div className="st-status-row"><span>Vendors Monitored</span><span className="font-mono">{stats.total}</span></div>
              <div className="st-status-row"><span>Active Events</span><span className="font-mono">{activeEvents.length}</span></div>
              <div className="st-status-row"><span>Active Profile</span><span className="font-mono">{activeProfile}</span></div>
              <div className="st-status-row"><span>Weight Total</span><span className="font-mono">{Object.values(weights).reduce((a,b)=>a+b,0)}%</span></div>
              <div className="st-status-row"><span>Critical Vendors</span><span className="font-mono" style={{ color: 'var(--color-danger)' }}>{stats.critical}</span></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button className="btn btn-primary btn-sm" onClick={() => applyProfile('balanced')}>Reset to Balanced Profile</button>
              <button className="btn btn-danger btn-sm" onClick={clearEvents}>Clear All Events</button>
              <button className="btn btn-ghost btn-sm" onClick={() => applyProfile('crisis')}>🚨 Activate Crisis Mode</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Platform Information</span></div>
            <div className="st-status-rows">
              <div className="st-status-row"><span>Platform</span><span>VendorIQ v2.0</span></div>
              <div className="st-status-row"><span>Engine</span><span>Heuristic Analytics</span></div>
              <div className="st-status-row"><span>Approach</span><span>Rule-Based Scoring</span></div>
              <div className="st-status-row"><span>Architecture</span><span>React + Vite</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
