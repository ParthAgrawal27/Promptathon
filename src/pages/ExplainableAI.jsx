import { useState, useMemo } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { parameterConfig } from '../data/mockData';
import './ExplainableAI.css';

export default function ExplainableAI() {
  const { scoredVendors, loading } = useRiskEngine();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const vendor = scoredVendors[selectedIdx] || scoredVendors[0];

  // Generate SHAP-like feature contributions from the vendor's scored contributions
  const shapFeatures = useMemo(() => {
    if (!vendor?.contributions) return [];
    return Object.entries(vendor.contributions)
      .map(([key, data]) => ({
        feature: parameterConfig[key]?.label || key.replace(/_/g, ' '),
        impact: (data.contribution / 100) * (data.normalized >= 50 ? 1 : -1),
        direction: data.normalized >= 50 ? 'positive' : 'negative',
        normalized: data.normalized,
        contribution: data.contribution,
      }))
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }, [vendor]);

  const maxImpact = Math.max(...shapFeatures.map(f => Math.abs(f.impact)), 0.01);

  if (loading || !vendor) {
    return (
      <div className="explainable-ai animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading analysis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="explainable-ai animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Explainable Risk Analysis</h1>
          <p>Understanding risk scores with feature attribution analysis · {scoredVendors.length} vendors</p>
        </div>
        <select className="xai-vendor-select" value={selectedIdx} onChange={(e) => setSelectedIdx(Number(e.target.value))}>
          {scoredVendors.slice(0, 200).map((v, i) => (
            <option key={v.id} value={i}>{v.name} (Score: {v.riskScore})</option>
          ))}
        </select>
      </div>

      <div className="xai-grid">
        {/* Main SHAP Chart */}
        <div className="card xai-main-chart">
          <div className="card-header">
            <span className="card-title">Feature Contribution Waterfall</span>
            <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 4, background: 'var(--color-danger)', borderRadius: 2 }}></span>
                <span style={{ color: 'var(--text-tertiary)' }}>Increases Risk</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 4, background: 'var(--color-success)', borderRadius: 2 }}></span>
                <span style={{ color: 'var(--text-tertiary)' }}>Decreases Risk</span>
              </span>
            </div>
          </div>
          <div className="xai-waterfall">
            {shapFeatures.map((f, i) => (
              <div key={i} className="xai-wf-row" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="xai-wf-feature">{f.feature}</span>
                <div className="xai-wf-bar-area">
                  <div className="xai-wf-center-line"></div>
                  {f.direction === 'positive' ? (
                    <div className="xai-wf-bar pos" style={{ width: `${(Math.abs(f.impact) / maxImpact) * 40}%`, left: '50%' }}>
                      <span className="xai-wf-bar-label">+{(Math.abs(f.impact) * 100).toFixed(0)}%</span>
                    </div>
                  ) : (
                    <div className="xai-wf-bar neg" style={{ width: `${(Math.abs(f.impact) / maxImpact) * 40}%`, right: '50%' }}>
                      <span className="xai-wf-bar-label">{(f.impact * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                <span className={`xai-wf-val ${f.direction}`}>
                  {f.direction === 'positive' ? '+' : ''}{f.impact.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
          <div className="xai-base-score">
            <span>Base Score: 50.0</span>
            <span style={{ fontWeight: 700, color: vendor.riskColor }}>→ Final: {vendor.riskScore}</span>
          </div>
        </div>

        {/* Reasoning Panel */}
        <div className="xai-sidebar-col">
          <div className="card xai-reasoning">
            <div className="card-header">
              <span className="card-title">Analytical Reasoning Log</span>
              <span className="badge info">Heuristic Analysis</span>
            </div>
            <div className="reasoning-feed">
              {[
                { step: 1, text: `Analyzing delivery performance: ${vendor.params.OnTime_Delivery?.toFixed(1)}% on-time rate ${vendor.params.OnTime_Delivery < 70 ? '(below 70% threshold — flagged)' : '(within acceptable range)'}.`, type: 'analysis' },
                { step: 2, text: `Financial health check: Stability score ${vendor.params.Financial_Stability?.toFixed(0)}/100. Debt-to-equity: ${vendor.params.Debt_Equity?.toFixed(2) || 'N/A'}.`, type: 'analysis' },
                { step: 3, text: `Geopolitical risk factor: GPR score ${vendor.params.GPR_Score?.toFixed(0)}/100. Region: ${vendor.region}. Tariff exposure: ${vendor.params.Tariff_Exposure?.toFixed(0) || 'N/A'}%.`, type: 'factor' },
                { step: 4, text: `Quality metrics: Defect rate ${vendor.params.Defect_Rate_PPM?.toFixed(0)} PPM. Field failure rate: ${vendor.params.Field_Failure_Rate?.toFixed(2)}%. Inspection pass: ${vendor.params.Inspection_Pass_Rate?.toFixed(1)}%.`, type: 'analysis' },
                { step: 5, text: `ESG assessment: ESG score ${vendor.params.ESG_Score?.toFixed(0) || 'N/A'}/100. Carbon: ${vendor.params.Carbon_Score?.toFixed(0) || 'N/A'}/100. Labor compliance: ${vendor.params.Labor_Compliance?.toFixed(0) || 'N/A'}/100.`, type: 'mitigant' },
                { step: 6, text: `Final assessment: ${vendor.riskScore}/100 risk score (${vendor.riskBand}). ${vendor.riskScore >= 75 ? 'Enhanced monitoring and backup supplier activation recommended.' : vendor.riskScore >= 55 ? 'Close monitoring recommended.' : 'Within acceptable parameters.'}`, type: 'conclusion' },
              ].map((entry) => (
                <div key={entry.step} className={`reasoning-entry ${entry.type}`}>
                  <div className="reasoning-step">Step {entry.step}</div>
                  <p className="reasoning-text">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Analysis Metrics</span>
            </div>
            <div className="model-metrics">
              <div className="mm-item">
                <span className="mm-label">Data Completeness</span>
                <div className="mm-bar-bg"><div className="mm-bar" style={{ width: `${Math.min(100, Object.keys(vendor.params).length * 4)}%`, background: 'var(--color-primary)' }}></div></div>
                <span className="mm-val">{Math.min(100, Object.keys(vendor.params).length * 4)}%</span>
              </div>
              <div className="mm-item">
                <span className="mm-label">Parameters Scored</span>
                <div className="mm-bar-bg"><div className="mm-bar" style={{ width: '100%', background: 'var(--color-success)' }}></div></div>
                <span className="mm-val">{Object.keys(vendor.contributions).length}</span>
              </div>
              <div className="mm-item">
                <span className="mm-label">Feature Coverage</span>
                <div className="mm-bar-bg"><div className="mm-bar" style={{ width: '92%', background: 'var(--color-warning)' }}></div></div>
                <span className="mm-val">92%</span>
              </div>
              <div className="mm-item">
                <span className="mm-label">Dataset Size</span>
                <div className="mm-bar-bg"><div className="mm-bar" style={{ width: '100%', background: 'var(--color-success)' }}></div></div>
                <span className="mm-val">{scoredVendors.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
