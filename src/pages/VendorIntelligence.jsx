import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRiskEngine } from '../context/RiskEngine';
import './VendorIntelligence.css';

const PAGE_SIZE = 50;

export default function VendorIntelligence() {
  const { scoredVendors, activeEvents, loading } = useRiskEngine();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('riskScore');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = filter === 'all' ? scoredVendors :
      scoredVendors.filter(v => v.riskBand.toLowerCase() === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.vendorId?.toLowerCase().includes(q) ||
        v.country?.toLowerCase().includes(q) ||
        v.region?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [scoredVendors, filter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = sortKey === 'name' ? a.name : a[sortKey];
      const bv = sortKey === 'name' ? b.name : b[sortKey];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter/search change
  const setFilterAndReset = (f) => { setFilter(f); setPage(1); };
  const setSearchAndReset = (s) => { setSearch(s); setPage(1); };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const counts = {
    all: scoredVendors.length,
    critical: scoredVendors.filter(v => v.riskBand === 'Critical').length,
    high: scoredVendors.filter(v => v.riskBand === 'High').length,
    moderate: scoredVendors.filter(v => v.riskBand === 'Moderate').length,
    low: scoredVendors.filter(v => v.riskBand === 'Low').length,
  };

  if (loading) {
    return (
      <div className="vendor-intel animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading 5,000 vendors...</p>
        </div>
      </div>
    );
  }

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
              onClick={() => setFilterAndReset(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search vendor name, ID, country..."
          value={search}
          onChange={(e) => setSearchAndReset(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
            minWidth: '240px',
          }}
        />
      </div>

      <div className="card table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
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
              {paged.map((v, idx) => {
                const topFactor = Object.entries(v.contributions).sort(([,a],[,b]) => b.contribution - a.contribution)[0];
                return (
                  <tr key={v.id} onClick={() => navigate(`/vendor/${v.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td>
                      <div className="vendor-cell">
                        <span className="vendor-cell-name">{v.name}</span>
                        <span className="vendor-cell-region">{v.vendorId} · {v.country}</span>
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
          <span className="table-info">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} vendors
            {search && ` (filtered from ${scoredVendors.length})`}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              Page {page} of {totalPages || 1}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
