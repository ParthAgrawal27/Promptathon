import { useRiskEngine } from '../context/RiskEngine';
import { regionConfig } from '../data/mockData';
import './GeoIntelligence.css';

export default function GeoIntelligence() {
  const { scoredVendors, activeEvents } = useRiskEngine();

  const regions = {};
  scoredVendors.forEach(v => {
    if (!regions[v.region]) regions[v.region] = { vendors: [], totalRisk: 0 };
    regions[v.region].vendors.push(v);
    regions[v.region].totalRisk += v.riskScore;
  });

  // Vendor map dots (simple SVG world projection)
  const projectLat = (lat) => (90 - lat) * (400 / 180);
  const projectLng = (lng) => (lng + 180) * (800 / 360);

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
          {/* World Map Background */}
          <image 
            href="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
            x="0" y="0" width="800" height="400" 
            opacity="0.25" 
            preserveAspectRatio="none"
            style={{ filter: 'invert(1) opacity(0.8) drop-shadow(0px 0px 2px rgba(255,255,255,0.2))' }}
          />
          {/* Active event zones */}
          {activeEvents.map((evt, i) => {
            const regionVendors = scoredVendors.filter(v => evt.region === 'Global' || v.region === evt.region);
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
          {/* Vendor dots */}
          {scoredVendors.map(v => {
            const x = projectLng(v.lng);
            const y = projectLat(v.lat);
            const isAffected = activeEvents.some(e => e.region === 'Global' || e.region === v.region);
            return (
              <g key={v.id}>
                {isAffected && <circle cx={x} cy={y} r="10" fill={v.riskColor} opacity="0.2" className="geo-dot-pulse" />}
                <circle cx={x} cy={y} r="4" fill={v.riskColor} stroke="#0F172A" strokeWidth="1.5" />
                <text x={x} y={y - 8} textAnchor="middle" fill="#CBD5E1" fontSize="7" fontFamily="Inter">
                  {v.name.split(' ')[0]}
                </text>
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
          </g>
        </svg>
      </div>

      {/* ── Regional Breakdown ── */}
      <div className="geo-regions-grid">
        {Object.entries(regions).sort(([, a], [, b]) => (b.totalRisk / b.vendors.length) - (a.totalRisk / a.vendors.length)).map(([region, data]) => {
          const avg = Math.round(data.totalRisk / data.vendors.length);
          const cfg = regionConfig[region] || { color: '#6366F1', abbr: '??' };
          const critical = data.vendors.filter(v => v.riskBand === 'Critical').length;
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
                {data.vendors.map(v => (
                  <div key={v.id} className="geo-rv">
                    <span className="geo-rv-name">{v.name}</span>
                    <span className="geo-rv-score font-mono" style={{ color: v.riskColor }}>{v.riskScore}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
