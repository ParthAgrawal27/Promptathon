import { useState, useMemo } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { parameterConfig } from '../data/mockData';
import './VendorComparison.css';

export default function VendorComparison() {
  const { scoredVendors, loading } = useRiskEngine();
  const [vendorAId, setVendorAId] = useState(null);
  const [vendorBId, setVendorBId] = useState(null);

  // Default to first two once loaded
  const vendorA = scoredVendors.find(v => v.id === vendorAId) || scoredVendors[0];
  const vendorB = scoredVendors.find(v => v.id === vendorBId) || scoredVendors[2];

  const comparisonParams = [
    { key: 'OnTime_Delivery', higher: 'better' },
    { key: 'Defect_Rate_PPM', higher: 'worse' },
    { key: 'Field_Failure_Rate', higher: 'worse' },
    { key: 'Financial_Stability', higher: 'better' },
    { key: 'Inspection_Pass_Rate', higher: 'better' },
    { key: 'Avg_Lead_Time', higher: 'worse' },
    { key: 'Shipment_Accuracy', higher: 'better' },
    { key: 'Audit_Score', higher: 'better' },
    { key: 'GPR_Score', higher: 'worse' },
    { key: 'ESG_Score', higher: 'better' },
    { key: 'Carbon_Score', higher: 'better' },
    { key: 'Labor_Compliance', higher: 'better' },
  ];

  const getCompColor = (a, b, higherIsWorse) => {
    if (higherIsWorse) return a > b ? 'var(--color-danger)' : a < b ? 'var(--color-success)' : 'var(--text-secondary)';
    return a > b ? 'var(--color-success)' : a < b ? 'var(--color-danger)' : 'var(--text-secondary)';
  };

  // Radar chart values (normalized 0-100)
  const radarMetrics = ['Delivery', 'Financial', 'Quality', 'ESG', 'Logistics'];
  const getRadarValues = (v) => {
    if (!v || !v.params) return [50, 50, 50, 50, 50];
    return [
      v.params.OnTime_Delivery || 50,
      v.params.Financial_Stability || 50,
      100 - Math.min(100, (v.params.Defect_Rate_PPM || 0) / 20),
      v.params.ESG_Score || 50,
      v.params.Shipment_Accuracy || 50,
    ];
  };
  const radarA = getRadarValues(vendorA);
  const radarB = getRadarValues(vendorB);

  const radarPoints = (values, cx, cy, r) => {
    return values.map((v, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      const x = cx + (v / 100) * r * Math.cos(angle);
      const y = cy + (v / 100) * r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const cx = 150, cy = 130, r = 100;

  // Recommendation
  const recommendation = useMemo(() => {
    if (!vendorA || !vendorB) return null;
    const better = vendorA.riskScore < vendorB.riskScore ? vendorA : vendorB;
    const worse = vendorA.riskScore < vendorB.riskScore ? vendorB : vendorA;
    const diff = worse.riskScore - better.riskScore;
    return { better, worse, diff };
  }, [vendorA, vendorB]);

  if (loading) {
    return (
      <div className="vendor-comparison animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading 5,000 vendors...</p>
        </div>
      </div>
    );
  }

  if (!vendorA || !vendorB) return <div>No vendors loaded</div>;

  return (
    <div className="vendor-comparison animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Vendor Comparison & Ranking</h1>
          <p>Side-by-side vendor analysis with analytical risk assessment · {scoredVendors.length} vendors</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="comp-selectors card">
        <div className="comp-select-group">
          <label>Vendor A</label>
          <select value={vendorA.id} onChange={(e) => setVendorAId(Number(e.target.value))}>
            {scoredVendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.vendorId})</option>)}
          </select>
        </div>
        <div className="comp-vs">VS</div>
        <div className="comp-select-group">
          <label>Vendor B</label>
          <select value={vendorB.id} onChange={(e) => setVendorBId(Number(e.target.value))}>
            {scoredVendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.vendorId})</option>)}
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
            <span className="card-title">Parameter Comparison</span>
          </div>
          <div className="comp-table">
            <div className="comp-row header">
              <span>{vendorA.name}</span>
              <span>Metric</span>
              <span>{vendorB.name}</span>
            </div>
            {/* Risk Score */}
            <div className="comp-row">
              <span className="comp-val" style={{ color: vendorA.riskColor }}>{vendorA.riskScore}</span>
              <span className="comp-metric-label">Risk Score</span>
              <span className="comp-val" style={{ color: vendorB.riskColor }}>{vendorB.riskScore}</span>
            </div>
            {comparisonParams.map((m) => {
              const cfg = parameterConfig[m.key];
              const valA = vendorA.params[m.key];
              const valB = vendorB.params[m.key];
              if (valA === undefined && valB === undefined) return null;
              const fmtA = typeof valA === 'number' ? (Number.isInteger(valA) ? valA : valA.toFixed(1)) : '-';
              const fmtB = typeof valB === 'number' ? (Number.isInteger(valB) ? valB : valB.toFixed(1)) : '-';
              return (
                <div key={m.key} className="comp-row">
                  <span className="comp-val" style={{ color: getCompColor(valA, valB, m.higher === 'worse') }}>
                    {fmtA}{cfg?.unit ? ` ${cfg.unit}` : ''}
                  </span>
                  <span className="comp-metric-label">{cfg?.icon} {cfg?.label}</span>
                  <span className="comp-val" style={{ color: getCompColor(valB, valA, m.higher === 'worse') }}>
                    {fmtB}{cfg?.unit ? ` ${cfg.unit}` : ''}
                  </span>
                </div>
              );
            })}
            <div className="comp-row">
              <span className={`badge ${vendorA.riskBand.toLowerCase()}`}>{vendorA.riskBand}</span>
              <span className="comp-metric-label">Risk Band</span>
              <span className={`badge ${vendorB.riskBand.toLowerCase()}`}>{vendorB.riskBand}</span>
            </div>
          </div>

          <div className="divider"></div>
          <div className="comp-ai-rec">
            <span className="card-title" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>Analytical Recommendation</span>
            {recommendation && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--color-success)' }}>{recommendation.better.name}</strong> has a
                risk score <strong>{recommendation.diff} points lower</strong> ({recommendation.better.riskScore} vs {recommendation.worse.riskScore}).
                Key advantages include {recommendation.better.params.OnTime_Delivery?.toFixed(1)}% on-time delivery
                and a financial stability of {recommendation.better.params.Financial_Stability?.toFixed(0)}/100.
                Consider prioritizing this vendor for critical supply chain operations.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
