import { useState, useMemo } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import './SmartAlerts.css';

export default function SmartAlerts() {
  const { scoredVendors, activeEvents, loading } = useRiskEngine();
  const [filter, setFilter] = useState('all');

  // Generate alerts dynamically from scored vendor data
  const alerts = useMemo(() => {
    if (scoredVendors.length === 0) return [];
    const generated = [];
    let id = 1;

    // Critical vendors
    scoredVendors.filter(v => v.riskBand === 'Critical').slice(0, 10).forEach(v => {
      generated.push({
        id: id++, severity: 'critical', type: 'Risk Threshold',
        title: `${v.name} exceeds critical risk threshold`,
        description: `Risk score ${v.riskScore}/100 is above critical threshold (75). Immediate review recommended. Top risk factor: ${Object.entries(v.contributions).sort(([,a],[,b]) => b.contribution - a.contribution)[0]?.[0]?.replace(/_/g, ' ')}.`,
        time: `${Math.floor(Math.random() * 12) + 1}h ago`,
      });
    });

    // High risk vendors with specific param alerts
    scoredVendors.filter(v => v.riskBand === 'High').slice(0, 8).forEach(v => {
      if (v.params.OnTime_Delivery < 65) {
        generated.push({
          id: id++, severity: 'high', type: 'Delivery',
          title: `${v.name} — delivery rate below 65%`,
          description: `On-time delivery at ${v.params.OnTime_Delivery.toFixed(1)}%. Supply continuity at risk.`,
          time: `${Math.floor(Math.random() * 24) + 1}h ago`,
        });
      }
      if (v.params.Financial_Stability < 55) {
        generated.push({
          id: id++, severity: 'high', type: 'Financial',
          title: `${v.name} — financial stability concern`,
          description: `Financial stability score ${v.params.Financial_Stability.toFixed(0)}/100 is below warning threshold. Monitor cash flow closely.`,
          time: `${Math.floor(Math.random() * 24) + 1}h ago`,
        });
      }
    });

    // Active event alerts
    activeEvents.forEach(evt => {
      generated.push({
        id: id++, severity: evt.severity === 'critical' ? 'critical' : 'high', type: 'Disruption',
        title: `Active Disruption: ${evt.name}`,
        description: evt.desc,
        time: 'Active now',
      });
    });

    // Moderate
    scoredVendors.filter(v => v.params.Defect_Rate_PPM > 1800).slice(0, 5).forEach(v => {
      generated.push({
        id: id++, severity: 'moderate', type: 'Quality',
        title: `${v.name} — elevated defect rate`,
        description: `Defect rate at ${v.params.Defect_Rate_PPM.toFixed(0)} PPM. Exceeds 1800 PPM threshold.`,
        time: `${Math.floor(Math.random() * 48) + 1}h ago`,
      });
    });

    // Low
    scoredVendors.filter(v => v.riskBand === 'Low').slice(0, 3).forEach(v => {
      generated.push({
        id: id++, severity: 'low', type: 'Info',
        title: `${v.name} — performance within targets`,
        description: `All parameters within acceptable thresholds. Risk score: ${v.riskScore}/100.`,
        time: `${Math.floor(Math.random() * 72) + 1}h ago`,
      });
    });

    return generated;
  }, [scoredVendors, activeEvents]);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  if (loading) {
    return (
      <div className="smart-alerts animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

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
