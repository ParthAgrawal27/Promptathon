import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRiskEngine } from '../context/RiskEngine';
import { parameterConfig, riskProfiles } from '../data/mockData';
import './ExecutiveOverview.css';

export default function ExecutiveOverview() {
  const { scoredVendors, stats, weights, activeEvents, activeProfile, applyProfile, loading } = useRiskEngine();
  const navigate = useNavigate();
  const [treeExpanded, setTreeExpanded] = useState({ 
    gpr: true, 
    delivery: true, 
    quality: true,
    fin: true,
    lead: true,
    acc: true
  });

  if (loading) {
    return (
      <div className="exec-overview animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading 5,000 vendor risk profiles...</p>
        </div>
      </div>
    );
  }

  const topRisk = scoredVendors.slice(0, 5);
  const topVendor = scoredVendors[0];

  // Decision tree logic based on current weights and events
  const gprWeight = weights.GPR_Score;
  const hasGeoEvent = activeEvents.some(e => e.type === 'Geopolitical' || e.type === 'Maritime');
  const criticalCount = stats.critical;

  return (
    <div className="exec-overview animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Command Center</h1>
          <p>Analytical Vendor Risk Intelligence · Dynamic heuristic scoring · {stats.total} vendors monitored</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Active Profile:</span>
          <select value={activeProfile} onChange={(e) => applyProfile(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            {riskProfiles.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
            {activeProfile === 'custom' && <option value="custom">Custom</option>}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/weights')}>⚖ Configure Weights</button>
        </div>
      </div>

      {/* ── Active Events Banner ── */}
      {activeEvents.length > 0 && (
        <div className="events-banner">
          <span className="events-banner-icon">🌍</span>
          <span className="events-banner-text">
            <strong>{activeEvents.length} Active Disruption{activeEvents.length > 1 ? 's' : ''}</strong> affecting risk calculations
          </span>
          <div className="events-banner-tags">
            {activeEvents.map(e => (
              <span key={e.id} className="event-tag">{e.icon} {e.name}</span>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View Events →</button>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="grid-5">
        <div className="kpi-card danger">
          <span className="kpi-label">Global Risk Index</span>
          <span className="kpi-value" style={{ color: 'var(--color-danger)' }}>{stats.avg}</span>
          <div className="progress-bar"><div className="fill" style={{ width: `${stats.avg}%`, background: 'var(--color-danger)' }}></div></div>
        </div>
        <div className="kpi-card danger">
          <span className="kpi-label">Critical Vendors</span>
          <span className="kpi-value" style={{ color: 'var(--color-danger)' }}>{stats.critical}</span>
          <span className="kpi-trend down">Require immediate review</span>
        </div>
        <div className="kpi-card warning">
          <span className="kpi-label">High Risk</span>
          <span className="kpi-value" style={{ color: '#EA580C' }}>{stats.high}</span>
          <span className="kpi-trend neutral">Monitor closely</span>
        </div>
        <div className="kpi-card info">
          <span className="kpi-label">Active Events</span>
          <span className="kpi-value" style={{ color: 'var(--color-primary)' }}>{activeEvents.length}</span>
          <span className="kpi-trend neutral">Disruptions injected</span>
        </div>
        <div className="kpi-card success">
          <span className="kpi-label">Low Risk</span>
          <span className="kpi-value" style={{ color: 'var(--color-success)' }}>{stats.low}</span>
          <span className="kpi-trend up">Healthy operations</span>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="exec-grid">
        {/* Decision Tree */}
        <div className="card decision-tree-card">
          <div className="card-header">
            <span className="card-title">Decision Tree Risk Analysis</span>
            <span className="badge info">Live</span>
          </div>
          <div className="dtree">
            {/* Root */}
            <div className="dtree-node root">
              <div className="dtree-node-content">
                <span className="dtree-label">Vendor Risk Assessment</span>
                <span className="dtree-val" style={{ color: stats.avg >= 75 ? '#FF4D4F' : stats.avg >= 55 ? '#FF7A45' : stats.avg >= 35 ? '#FFC53D' : '#52C41A', fontWeight: 800, fontSize: 'var(--text-md)' }}>Score: {stats.avg}/100</span>
              </div>
            </div>
            <div className="dtree-branches">
              {/* Geopolitical Branch */}
              <div className={`dtree-branch ${hasGeoEvent ? 'active-critical' : ''}`}>
                <button className="dtree-node branch" onClick={() => setTreeExpanded(p => ({ ...p, gpr: !p.gpr }))}>
                  <div className="dtree-connector"></div>
                  <div className="dtree-node-content">
                    <span className="dtree-label">🌍 Geopolitical Risk</span>
                    <span className="dtree-val">Weight: {weights.GPR_Score || 0}%</span>
                    {hasGeoEvent && <span className="dtree-flag critical">⚡ EVENT ACTIVE</span>}
                  </div>
                </button>
                {treeExpanded.gpr && (
                  <div className="dtree-leaves">
                    <div className={`dtree-leaf ${weights.GPR_Score > 20 ? 'triggered' : ''}`}>
                      <div className="dtree-connector-leaf"></div>
                      <span>IF GPR_Weight &gt; 20% → <strong>Escalate APAC vendors</strong></span>
                      <span className={`dtree-status ${weights.GPR_Score > 20 ? 'yes' : 'no'}`}>{weights.GPR_Score > 20 ? 'TRUE' : 'FALSE'}</span>
                    </div>
                    <div className={`dtree-leaf ${hasGeoEvent ? 'triggered' : ''}`}>
                      <div className="dtree-connector-leaf"></div>
                      <span>IF Active_Event = WAR/MARITIME → <strong>+40% GPR multiplier</strong></span>
                      <span className={`dtree-status ${hasGeoEvent ? 'yes' : 'no'}`}>{hasGeoEvent ? 'TRUE' : 'FALSE'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Branch */}
              <div className="dtree-branch">
                <button className="dtree-node branch" onClick={() => setTreeExpanded(p => ({ ...p, delivery: !p.delivery }))}>
                  <div className="dtree-connector"></div>
                  <div className="dtree-node-content">
                    <span className="dtree-label">⏱️ Delivery Risk</span>
                    <span className="dtree-val">Weight: {weights.OnTime_Delivery || 0}%</span>
                  </div>
                </button>
                {treeExpanded.delivery && (
                  <div className="dtree-leaves">
                    <div className={`dtree-leaf ${topVendor && topVendor.modifiedParams.OnTime_Delivery < 70 ? 'triggered' : ''}`}>
                      <div className="dtree-connector-leaf"></div>
                      <span>IF OnTime_Delivery &lt; 70% → <strong>Flag delivery risk</strong></span>
                      <span className={`dtree-status ${topVendor && topVendor.modifiedParams.OnTime_Delivery < 70 ? 'yes' : 'no'}`}>
                        {topVendor && topVendor.modifiedParams.OnTime_Delivery < 70 ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quality Branch */}
              <div className="dtree-branch">
                <button className="dtree-node branch" onClick={() => setTreeExpanded(p => ({ ...p, quality: !p.quality }))}>
                  <div className="dtree-connector"></div>
                  <div className="dtree-node-content">
                    <span className="dtree-label">🔬 Quality Risk</span>
                    <span className="dtree-val">Weight: {weights.Defect_Rate_PPM || 0}%</span>
                  </div>
                </button>
                {treeExpanded.quality && (
                  <div className="dtree-leaves">
                    <div className={`dtree-leaf ${topVendor && topVendor.modifiedParams.Defect_Rate_PPM > 1500 ? 'triggered' : ''}`}>
                      <div className="dtree-connector-leaf"></div>
                      <span>IF Defect_Rate_PPM &gt; 1500 → <strong>Operational risk escalation</strong></span>
                      <span className={`dtree-status ${topVendor && topVendor.modifiedParams.Defect_Rate_PPM > 1500 ? 'yes' : 'no'}`}>
                        {topVendor && topVendor.modifiedParams.Defect_Rate_PPM > 1500 ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Branch */}
              <div className="dtree-branch">
                <button className="dtree-node branch" onClick={() => setTreeExpanded(p => ({ ...p, fin: !p.fin }))}>
                  <div className="dtree-connector"></div>
                  <div className="dtree-node-content">
                    <span className="dtree-label">💰 Financial Risk</span>
                    <span className="dtree-val">Weight: {weights.Financial_Stability || 0}%</span>
                  </div>
                </button>
                {treeExpanded.fin && (
                  <div className="dtree-leaves">
                    <div className={`dtree-leaf ${topVendor && topVendor.modifiedParams.Financial_Stability < 50 ? 'triggered' : ''}`}>
                      <div className="dtree-connector-leaf"></div>
                      <span>IF Financial_Stability &lt; 50 → <strong>Financial distress alert</strong></span>
                      <span className={`dtree-status ${topVendor && topVendor.modifiedParams.Financial_Stability < 50 ? 'yes' : 'no'}`}>
                        {topVendor && topVendor.modifiedParams.Financial_Stability < 50 ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Logistics Speed Branch */}
              <div className="dtree-branch">
                <button className="dtree-node branch" onClick={() => setTreeExpanded(p => ({ ...p, lead: !p.lead }))}>
                  <div className="dtree-connector"></div>
                  <div className="dtree-node-content">
                    <span className="dtree-label">⏳ Logistics Speed</span>
                    <span className="dtree-val">Weight: {weights.Avg_Lead_Time || 0}%</span>
                  </div>
                </button>
                {treeExpanded.lead && (
                  <div className="dtree-leaves">
                    <div className={`dtree-leaf ${topVendor && topVendor.modifiedParams.Avg_Lead_Time > 20 ? 'triggered' : ''}`}>
                      <div className="dtree-connector-leaf"></div>
                      <span>IF Avg_Lead_Time &gt; 20 days → <strong>Logistics bottleneck</strong></span>
                      <span className={`dtree-status ${topVendor && topVendor.modifiedParams.Avg_Lead_Time > 20 ? 'yes' : 'no'}`}>
                        {topVendor && topVendor.modifiedParams.Avg_Lead_Time > 20 ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipment Accuracy Branch */}
              <div className="dtree-branch">
                <button className="dtree-node branch" onClick={() => setTreeExpanded(p => ({ ...p, acc: !p.acc }))}>
                  <div className="dtree-connector"></div>
                  <div className="dtree-node-content">
                    <span className="dtree-label">🎯 Shipment Accuracy</span>
                    <span className="dtree-val">Weight: {weights.Shipment_Accuracy || 0}%</span>
                  </div>
                </button>
                {treeExpanded.acc && (
                  <div className="dtree-leaves">
                    <div className={`dtree-leaf ${topVendor && topVendor.modifiedParams.Shipment_Accuracy < 80 ? 'triggered' : ''}`}>
                      <div className="dtree-connector-leaf"></div>
                      <span>IF Shipment_Accuracy &lt; 80% → <strong>Logistics instability</strong></span>
                      <span className={`dtree-status ${topVendor && topVendor.modifiedParams.Shipment_Accuracy < 80 ? 'yes' : 'no'}`}>
                        {topVendor && topVendor.modifiedParams.Shipment_Accuracy < 80 ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="exec-right">
          {/* Top Risk Vendors */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Highest Risk Vendors</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/vendors')}>View All →</button>
            </div>
            <div className="risk-vendor-list">
              {topRisk.map((v, i) => (
                <div key={v.id} className="risk-vendor-row" onClick={() => navigate(`/vendor/${v.id}`)}>
                  <span className="rv-rank" style={{ color: v.riskColor }}>{i + 1}</span>
                  <div className="rv-info">
                    <span className="rv-name">{v.name}</span>
                    <span className="rv-region">{v.region} · {v.tier}</span>
                  </div>
                  <div className="rv-score-area">
                    <span className="rv-score font-mono" style={{ color: v.riskColor }}>{v.riskScore}</span>
                    <span className={`badge ${v.riskBand.toLowerCase()}`}>{v.riskBand}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weight Distribution Quick View */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Weight Distribution</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/weights')}>Configure →</button>
            </div>
            <div className="weight-bars">
              {Object.entries(weights)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([key, val]) => (
                  <div key={key} className="wb-row">
                    <span className="wb-label">{parameterConfig[key]?.icon} {parameterConfig[key]?.label}</span>
                    <div className="wb-bar-bg">
                      <div className="wb-bar-fill" style={{ width: `${val}%`, background: val > 20 ? 'var(--color-primary)' : val > 10 ? 'var(--color-warning)' : 'var(--text-muted)' }}></div>
                    </div>
                    <span className="wb-val font-mono">{val}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
