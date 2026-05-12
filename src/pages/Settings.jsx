import { useState } from 'react';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = ['general', 'users', 'roles', 'api', 'model', 'notifications'];

  return (
    <div className="settings-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Settings & Access Control</h1>
          <p>System configuration, user management, and API settings</p>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="settings-grid">
          <div className="card">
            <div className="card-header"><span className="card-title">General Settings</span></div>
            <div className="settings-form">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Dark Mode</span>
                  <span className="setting-desc">Use dark theme across the application</span>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Real-Time Updates</span>
                  <span className="setting-desc">Enable live data streaming for dashboards</span>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">AI Auto-Analysis</span>
                  <span className="setting-desc">Automatically run AI analysis on new vendor data</span>
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

          <div className="card">
            <div className="card-header"><span className="card-title">Risk Thresholds</span></div>
            <div className="settings-form">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Critical Threshold</span>
                  <span className="setting-desc">Score above which vendors are marked Critical</span>
                </div>
                <input type="number" defaultValue={75} style={{ width: 80, textAlign: 'center' }} />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">High Threshold</span>
                  <span className="setting-desc">Score above which vendors are marked High Risk</span>
                </div>
                <input type="number" defaultValue={50} style={{ width: 80, textAlign: 'center' }} />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Moderate Threshold</span>
                  <span className="setting-desc">Score above which vendors are marked Moderate</span>
                </div>
                <input type="number" defaultValue={25} style={{ width: 80, textAlign: 'center' }} />
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
              <button className="btn btn-primary btn-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">User Management</span>
            <button className="btn btn-primary btn-sm">+ Invite User</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Parth K.', email: 'admin@vendoriq.com', role: 'Admin', status: 'Active', last: '2 min ago' },
                { name: 'Sarah M.', email: 'analyst@vendoriq.com', role: 'Analyst', status: 'Active', last: '15 min ago' },
                { name: 'James L.', email: 'viewer@vendoriq.com', role: 'Viewer', status: 'Inactive', last: '3 days ago' },
              ].map((user, i) => (
                <tr key={i}>
                  <td><span style={{ fontWeight: 600 }}>{user.name}</span></td>
                  <td>{user.email}</td>
                  <td><span className={`badge ${user.role === 'Admin' ? 'critical' : user.role === 'Analyst' ? 'info' : 'low'}`}>{user.role}</span></td>
                  <td><span style={{ color: user.status === 'Active' ? 'var(--color-success)' : 'var(--text-tertiary)' }}>● {user.status}</span></td>
                  <td><span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{user.last}</span></td>
                  <td><button className="btn btn-ghost btn-sm">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'model' && (
        <div className="settings-grid">
          <div className="card">
            <div className="card-header"><span className="card-title">AI Model Configuration</span></div>
            <div className="settings-form">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Active Model</span>
                  <span className="setting-desc">The machine learning model used for risk scoring</span>
                </div>
                <select defaultValue="v3.2" style={{ width: 160 }}>
                  <option value="v3.2">Risk Engine v3.2</option>
                  <option value="v3.1">Risk Engine v3.1</option>
                  <option value="v3.0">Risk Engine v3.0</option>
                </select>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Confidence Threshold</span>
                  <span className="setting-desc">Minimum confidence level before flagging for human review</span>
                </div>
                <input type="number" defaultValue={60} style={{ width: 80, textAlign: 'center' }} />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Enable SHAP Explanations</span>
                  <span className="setting-desc">Compute feature attributions for all predictions</span>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Guardrails</span>
                  <span className="setting-desc">Prevent model from making high-impact decisions without approval</span>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      )}

      {!['general', 'users', 'model'].includes(activeTab) && (
        <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-md)' }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings configuration
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            This section is available in the full enterprise version.
          </p>
        </div>
      )}
    </div>
  );
}
