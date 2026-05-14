import { useState } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { auditLogs } from '../data/mockData';
import './SecurityAudit.css';

export default function SecurityAudit() {
  const { scoredVendors, activeEvents } = useRiskEngine();
  const [selectedVendorId, setSelectedVendorId] = useState('');

  const complianceRate = Math.round(scoredVendors.filter(v => v.params.Audit_Score >= 60).length / scoredVendors.length * 100);
  const avgAudit = Math.round(scoredVendors.reduce((a, v) => a + v.params.Audit_Score, 0) / scoredVendors.length);

  const getAuditLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: 'var(--color-success)' };
    if (score >= 80) return { level: 'Good', color: '#059669' };
    if (score >= 60) return { level: 'Acceptable', color: 'var(--color-warning)' };
    if (score >= 40) return { level: 'Poor', color: '#EA580C' };
    return { level: 'Critical', color: 'var(--color-danger)' };
  };

  const sortedVendors = [...scoredVendors].sort((a, b) => a.params.Audit_Score - b.params.Audit_Score);
  const selectedVendor = selectedVendorId ? scoredVendors.find(v => String(v.id) === selectedVendorId) : null;
  const selectedAuditInfo = selectedVendor ? getAuditLevel(selectedVendor.params.Audit_Score) : null;

  // Match vendor audit level with system audit logs
  const getMatchingLogs = (vendor) => {
    if (!vendor) return [];
    const level = getAuditLevel(vendor.params.Audit_Score);
    return auditLogs.filter(log => {
      if (level.level === 'Critical' || level.level === 'Poor') {
        return log.action === 'WEIGHT_UPDATE' || log.action === 'RISK_RECALC' || log.action === 'ALERT_TRIGGER' || log.status === 'warning';
      }
      return log.action === 'VIEW_VENDOR' || log.action === 'EXPORT_DATA' || log.status === 'success';
    }).slice(0, 5);
  };

  return (
    <div className="security-audit animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Security & Audit</h1>
          <p>Compliance tracking · Audit logs · System integrity · Access control</p>
        </div>
      </div>

      <div className="grid-4">
        <div className="kpi-card success">
          <span className="kpi-label">Compliance Rate</span>
          <span className="kpi-value font-mono" style={{ color: 'var(--color-success)' }}>{complianceRate}%</span>
          <div className="progress-bar"><div className="fill" style={{ width: `${complianceRate}%`, background: 'var(--color-success)' }}></div></div>
        </div>
        <div className="kpi-card info">
          <span className="kpi-label">Avg Audit Score</span>
          <span className="kpi-value font-mono" style={{ color: 'var(--color-primary)' }}>{avgAudit}</span>
        </div>
        <div className="kpi-card warning">
          <span className="kpi-label">Active Events</span>
          <span className="kpi-value font-mono" style={{ color: 'var(--color-warning)' }}>{activeEvents.length}</span>
        </div>
        <div className="kpi-card danger">
          <span className="kpi-label">Non-Compliant</span>
          <span className="kpi-value font-mono" style={{ color: 'var(--color-danger)' }}>
            {scoredVendors.filter(v => v.params.Audit_Score < 60).length}
          </span>
        </div>
      </div>

      <div className="sa-layout">
        {/* System Audit Log */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">System Audit Log</span>
            <span className="badge info">{auditLogs.length} entries</span>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>Status</th></tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td><span className="font-mono" style={{ fontSize: 'var(--text-xs)' }}>{log.timestamp}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{log.user}</td>
                    <td><span className="badge info" style={{ fontSize: '10px' }}>{log.action}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{log.resource}</td>
                    <td><span className={`badge ${log.status === 'success' ? 'low' : 'moderate'}`}>{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Audit Scores — Dropdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Vendor Audit Scores</span>
            <span className="badge info">{sortedVendors.length} vendors</span>
          </div>

          {/* Dropdown selector */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 500 }}
            >
              <option value="">Select a vendor to view audit details...</option>
              {sortedVendors.map(v => (
                <option key={v.id} value={String(v.id)}>
                  {v.name} — Score: {v.params.Audit_Score} ({v.params.Audit_Score >= 60 ? 'Pass' : 'Fail'})
                </option>
              ))}
            </select>
          </div>

          {/* Selected vendor details */}
          {selectedVendor && (
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${selectedAuditInfo.color}`, marginBottom: 'var(--space-3)', animation: 'fade-in 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{selectedVendor.name}</span>
                <span className={`badge ${selectedVendor.params.Audit_Score >= 60 ? 'low' : 'critical'}`}>{selectedVendor.params.Audit_Score >= 60 ? 'Pass' : 'Fail'}</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 'var(--space-2)' }}>
                <div className="fill" style={{
                  width: `${selectedVendor.params.Audit_Score}%`,
                  background: selectedVendor.params.Audit_Score >= 80 ? 'var(--color-success)' : selectedVendor.params.Audit_Score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
                }}></div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'block' }}>Audit Score</span>
                  <span className="font-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: selectedAuditInfo.color }}>{selectedVendor.params.Audit_Score}</span>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'block' }}>Audit Level</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: selectedAuditInfo.color }}>{selectedAuditInfo.level}</span>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'block' }}>Risk Band</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: selectedVendor.riskColor }}>{selectedVendor.riskBand}</span>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'block' }}>Region</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{selectedVendor.region}</span>
                </div>
              </div>

              {/* Matched Audit Logs */}
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Matched System Audit Logs
              </div>
              {getMatchingLogs(selectedVendor).map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-1) 0', borderBottom: '1px solid var(--border-default)', fontSize: 'var(--text-xs)' }}>
                  <span className="font-mono" style={{ color: 'var(--text-muted)', minWidth: 90 }}>{log.timestamp}</span>
                  <span className="badge info" style={{ fontSize: '9px' }}>{log.action}</span>
                  <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{log.resource}</span>
                  <span className={`badge ${log.status === 'success' ? 'low' : 'moderate'}`} style={{ fontSize: '9px' }}>{log.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Vendor list summary */}
          <div className="sa-vendor-list">
            {sortedVendors.slice(0, 20).map(v => (
              <div key={v.id} className="sa-vendor-row" onClick={() => setSelectedVendorId(String(v.id))} style={{ cursor: 'pointer' }}>
                <span className="sa-v-name">{v.name}</span>
                <div className="sa-v-bar-bg">
                  <div className="sa-v-bar" style={{
                    width: `${v.params.Audit_Score}%`,
                    background: v.params.Audit_Score >= 80 ? 'var(--color-success)' : v.params.Audit_Score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
                  }}></div>
                </div>
                <span className="sa-v-score font-mono">{v.params.Audit_Score}</span>
                <span className={`badge ${v.params.Audit_Score >= 60 ? 'low' : 'critical'}`} style={{ fontSize: '9px' }}>
                  {v.params.Audit_Score >= 60 ? 'Pass' : 'Fail'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
