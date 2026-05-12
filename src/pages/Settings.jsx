import { useRiskEngine } from '../context/RiskEngine';
import { riskProfiles, parameterConfig } from '../data/mockData';
import './Settings.css';

export default function Settings() {
  const { weights, activeProfile, applyProfile, activeEvents, clearEvents, stats } = useRiskEngine();

  return (
    <div className="settings-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Risk framework profiles · System configuration · Platform preferences</p>
        </div>
      </div>

      <div className="settings-layout">
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

        {/* System Info */}
        <div className="settings-sidebar">
          <div className="card">
            <div className="card-header"><span className="card-title">System Status</span></div>
            <div className="st-status-rows">
              <div className="st-status-row"><span>Risk Engine</span><span className="badge low">Active</span></div>
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
