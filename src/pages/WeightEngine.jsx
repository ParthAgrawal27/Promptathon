import { useRiskEngine } from '../context/RiskEngine';
import { parameterConfig, riskProfiles } from '../data/mockData';
import './WeightEngine.css';

export default function WeightEngine() {
  const { weights, updateWeight, applyProfile, activeProfile, scoredVendors, stats } = useRiskEngine();
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const topVendors = scoredVendors.slice(0, 8);
  const sortedWeights = Object.entries(weights).sort(([, a], [, b]) => b - a);

  return (
    <div className="weight-engine animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Risk Weight Configuration Engine</h1>
          <p>Dynamically adjust parameter importance · All vendor scores recalculate in real time</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span className="badge info">{activeProfile === 'custom' ? 'Custom Profile' : riskProfiles.find(p => p.id === activeProfile)?.name}</span>
          <span className={`badge ${totalWeight === 100 ? 'low' : 'critical'}`}>Total: {totalWeight}%</span>
        </div>
      </div>

      {/* ── Profile Presets ── */}
      <div className="we-profiles">
        {riskProfiles.map(p => (
          <button key={p.id} className={`we-profile-card ${activeProfile === p.id ? 'active' : ''}`}
            onClick={() => applyProfile(p.id)}>
            <span className="we-profile-icon">{p.icon}</span>
            <span className="we-profile-name">{p.name}</span>
            <span className="we-profile-desc">{p.desc}</span>
          </button>
        ))}
      </div>

      <div className="we-layout">
        {/* ── Sliders Panel ── */}
        <div className="card we-sliders-card">
          <div className="card-header">
            <span className="card-title">Parameter Weights</span>
            <span style={{ fontSize: 'var(--text-xs)', color: totalWeight === 100 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {totalWeight}% / 100%
            </span>
          </div>

          {Object.entries(parameterConfig).map(([key, cfg]) => {
            const val = weights[key] || 0;
            return (
              <div key={key} className="we-slider-row">
                <div className="we-slider-header">
                  <span className="we-slider-icon">{cfg.icon}</span>
                  <span className="we-slider-label">{cfg.label}</span>
                  <span className={`we-slider-cat badge ${cfg.category === 'Quality' ? 'info' : cfg.category === 'Geopolitical' ? 'critical' : cfg.category === 'Financial' ? 'moderate' : 'low'}`}>
                    {cfg.category}
                  </span>
                  <input type="number" className="we-slider-input" value={val} min={0} max={100}
                    onChange={e => updateWeight(key, parseInt(e.target.value) || 0)} />
                </div>
                <div className="we-slider-track">
                  <input type="range" min={0} max={50} value={val}
                    onChange={e => updateWeight(key, parseInt(e.target.value))}
                    className="we-range" style={{ '--fill': `${(val / 50) * 100}%` }} />
                  <div className="we-slider-marks">
                    <span>0%</span><span>25%</span><span>50%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Live Results Panel ── */}
        <div className="we-results">
          {/* Dominance Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Parameter Dominance</span>
            </div>
            <div className="we-dominance">
              {sortedWeights.map(([key, val]) => (
                <div key={key} className="we-dom-row">
                  <span className="we-dom-label">{parameterConfig[key]?.icon} {parameterConfig[key]?.label}</span>
                  <div className="we-dom-bar-bg">
                    <div className="we-dom-bar" style={{
                      width: `${(val / Math.max(...Object.values(weights), 1)) * 100}%`,
                      background: val >= 20 ? 'var(--color-danger)' : val >= 12 ? 'var(--color-primary)' : '#CBD5E1'
                    }}></div>
                  </div>
                  <span className="we-dom-val font-mono">{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Vendor Rankings */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Live Vendor Rankings</span>
              <span className="badge info">Recalculating</span>
            </div>
            <div className="we-rankings">
              {topVendors.map((v, i) => (
                <div key={v.id} className="we-rank-row">
                  <span className="we-rank-num font-mono" style={{ color: v.riskColor }}>#{i + 1}</span>
                  <span className="we-rank-name">{v.name}</span>
                  <div className="we-rank-bar-bg">
                    <div className="we-rank-bar" style={{ width: `${v.riskScore}%`, background: v.riskColor }}></div>
                  </div>
                  <span className="we-rank-score font-mono" style={{ color: v.riskColor }}>{v.riskScore}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="card">
            <div className="card-header"><span className="card-title">Impact Summary</span></div>
            <div className="grid-2">
              <div className="we-stat">
                <span className="we-stat-val" style={{ color: 'var(--color-danger)' }}>{stats.critical}</span>
                <span className="we-stat-label">Critical</span>
              </div>
              <div className="we-stat">
                <span className="we-stat-val" style={{ color: '#EA580C' }}>{stats.high}</span>
                <span className="we-stat-label">High</span>
              </div>
              <div className="we-stat">
                <span className="we-stat-val" style={{ color: 'var(--color-warning)' }}>{stats.moderate}</span>
                <span className="we-stat-label">Moderate</span>
              </div>
              <div className="we-stat">
                <span className="we-stat-val" style={{ color: 'var(--color-success)' }}>{stats.low}</span>
                <span className="we-stat-label">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
