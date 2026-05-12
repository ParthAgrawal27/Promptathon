import { useState } from 'react';
import { alerts } from '../data/mockData';
import './SmartAlerts.css';

export default function SmartAlerts() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="smart-alerts animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Smart Alerts Center</h1>
          <p>{alerts.length} active alerts · {critCount} critical requiring immediate action</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-ghost btn-sm">Mark All Read</button>
          <button className="btn btn-danger btn-sm">Escalate Critical</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="kpi-card danger">
          <span className="kpi-label">Critical</span>
          <span className="kpi-value" style={{ color: 'var(--color-danger)' }}>{critCount}</span>
          <span className="kpi-trend down">Immediate action required</span>
        </div>
        <div className="kpi-card warning">
          <span className="kpi-label">High Priority</span>
          <span className="kpi-value" style={{ color: '#F97316' }}>{highCount}</span>
          <span className="kpi-trend neutral">Review within 24h</span>
        </div>
        <div className="kpi-card info">
          <span className="kpi-label">Moderate</span>
          <span className="kpi-value" style={{ color: 'var(--color-warning)' }}>{alerts.filter(a => a.severity === 'moderate').length}</span>
          <span className="kpi-trend neutral">Monitoring</span>
        </div>
        <div className="kpi-card success">
          <span className="kpi-label">Low/Info</span>
          <span className="kpi-value" style={{ color: 'var(--color-success)' }}>{alerts.filter(a => a.severity === 'low').length}</span>
          <span className="kpi-trend up">Under control</span>
        </div>
      </div>

      {/* Filter */}
      <div className="alert-filters">
        {['all', 'critical', 'high', 'moderate', 'low'].map(f => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''} ${f}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${alerts.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${alerts.filter(a => a.severity === f).length})`}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="alerts-list">
        {filtered.map((alert) => (
          <div key={alert.id} className={`card alert-card-full ${alert.severity}`}>
            <div className="alert-card-bar"></div>
            <div className="alert-card-content">
              <div className="alert-card-top">
                <div className="alert-card-left">
                  <span className={`badge ${alert.severity}`}>{alert.severity}</span>
                  <span className="badge info">{alert.type}</span>
                  <span className="alert-card-title">{alert.title}</span>
                </div>
                <span className="alert-card-time">{alert.time}</span>
              </div>
              <p className="alert-card-desc">{alert.description}</p>
              <div className="alert-card-actions">
                <button className="btn btn-ghost btn-sm">Acknowledge</button>
                <button className="btn btn-ghost btn-sm">Assign</button>
                <button className="btn btn-ghost btn-sm">View Vendor →</button>
                {alert.severity === 'critical' && <button className="btn btn-danger btn-sm">Escalate</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
