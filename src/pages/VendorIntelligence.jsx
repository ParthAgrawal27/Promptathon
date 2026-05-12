import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRiskEngine } from '../context/RiskEngine';
import './VendorIntelligence.css';

export default function VendorIntelligence() {
  const { scoredVendors, activeEvents } = useRiskEngine();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('riskScore');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = filter === 'all' ? scoredVendors :
    scoredVendors.filter(v => v.riskBand.toLowerCase() === filter);

  const sorted = [...filtered].sort((a, b) => {
    const av = sortKey === 'name' ? a.name : a[sortKey];
    const bv = sortKey === 'name' ? b.name : b[sortKey];
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const counts = { all: scoredVendors.length,
    critical: scoredVendors.filter(v => v.riskBand === 'Critical').length,
    high: scoredVendors.filter(v => v.riskBand === 'High').length,
    moderate: scoredVendors.filter(v => v.riskBand === 'Moderate').length,
    low: scoredVendors.filter(v => v.riskBand === 'Low').length,
  };

  return (
    <div className="vendor-intel animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Vendor Intelligence</h1>
          <p>Analytical risk scoring · Weighted heuristic rankings · {scoredVendors.length} vendors</p>
        </div>
        {activeEvents.length > 0 && <span className="badge critical">⚡ {activeEvents.length} events active</span>}
      </div>

      <div className="vi-filters">
        <div className="filter-pills">
          {['all', 'critical', 'high', 'moderate', 'low'].map(f => (
            <button key={f} className={`filter-pill ${filter === f ? 'active' : ''} ${f}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">Vendor {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Region</th>
                <th>Tier</th>
                <th onClick={() => handleSort('riskScore')} className="sortable">Risk Score {sortKey === 'riskScore' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Band</th>
                <th>Top Risk Factor</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(v => {
                const topFactor = Object.entries(v.contributions).sort(([,a],[,b]) => b.contribution - a.contribution)[0];
                return (
                  <tr key={v.id} onClick={() => navigate(`/vendor/${v.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="vendor-cell">
                        <span className="vendor-cell-name">{v.name}</span>
                        <span className="vendor-cell-region">{v.country}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{v.region}</td>
                    <td><span className="badge info">{v.tier}</span></td>
                    <td>
                      <div className="score-cell">
                        <div className="score-bar-bg">
                          <div className="score-bar-fill" style={{ width: `${v.riskScore}%`, background: v.riskColor }}></div>
                        </div>
                        <span className="score-number" style={{ color: v.riskColor }}>{v.riskScore}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${v.riskBand.toLowerCase()}`}>{v.riskBand}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {topFactor ? `${topFactor[0].replace(/_/g,' ')} (${topFactor[1].contribution})` : '-'}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{v.category}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span className="table-info">Showing {sorted.length} of {scoredVendors.length} vendors</span>
        </div>
      </div>
    </div>
  );
}
