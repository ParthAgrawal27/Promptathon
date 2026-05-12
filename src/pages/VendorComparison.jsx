import { useState } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { parameterConfig } from '../data/mockData';
import './VendorComparison.css';

export default function VendorComparison() {
  const { scoredVendors } = useRiskEngine();
  const [selectedIds, setSelectedIds] = useState([1, 9, 5]);

  const selected = selectedIds.map(id => scoredVendors.find(v => v.id === id)).filter(Boolean);

  const toggleVendor = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(v => v !== id));
    else if (selectedIds.length < 4) setSelectedIds(prev => [...prev, id]);
  };

  return (
    <div className="vendor-comparison animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Vendor Comparison</h1>
          <p>Side-by-side weighted risk analysis · Select up to 4 vendors</p>
        </div>
      </div>

      {/* Vendor Selector */}
      <div className="vc-selector">
        {scoredVendors.map(v => (
          <button key={v.id} className={`vc-chip ${selectedIds.includes(v.id) ? 'active' : ''}`}
            onClick={() => toggleVendor(v.id)} disabled={!selectedIds.includes(v.id) && selectedIds.length >= 4}>
            <span className="vc-chip-dot" style={{ background: v.riskColor }}></span>
            {v.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <>
          {/* Score Cards */}
          <div className="vc-scores">
            {selected.map(v => (
              <div key={v.id} className="card vc-score-card">
                <span className="vc-score-name">{v.name}</span>
                <span className="vc-score-region">{v.region} · {v.tier}</span>
                <span className="vc-score-val font-mono" style={{ color: v.riskColor }}>{v.riskScore}</span>
                <span className={`badge ${v.riskBand.toLowerCase()}`}>{v.riskBand}</span>
              </div>
            ))}
          </div>

          {/* Parameter Comparison Table */}
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="card-header"><span className="card-title">Parameter-by-Parameter Comparison</span></div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    {selected.map(v => <th key={v.id}>{v.name.split(' ').slice(0,2).join(' ')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(parameterConfig).map(([key, cfg]) => {
                    const values = selected.map(v => v.contributions[key]?.normalized || 0);
                    const worst = Math.max(...values);
                    return (
                      <tr key={key}>
                        <td style={{ fontSize: 'var(--text-xs)' }}>{cfg.icon} {cfg.label}</td>
                        {selected.map((v, i) => {
                          const val = v.contributions[key]?.normalized || 0;
                          const isWorst = val === worst && values.filter(x => x === worst).length === 1;
                          return (
                            <td key={v.id}>
                              <div className="vc-param-cell">
                                <div className="vc-param-bar-bg">
                                  <div className="vc-param-bar" style={{
                                    width: `${val}%`,
                                    background: val >= 60 ? 'var(--color-danger)' : val >= 35 ? 'var(--color-warning)' : 'var(--color-success)'
                                  }}></div>
                                </div>
                                <span className={`vc-param-val font-mono ${isWorst ? 'worst' : ''}`}>{val}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border-default)' }}>
                    <td>Total Weighted Score</td>
                    {selected.map(v => (
                      <td key={v.id}>
                        <span className="font-mono" style={{ color: v.riskColor, fontWeight: 800, fontSize: 'var(--text-md)' }}>{v.riskScore}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
