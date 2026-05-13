import { useMemo } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { regionConfig } from '../data/mockData';
import './GeoIntelligence.css';

export default function GeoIntelligence() {
  const { scoredVendors, activeEvents, loading } = useRiskEngine();

  const regions = useMemo(() => {
    const r = {};
    scoredVendors.forEach(v => {
      if (!r[v.region]) r[v.region] = { vendors: [], totalRisk: 0 };
      r[v.region].vendors.push(v);
      r[v.region].totalRisk += v.riskScore;
    });
    return r;
  }, [scoredVendors]);

  // Only render top 200 dots on map for performance
  const mapVendors = useMemo(() => {
    return scoredVendors.slice(0, 200);
  }, [scoredVendors]);

  // Vendor map dots (simple SVG world projection)
  const projectLat = (lat) => (90 - lat) * (400 / 180);
  const projectLng = (lng) => (lng + 180) * (800 / 360);

  if (loading) {
    return (
      <div className="geo-intel animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading geo-intelligence data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="geo-intel animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Geo-Intelligence & Live Maps</h1>
          <p>Global vendor concentration · Disruption zones · Regional risk heatmap</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <span className="badge info">{scoredVendors.length} vendors mapped</span>
          {activeEvents.length > 0 && <span className="badge critical">{activeEvents.length} disruptions active</span>}
        </div>
      </div>

      {/* ── Dark Map Panel ── */}
      <div className="card geo-map-card">
        <svg viewBox="0 0 800 400" className="geo-svg">
          <rect width="800" height="400" fill="#0F172A" rx="8" />
          {/* Grid */}
          <g opacity="0.06">
            {Array.from({ length: 20 }, (_, i) => (
              <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="#94A3B8" />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="#94A3B8" />
            ))}
          </g>
          {/* Simplified continent outlines */}
          <g opacity="0.15" stroke="#94A3B8" strokeWidth="0.5" fill="none">
            <ellipse cx="400" cy="140" rx="80" ry="50" />{/* Europe */}
            <ellipse cx="420" cy="220" rx="60" ry="70" />{/* Africa */}
            <ellipse cx="200" cy="160" rx="100" ry="60" />{/* N America */}
            <ellipse cx="220" cy="270" rx="50" ry="50" />{/* S America */}
            <ellipse cx="580" cy="170" rx="120" ry="70" />{/* Asia */}
            <ellipse cx="650" cy="300" rx="40" ry="30" />{/* Australia */}
          </g>
          {/* Active event zones */}
          {activeEvents.map((evt) => {
            const regionVendors = mapVendors.filter(v => evt.region === 'Global' || v.region === evt.region);
            if (regionVendors.length === 0) return null;
            const cx = regionVendors.reduce((a, v) => a + projectLng(v.lng), 0) / regionVendors.length;
            const cy = regionVendors.reduce((a, v) => a + projectLat(v.lat), 0) / regionVendors.length;
            return (
              <g key={evt.id}>
                <circle cx={cx} cy={cy} r="60" fill="#EF4444" opacity="0.08" className="geo-pulse" />
                <circle cx={cx} cy={cy} r="35" fill="#EF4444" opacity="0.15" className="geo-pulse-inner" />
                <text x={cx} y={cy - 42} textAnchor="middle" fill="#EF4444" fontSize="9" fontWeight="700" fontFamily="Inter">
                  ⚡ {evt.name}
                </text>
              </g>
            );
          })}
          {/* Vendor dots (top 200 only for performance) */}
          {mapVendors.map(v => {
            const x = projectLng(v.lng);
            const y = projectLat(v.lat);
            const isAffected = activeEvents.some(e => e.region === 'Global' || e.region === v.region);
            return (
              <g key={v.id}>
                {isAffected && <circle cx={x} cy={y} r="8" fill={v.riskColor} opacity="0.2" className="geo-dot-pulse" />}
                <circle cx={x} cy={y} r="3" fill={v.riskColor} stroke="#0F172A" strokeWidth="1" />
              </g>
            );
          })}
          {/* Legend */}
          <g transform="translate(20, 340)">
            {[{ c: '#DC2626', l: 'Critical' }, { c: '#EA580C', l: 'High' }, { c: '#D97706', l: 'Moderate' }, { c: '#059669', l: 'Low' }].map((item, i) => (
              <g key={item.l} transform={`translate(${i * 90}, 0)`}>
                <circle cx="4" cy="4" r="4" fill={item.c} />
                <text x="12" y="7" fill="#94A3B8" fontSize="8" fontFamily="Inter">{item.l}</text>
              </g>
            ))}
            <text x="380" y="7" fill="#64748B" fontSize="7" fontFamily="Inter">
              Showing top 200 of {scoredVendors.length} vendors
            </text>
          </g>
        </svg>
      </div>

      {/* ── Regional Breakdown ── */}
      <div className="geo-regions-grid">
        {Object.entries(regions).sort(([, a], [, b]) => (b.totalRisk / b.vendors.length) - (a.totalRisk / a.vendors.length)).map(([region, data]) => {
          const avg = Math.round(data.totalRisk / data.vendors.length);
          const cfg = regionConfig[region] || { color: '#6366F1', abbr: '??' };
          const critical = data.vendors.filter(v => v.riskBand === 'Critical').length;
          const topVendors = data.vendors.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
          return (
            <div key={region} className="card geo-region-card">
              <div className="geo-region-header">
                <span className="geo-region-abbr" style={{ background: cfg.color + '18', color: cfg.color }}>{cfg.abbr}</span>
                <div className="geo-region-info">
                  <span className="geo-region-name">{region}</span>
                  <span className="geo-region-count">{data.vendors.length} vendors</span>
                </div>
                <span className="geo-region-score font-mono" style={{ color: avg >= 55 ? 'var(--color-danger)' : 'var(--text-primary)' }}>{avg}</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
                <div className="fill" style={{ width: `${avg}%`, background: cfg.color }}></div>
              </div>
              {critical > 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>⚠ {critical} critical vendor{critical > 1 ? 's' : ''}</span>}
              <div className="geo-region-vendors">
                {topVendors.map(v => (
                  <div key={v.id} className="geo-rv">
                    <span className="geo-rv-name">{v.name}</span>
                    <span className="geo-rv-score font-mono" style={{ color: v.riskColor }}>{v.riskScore}</span>
                  </div>
                ))}
                {data.vendors.length > 5 && (
                  <div className="geo-rv" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    <span className="geo-rv-name">+{data.vendors.length - 5} more</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
