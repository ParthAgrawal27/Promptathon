import { useRiskEngine } from '../context/RiskEngine';
import { auditLogs } from '../data/mockData';
import './SecurityAudit.css';

export default function SecurityAudit() {
  const { scoredVendors, activeEvents, stats } = useRiskEngine();

  const complianceRate = Math.round(scoredVendors.filter(v => v.params.Audit_Score >= 60).length / scoredVendors.length * 100);
  const avgAudit = Math.round(scoredVendors.reduce((a, v) => a + v.params.Audit_Score, 0) / scoredVendors.length);

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
        {/* Audit Log */}
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

        {/* Vendor Compliance */}
        <div className="card">
          <div className="card-header"><span className="card-title">Vendor Audit Scores</span></div>
          <div className="sa-vendor-list">
            {scoredVendors.sort((a, b) => a.params.Audit_Score - b.params.Audit_Score).map(v => (
              <div key={v.id} className="sa-vendor-row">
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
