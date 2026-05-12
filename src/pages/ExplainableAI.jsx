import { shapFeatures, vendors } from '../data/mockData';
import './ExplainableAI.css';

export default function ExplainableAI() {
  const vendor = vendors[0];
  const maxImpact = Math.max(...shapFeatures.map(f => Math.abs(f.impact)));

  return (
    <div className="explainable-ai animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Explainable AI Analysis</h1>
          <p>Understanding AI risk predictions with SHAP-based feature attribution</p>
        </div>
        <select className="xai-vendor-select" defaultValue="1">
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name} (Score: {v.riskScore})</option>
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
                    <div className="xai-wf-bar pos" style={{ width: `${(f.impact / maxImpact) * 40}%`, left: '50%' }}>
                      <span className="xai-wf-bar-label">+{(f.impact * 100).toFixed(0)}%</span>
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
            <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>→ Final: {vendor.riskScore}</span>
          </div>
        </div>

        {/* Reasoning Panel */}
        <div className="xai-sidebar-col">
          <div className="card xai-reasoning">
            <div className="card-header">
              <span className="card-title">AI Reasoning Log</span>
              <span className="badge info">GPT-4 Analysis</span>
            </div>
            <div className="reasoning-feed">
              {[
                { step: 1, text: 'Analyzing delivery performance data: 38% late shipments in Q1 2025, significantly above 15% threshold.', type: 'analysis' },
                { step: 2, text: 'Financial health check: Liquidity ratio at 0.8x (critical threshold: 1.0x). Moody\'s downgrade from Ba2 to B1.', type: 'analysis' },
                { step: 3, text: 'Geopolitical risk factor elevated due to APAC trade tensions. Supplier concentration in single region adds +12% risk weight.', type: 'factor' },
                { step: 4, text: 'Quality metrics trending negative: Defect rate increased from 2.1% to 4.2% over 6 months. Statistical significance: p<0.01.', type: 'analysis' },
                { step: 5, text: 'ESG compliance partially offsets risk: Basic environmental reporting in place, but governance gaps identified.', type: 'mitigant' },
                { step: 6, text: 'Final prediction: 87/100 risk score with 87% confidence. Recommend enhanced monitoring and backup supplier activation.', type: 'conclusion' },
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
              <span className="card-title">Model Metrics</span>
            </div>
            <div className="model-metrics">
              <div className="mm-item">
                <span className="mm-label">Confidence</span>
                <div className="mm-bar-bg"><div className="mm-bar" style={{ width: '87%', background: 'var(--color-primary)' }}></div></div>
                <span className="mm-val">87%</span>
              </div>
              <div className="mm-item">
                <span className="mm-label">Data Quality</span>
                <div className="mm-bar-bg"><div className="mm-bar" style={{ width: '92%', background: 'var(--color-success)' }}></div></div>
                <span className="mm-val">92%</span>
              </div>
              <div className="mm-item">
                <span className="mm-label">Feature Coverage</span>
                <div className="mm-bar-bg"><div className="mm-bar" style={{ width: '78%', background: 'var(--color-warning)' }}></div></div>
                <span className="mm-val">78%</span>
              </div>
              <div className="mm-item">
                <span className="mm-label">Model Accuracy</span>
                <div className="mm-bar-bg"><div className="mm-bar" style={{ width: '94%', background: 'var(--color-success)' }}></div></div>
                <span className="mm-val">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
