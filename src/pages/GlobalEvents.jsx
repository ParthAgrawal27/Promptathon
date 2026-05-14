import { useState } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { eventCatalog, regionConfig } from '../data/mockData';
import api from '../services/api';
import './GlobalEvents.css';

export default function GlobalEvents() {
  const { activeEvents, injectEvent, removeEvent, clearEvents, scoredVendors, stats, liveEvents } = useRiskEngine();
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [customEvent, setCustomEvent] = useState({
    event_title: '',
    event_type: 'Logistics',
    event_severity: 'moderate',
    affected_region: 'Global',
    event_description: ''
  });

  const handleInjectCustom = async (e) => {
    e.preventDefault();
    if (!customEvent.event_title) return;
    setIsInjecting(true);
    try {
      await api.injectEvent(customEvent);
      alert('Custom event injected successfully! Risk scores are recalculating.');
      setShowCustomForm(false);
      setCustomEvent({ ...customEvent, event_title: '', event_description: '' });
    } catch (err) {
      alert('Failed to inject custom event: ' + err.message);
    } finally {
      setIsInjecting(false);
    }
  };

  const handleTriggerNews = async () => {
    setIsFetchingNews(true);
    try {
      await api.triggerNewsFetch();
      alert("NewsAPI check complete! If new relevant supply chain events were found, they have been added.");
    } catch (err) {
      alert("Failed to trigger NewsAPI fetch: " + err.message);
    } finally {
      setIsFetchingNews(false);
    }
  };

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
          <button className="btn btn-secondary btn-sm" onClick={() => setShowCustomForm(!showCustomForm)} style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            {showCustomForm ? '✕ Cancel' : '➕ Create Custom Event'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleTriggerNews} disabled={isFetchingNews}>
            {isFetchingNews ? '⏳ Fetching...' : '⚡ Trigger NewsAPI Fetch'}
          </button>
        </div>
      </div>

      {showCustomForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--color-primary)' }}>
          <div className="card-header">
            <span className="card-title">Create Manual Disruption Event</span>
            <span className="badge info">Live Engine</span>
          </div>
          <form onSubmit={handleInjectCustom} style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Event Title</label>
              <input type="text" className="input" placeholder="e.g. Major Earthquake in Japan" value={customEvent.event_title} onChange={e => setCustomEvent({...customEvent, event_title: e.target.value})} required style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Event Type</label>
                <select className="input" value={customEvent.event_type} onChange={e => setCustomEvent({...customEvent, event_type: e.target.value})} style={{ width: '100%' }}>
                  <option value="Natural Disaster">Natural Disaster</option>
                  <option value="Geopolitical">Geopolitical</option>
                  <option value="Trade">Trade</option>
                  <option value="Labor">Labor</option>
                  <option value="Maritime">Maritime</option>
                  <option value="Cyber">Cyber</option>
                  <option value="Energy">Energy</option>
                  <option value="Health">Health</option>
                  <option value="Logistics">Logistics</option>
                  <option value="War">War</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Severity</label>
                <select className="input" value={customEvent.event_severity} onChange={e => setCustomEvent({...customEvent, event_severity: e.target.value})} style={{ width: '100%' }}>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Affected Region</label>
                <select className="input" value={customEvent.affected_region} onChange={e => setCustomEvent({...customEvent, affected_region: e.target.value})} style={{ width: '100%' }}>
                  <option value="Global">Global</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Europe">Europe</option>
                  <option value="Middle East">Middle East</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Description (Optional)</label>
              <textarea className="input" placeholder="Add any operational details..." value={customEvent.event_description} onChange={e => setCustomEvent({...customEvent, event_description: e.target.value})} style={{ width: '100%', minHeight: '80px', fontFamily: 'inherit' }}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isInjecting} style={{ alignSelf: 'flex-start' }}>
              {isInjecting ? '⏳ Injecting...' : '⚡ Inject Event into Risk Engine'}
            </button>
          </form>
        </div>
      )}

      {/* ── Live & Custom Events Strip ── */}
      <div className="ge-active-strip" style={{ marginBottom: 'var(--space-6)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
        <div className="ge-active-header">
          <span className="ge-active-icon">📰</span>
          <span className="ge-active-title">Live & Custom Disruptions</span>
        </div>
        {(!liveEvents || liveEvents.length === 0) ? (
          <div style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            No live events are currently active. Click "Trigger NewsAPI Fetch" or "Create Custom Event" to inject a disruption.
          </div>
        ) : (
          <div className="ge-active-list">
            {liveEvents.map(evt => (
              <div key={evt.event_id} className={`ge-active-card severity-${evt.event_severity}`}>
                <div className="ge-active-card-top">
                  <span className="ge-active-card-icon">⚡</span>
                  <div className="ge-active-card-info">
                    <span className="ge-active-card-name">{evt.event_title}</span>
                    <span className="ge-active-card-region">{evt.affected_region} · {evt.event_type}</span>
                  </div>
                </div>
                <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <p>{evt.event_description}</p>
                  {evt.source_url && <a href={evt.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Read Source ↗</a>}
                </div>
              </div>
            ))}
          </div>
        )}
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
