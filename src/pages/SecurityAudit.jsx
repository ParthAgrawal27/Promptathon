import { auditLogs } from '../data/mockData';
import './SecurityAudit.css';

export default function SecurityAudit() {
  return (
    <div className="security-audit animate-fade-in">
      <div className="page-header">
        <div>
          <h1>System Security & Audit Logs</h1>
          <p>Security operations center · Real-time monitoring & compliance audit trail</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-ghost btn-sm">Export Logs</button>
          <button className="btn btn-primary btn-sm">Security Scan</button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="kpi-card success">
          <span className="kpi-label">System Status</span>
          <span className="kpi-value" style={{ color: 'var(--color-success)', fontSize: 'var(--text-xl)' }}>● Operational</span>
          <span className="kpi-trend up">99.97% uptime</span>
        </div>
        <div className="kpi-card info">
          <span className="kpi-label">API Calls (24h)</span>
          <span className="kpi-value" style={{ color: 'var(--color-primary)' }}>12.4K</span>
          <span className="kpi-trend up">Within rate limits</span>
        </div>
        <div className="kpi-card warning">
          <span className="kpi-label">Guardrail Triggers</span>
          <span className="kpi-value" style={{ color: 'var(--color-warning)' }}>2</span>
          <span className="kpi-trend neutral">Last 24 hours</span>
        </div>
        <div className="kpi-card danger">
          <span className="kpi-label">Failed Logins</span>
          <span className="kpi-value" style={{ color: 'var(--color-danger)' }}>1</span>
          <span className="kpi-trend neutral">Blocked automatically</span>
        </div>
      </div>

      <div className="sec-grid">
        {/* Audit Log */}
        <div className="card sec-log-card">
          <div className="card-header">
            <span className="card-title">Audit Trail</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Live feed</span>
          </div>
          <div className="audit-log">
            {auditLogs.map((log) => (
              <div key={log.id} className={`log-entry ${log.status}`}>
                <div className="log-status-dot"></div>
                <span className="log-time font-mono">{log.timestamp}</span>
                <span className="log-user">{log.user}</span>
                <span className="log-action">{log.action}</span>
                <span className="log-resource">{log.resource}</span>
                <span className={`badge ${log.status === 'success' ? 'low' : log.status === 'warning' ? 'moderate' : 'critical'}`}>
                  {log.status}
                </span>
                <span className="log-ip font-mono">{log.ip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Metrics */}
        <div className="sec-sidebar">
          <div className="card">
            <div className="card-header"><span className="card-title">Token Usage</span></div>
            <div className="token-meter">
              <div className="token-ring">
                <svg viewBox="0 0 100 100" width="100" height="100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-default)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary)" strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * 0.32}
                    transform="rotate(-90 50 50)" strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.4))' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-primary)' }}>68%</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>USED</div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                680K / 1M tokens this billing cycle
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Active Sessions</span></div>
            <div className="sessions-list">
              {[
                { user: 'admin@vendoriq.com', device: 'Chrome / Windows', status: 'active' },
                { user: 'analyst@vendoriq.com', device: 'Firefox / macOS', status: 'active' },
                { user: 'system', device: 'API Client', status: 'active' },
              ].map((s, i) => (
                <div key={i} className="session-item">
                  <div className="session-dot active"></div>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{s.user}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.device}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Network Status</span></div>
            <div className="net-status">
              {[
                { name: 'Risk Engine API', status: 'healthy', latency: '12ms' },
                { name: 'Data Pipeline', status: 'healthy', latency: '45ms' },
                { name: 'ML Inference', status: 'healthy', latency: '120ms' },
                { name: 'External Feeds', status: 'degraded', latency: '890ms' },
              ].map((s, i) => (
                <div key={i} className="net-item">
                  <span className={`net-dot ${s.status}`}></span>
                  <span className="net-name">{s.name}</span>
                  <span className="net-latency font-mono">{s.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
