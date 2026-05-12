import { useRiskEngine } from '../context/RiskEngine';
import { useNavigate } from 'react-router-dom';
import './SmartAlerts.css';

export default function SmartAlerts() {
  const { scoredVendors, activeEvents, weights, stats } = useRiskEngine();
  const navigate = useNavigate();

  // Generate dynamic alerts from current state
  const alerts = [];
  // Event-based alerts
  activeEvents.forEach(evt => {
    const affected = scoredVendors.filter(v => evt.region === 'Global' || v.region === evt.region);
    alerts.push({
      id: `evt-${evt.id}`, severity: evt.severity, type: 'Event',
      title: `${evt.name} — ${affected.length} vendors affected`,
      desc: evt.desc,
      impacts: Object.entries(evt.impacts).map(([p, m]) => `${p.replace(/_/g, ' ')}: ${m > 1 ? '+' : ''}${Math.round((m-1)*100)}%`),
      vendors: affected.slice(0, 5).map(v => v.name),
      action: 'Review in Global Events →',
      actionPath: '/events',
    });
  });
  // Threshold breach alerts
  scoredVendors.filter(v => v.riskBand === 'Critical').forEach(v => {
    const topFactor = Object.entries(v.contributions).sort(([,a],[,b]) => b.contribution - a.contribution)[0];
    alerts.push({
      id: `crit-${v.id}`, severity: 'critical', type: 'Threshold',
      title: `${v.name} — Critical risk (${v.riskScore}/100)`,
      desc: `Weighted score exceeds critical threshold (75). Primary driver: ${topFactor[0].replace(/_/g,' ')} contributing ${topFactor[1].contribution.toFixed(1)} points.`,
      impacts: [`Risk Score: ${v.riskScore}`, `Region: ${v.region}`, `Top factor: ${topFactor[0].replace(/_/g,' ')}`],
      vendors: [v.name],
      action: 'View Profile →',
      actionPath: `/vendor/${v.id}`,
    });
  });
  // Weight imbalance alert
  const maxWeight = Math.max(...Object.values(weights));
  if (maxWeight > 30) {
    const param = Object.entries(weights).find(([,v]) => v === maxWeight);
    alerts.push({
      id: 'weight-imbalance', severity: 'moderate', type: 'Configuration',
      title: `Weight imbalance detected — ${param[0].replace(/_/g,' ')} at ${maxWeight}%`,
      desc: 'A single parameter has disproportionate influence on risk scoring. Consider rebalancing for more holistic assessment.',
      impacts: [`${param[0].replace(/_/g,' ')}: ${maxWeight}%`],
      vendors: [],
      action: 'Configure Weights →',
      actionPath: '/weights',
    });
  }

  const sevOrder = { critical: 0, high: 1, moderate: 2 };
  alerts.sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3));

  return (
    <div className="smart-alerts animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Alert Intelligence</h1>
          <p>Dynamic operational alerts · Threshold breaches · Event propagation · {alerts.length} active alerts</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <span className="badge critical">{alerts.filter(a => a.severity === 'critical').length} Critical</span>
          <span className="badge moderate">{alerts.filter(a => a.severity === 'high' || a.severity === 'moderate').length} Advisory</span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-success)', fontWeight: 700 }}>✅ All Clear</p>
          <p style={{ color: 'var(--text-tertiary)' }}>No active alerts. All vendors within acceptable thresholds.</p>
        </div>
      ) : (
        <div className="sa-alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`card sa-alert-card severity-${alert.severity}`}>
              <div className="sa-alert-header">
                <span className={`sa-alert-icon ${alert.severity}`}>
                  {alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠' : 'ℹ'}
                </span>
                <div className="sa-alert-title-area">
                  <span className="sa-alert-title">{alert.title}</span>
                  <div className="sa-alert-meta">
                    <span className={`badge ${alert.severity}`}>{alert.severity}</span>
                    <span className="badge info">{alert.type}</span>
                  </div>
                </div>
              </div>
              <p className="sa-alert-desc">{alert.desc}</p>
              <div className="sa-alert-impacts">
                {alert.impacts.map((impact, i) => (
                  <span key={i} className="sa-impact-chip">{impact}</span>
                ))}
              </div>
              {alert.vendors.length > 0 && (
                <div className="sa-affected">
                  <span className="sa-affected-label">Affected: </span>
                  {alert.vendors.map((name, i) => <span key={i} className="sa-affected-vendor">{name}</span>)}
                </div>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(alert.actionPath)} style={{ marginTop: 'var(--space-2)' }}>
                {alert.action}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
