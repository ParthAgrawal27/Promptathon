import { useState } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { eventCatalog, regionConfig } from '../data/mockData';
import './GlobalEvents.css';

export default function GlobalEvents() {
  const { activeEvents, injectEvent, removeEvent, clearEvents, scoredVendors, stats } = useRiskEngine();
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const availableEvents = eventCatalog.filter(e => !activeEvents.find(a => a.id === e.id));
  const filtered = selectedSeverity === 'all' ? eventCatalog : eventCatalog.filter(e => e.severity === selectedSeverity);

  const affectedVendors = scoredVendors.filter(v =>
    activeEvents.some(e => e.region === 'Global' || e.region === v.region)
  );

  return (
    <div className="global-events animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Global Disruption Intelligence</h1>
          <p>Inject live geopolitical and operational events · Watch risk scores recalculate instantly</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <span className="badge critical">{activeEvents.length} Active</span>
          {activeEvents.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={clearEvents}>Clear All Events</button>
          )}
        </div>
      </div>

      {/* ── Active Events Strip ── */}
      {activeEvents.length > 0 && (
        <div className="ge-active-strip">
          <div className="ge-active-header">
            <span className="ge-active-icon">⚡</span>
            <span className="ge-active-title">Active Disruptions — Affecting {affectedVendors.length} vendors</span>
          </div>
          <div className="ge-active-list">
            {activeEvents.map(evt => (
              <div key={evt.id} className={`ge-active-card severity-${evt.severity}`}>
                <div className="ge-active-card-top">
                  <span className="ge-active-card-icon">{evt.icon}</span>
                  <div className="ge-active-card-info">
                    <span className="ge-active-card-name">{evt.name}</span>
                    <span className="ge-active-card-region">{evt.region} · {evt.type}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeEvent(evt.id)}>✕</button>
                </div>
                <div className="ge-impacts">
                  {Object.entries(evt.impacts).map(([param, mult]) => {
                    const isNeg = mult > 1;
                    const pct = isNeg ? `+${Math.round((mult - 1) * 100)}%` : `-${Math.round((1 - mult) * 100)}%`;
                    return (
                      <span key={param} className={`ge-impact-chip ${isNeg ? 'negative' : 'positive'}`}>
                        {param.replace(/_/g, ' ')}: {pct}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter ── */}
      <div className="ge-filters">
        {['all', 'critical', 'high', 'moderate'].map(sev => (
          <button key={sev} className={`filter-pill ${selectedSeverity === sev ? 'active' : ''} ${sev}`}
            onClick={() => setSelectedSeverity(sev)}>
            {sev === 'all' ? 'All Events' : sev.charAt(0).toUpperCase() + sev.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Event Catalog ── */}
      <div className="ge-layout">
        <div className="ge-catalog">
          <div className="card-header" style={{ padding: '0 0 var(--space-3) 0' }}>
            <span className="card-title">Event Catalog</span>
            <span className="badge info">{filtered.length} scenarios</span>
          </div>
          <div className="ge-catalog-grid">
            {filtered.map(evt => {
              const isActive = activeEvents.find(a => a.id === evt.id);
              return (
                <div key={evt.id} className={`card ge-event-card ${isActive ? 'injected' : ''}`}>
                  <div className="ge-event-top">
                    <span className="ge-event-icon">{evt.icon}</span>
                    <div className="ge-event-meta">
                      <span className="ge-event-name">{evt.name}</span>
                      <span className="ge-event-type">{evt.type} · {evt.region}</span>
                    </div>
                    <span className={`badge ${evt.severity}`}>{evt.severity}</span>
                  </div>
                  <p className="ge-event-desc">{evt.desc}</p>
                  <div className="ge-event-impacts">
                    {Object.entries(evt.impacts).map(([param, mult]) => {
                      const isNeg = mult > 1;
                      return (
                        <div key={param} className="ge-event-impact-row">
                          <span className="ge-event-impact-label">{param.replace(/_/g, ' ')}</span>
                          <span className={`ge-event-impact-val ${isNeg ? 'bad' : 'good'}`}>
                            {isNeg ? `+${Math.round((mult - 1) * 100)}%` : `-${Math.round((1 - mult) * 100)}%`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button className={`btn ${isActive ? 'btn-danger' : 'btn-primary'} btn-sm`} style={{ width: '100%', marginTop: 'var(--space-2)' }}
                    onClick={() => isActive ? removeEvent(evt.id) : injectEvent(evt.id)}>
                    {isActive ? '✕ Remove Event' : '⚡ Inject Event'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Affected Vendors ── */}
        <div className="ge-affected">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Affected Vendors</span>
              <span className="badge critical">{affectedVendors.length}</span>
            </div>
            {affectedVendors.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-6)' }}>
                No active events. Inject an event to see affected vendors.
              </p>
            ) : (
              <div className="ge-affected-list">
                {affectedVendors.map(v => (
                  <div key={v.id} className="ge-affected-row">
                    <div className="ge-affected-info">
                      <span className="ge-affected-name">{v.name}</span>
                      <span className="ge-affected-region">{v.region}</span>
                    </div>
                    <span className="ge-affected-score font-mono" style={{ color: v.riskColor }}>{v.riskScore}</span>
                    <span className={`badge ${v.riskBand.toLowerCase()}`}>{v.riskBand}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Stats */}
          <div className="card">
            <div className="card-header"><span className="card-title">System Impact</span></div>
            <div className="ge-impact-stats">
              <div className="ge-impact-stat">
                <span className="ge-impact-stat-val" style={{ color: 'var(--color-danger)' }}>{stats.avg}</span>
                <span className="ge-impact-stat-label">Global Risk Index</span>
              </div>
              <div className="ge-impact-stat">
                <span className="ge-impact-stat-val" style={{ color: 'var(--color-danger)' }}>{stats.critical}</span>
                <span className="ge-impact-stat-label">Critical Vendors</span>
              </div>
              <div className="ge-impact-stat">
                <span className="ge-impact-stat-val" style={{ color: 'var(--color-primary)' }}>{activeEvents.length}</span>
                <span className="ge-impact-stat-label">Active Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
