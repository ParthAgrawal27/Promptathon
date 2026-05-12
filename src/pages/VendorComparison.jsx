import { useState } from 'react';
import { vendors } from '../data/mockData';
import './VendorComparison.css';

export default function VendorComparison() {
  const [vendorA, setVendorA] = useState(vendors[0]);
  const [vendorB, setVendorB] = useState(vendors[2]);

  const metrics = [
    { label: 'Risk Score', key: 'riskScore', inv: true },
    { label: 'Delivery Reliability', key: 'deliveryReliability', inv: false },
    { label: 'Financial Health', key: 'financialHealth', inv: false },
    { label: 'Defect Rate', key: 'defectRate', inv: true, suffix: '%' },
    { label: 'Predicted Failure', key: 'predictedFailure', inv: true, suffix: '%' },
  ];

  const getCompColor = (a, b, inv) => {
    if (inv) return a > b ? 'var(--color-danger)' : a < b ? 'var(--color-success)' : 'var(--text-secondary)';
    return a > b ? 'var(--color-success)' : a < b ? 'var(--color-danger)' : 'var(--text-secondary)';
  };

  // Radar chart values (normalized 0-100)
  const radarMetrics = ['Delivery', 'Financial', 'Quality', 'ESG', 'Reliability'];
  const radarA = [vendorA.deliveryReliability, vendorA.financialHealth, 100 - vendorA.defectRate * 10, vendorA.esgRating === 'A+' ? 95 : vendorA.esgRating === 'A' ? 85 : vendorA.esgRating === 'B+' ? 75 : vendorA.esgRating === 'B' ? 65 : vendorA.esgRating === 'B-' ? 55 : vendorA.esgRating === 'C+' ? 45 : vendorA.esgRating === 'C' ? 35 : 25, 100 - vendorA.predictedFailure];
  const radarB = [vendorB.deliveryReliability, vendorB.financialHealth, 100 - vendorB.defectRate * 10, vendorB.esgRating === 'A+' ? 95 : vendorB.esgRating === 'A' ? 85 : vendorB.esgRating === 'B+' ? 75 : vendorB.esgRating === 'B' ? 65 : vendorB.esgRating === 'B-' ? 55 : vendorB.esgRating === 'C+' ? 45 : vendorB.esgRating === 'C' ? 35 : 25, 100 - vendorB.predictedFailure];

  const radarPoints = (values, cx, cy, r) => {
    return values.map((v, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      const x = cx + (v / 100) * r * Math.cos(angle);
      const y = cy + (v / 100) * r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const cx = 150, cy = 130, r = 100;

  return (
    <div className="vendor-comparison animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Vendor Comparison & Ranking</h1>
          <p>Side-by-side vendor analysis with AI-powered recommendations</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="comp-selectors card">
        <div className="comp-select-group">
          <label>Vendor A</label>
          <select value={vendorA.id} onChange={(e) => setVendorA(vendors.find(v => v.id === Number(e.target.value)))}>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="comp-vs">VS</div>
        <div className="comp-select-group">
          <label>Vendor B</label>
          <select value={vendorB.id} onChange={(e) => setVendorB(vendors.find(v => v.id === Number(e.target.value)))}>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="comp-grid">
        {/* Radar Chart */}
        <div className="card comp-radar-card">
          <div className="card-header">
            <span className="card-title">Performance Radar</span>
          </div>
          <svg viewBox="0 0 300 280" className="radar-svg">
            {/* Grid */}
            {[20, 40, 60, 80, 100].map((pct) => (
              <polygon key={pct}
                points={radarMetrics.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2;
                  return `${cx + (pct / 100) * r * Math.cos(angle)},${cy + (pct / 100) * r * Math.sin(angle)}`;
                }).join(' ')}
                fill="none" stroke="var(--border-default)" strokeWidth="0.5"
              />
            ))}
            {/* Axes */}
            {radarMetrics.map((label, i) => {
              const angle = (Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2;
              const lx = cx + (r + 16) * Math.cos(angle);
              const ly = cy + (r + 16) * Math.sin(angle);
              return (
                <g key={i}>
                  <line x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="var(--border-default)" strokeWidth="0.5" />
                  <text x={lx} y={ly} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9" fontFamily="Inter" dominantBaseline="middle">{label}</text>
                </g>
              );
            })}
            {/* Vendor A */}
            <polygon points={radarPoints(radarA, cx, cy, r)} fill="rgba(239,68,68,0.15)" stroke="#EF4444" strokeWidth="1.5" />
            {/* Vendor B */}
            <polygon points={radarPoints(radarB, cx, cy, r)} fill="rgba(16,185,129,0.15)" stroke="#10B981" strokeWidth="1.5" />
          </svg>
          <div className="radar-legend">
            <span style={{ color: '#EF4444', fontSize: 'var(--text-xs)', fontWeight: 600 }}>● {vendorA.name}</span>
            <span style={{ color: '#10B981', fontSize: 'var(--text-xs)', fontWeight: 600 }}>● {vendorB.name}</span>
          </div>
        </div>

        {/* Metrics Comparison */}
        <div className="card comp-metrics-card">
          <div className="card-header">
            <span className="card-title">Metric Comparison</span>
          </div>
          <div className="comp-table">
            <div className="comp-row header">
              <span>{vendorA.name}</span>
              <span>Metric</span>
              <span>{vendorB.name}</span>
            </div>
            {metrics.map((m) => (
              <div key={m.key} className="comp-row">
                <span className="comp-val" style={{ color: getCompColor(vendorA[m.key], vendorB[m.key], m.inv) }}>
                  {vendorA[m.key]}{m.suffix || ''}
                </span>
                <span className="comp-metric-label">{m.label}</span>
                <span className="comp-val" style={{ color: getCompColor(vendorB[m.key], vendorA[m.key], m.inv) }}>
                  {vendorB[m.key]}{m.suffix || ''}
                </span>
              </div>
            ))}
            <div className="comp-row">
              <span className={`badge ${vendorA.riskBand.toLowerCase()}`}>{vendorA.riskBand}</span>
              <span className="comp-metric-label">Risk Band</span>
              <span className={`badge ${vendorB.riskBand.toLowerCase()}`}>{vendorB.riskBand}</span>
            </div>
            <div className="comp-row">
              <span className="comp-val">{vendorA.esgRating}</span>
              <span className="comp-metric-label">ESG Rating</span>
              <span className="comp-val">{vendorB.esgRating}</span>
            </div>
          </div>

          <div className="divider"></div>
          <div className="comp-ai-rec">
            <span className="card-title" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>AI Recommendation</span>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--color-success)' }}>{vendorB.name}</strong> is the stronger choice with a
              risk score <strong>{vendorA.riskScore - vendorB.riskScore} points lower</strong> and
              superior delivery reliability ({vendorB.deliveryReliability}% vs {vendorA.deliveryReliability}%).
              Consider transitioning critical volumes to reduce supply chain exposure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
