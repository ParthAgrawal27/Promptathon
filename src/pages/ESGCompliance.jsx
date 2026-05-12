import { esgData } from '../data/mockData';
import './ESGCompliance.css';

export default function ESGCompliance() {
  const getGradeColor = (g) => {
    if (g.startsWith('A')) return 'var(--color-success)';
    if (g.startsWith('B')) return 'var(--color-primary)';
    if (g.startsWith('C')) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const avgCarbon = Math.round(esgData.reduce((a, d) => a + d.carbon, 0) / esgData.length);
  const avgLabor = Math.round(esgData.reduce((a, d) => a + d.labor, 0) / esgData.length);
  const compliant = esgData.filter(d => d.overall.startsWith('A') || d.overall.startsWith('B')).length;

  return (
    <div className="esg-compliance animate-fade-in">
      <div className="page-header">
        <div>
          <h1>ESG & Compliance Monitoring</h1>
          <p>Sustainability metrics, labor compliance, and regulatory tracking</p>
        </div>
        <button className="btn btn-primary btn-sm">Generate ESG Report</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="kpi-card success">
          <span className="kpi-label">Compliant Vendors</span>
          <span className="kpi-value" style={{ color: 'var(--color-success)' }}>{compliant}/{esgData.length}</span>
          <div className="progress-bar"><div className="fill" style={{ width: `${(compliant / esgData.length) * 100}%`, background: 'var(--color-success)' }}></div></div>
        </div>
        <div className="kpi-card warning">
          <span className="kpi-label">Avg Carbon Score</span>
          <span className="kpi-value" style={{ color: 'var(--color-warning)' }}>{avgCarbon}</span>
          <span className="kpi-trend down">Lower is better</span>
        </div>
        <div className="kpi-card info">
          <span className="kpi-label">Avg Labor Compliance</span>
          <span className="kpi-value" style={{ color: 'var(--color-primary)' }}>{avgLabor}%</span>
          <span className="kpi-trend up">+2.1% vs Q4</span>
        </div>
        <div className="kpi-card danger">
          <span className="kpi-label">Non-Compliant</span>
          <span className="kpi-value" style={{ color: 'var(--color-danger)' }}>{esgData.length - compliant}</span>
          <span className="kpi-trend down">Action required</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Vendor ESG Scorecard</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Overall Grade</th>
                <th>Carbon Footprint</th>
                <th>Labor Compliance</th>
                <th>Governance</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {esgData.map((row, i) => (
                <tr key={i}>
                  <td><span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{row.vendor}</span></td>
                  <td>
                    <span className="esg-grade" style={{ color: getGradeColor(row.overall), borderColor: getGradeColor(row.overall) }}>
                      {row.overall}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="fill" style={{ width: `${row.carbon}%`, background: row.carbon > 60 ? 'var(--color-danger)' : row.carbon > 30 ? 'var(--color-warning)' : 'var(--color-success)' }}></div>
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{row.carbon}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: row.labor >= 85 ? 'var(--color-success)' : row.labor >= 65 ? 'var(--color-warning)' : 'var(--color-danger)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {row.labor}%
                    </span>
                  </td>
                  <td>
                    <span style={{ color: row.governance >= 80 ? 'var(--color-success)' : row.governance >= 60 ? 'var(--color-warning)' : 'var(--color-danger)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {row.governance}%
                    </span>
                  </td>
                  <td>
                    <span style={{ color: row.trend === 'up' ? 'var(--color-success)' : row.trend === 'stable' ? 'var(--text-tertiary)' : 'var(--color-danger)' }}>
                      {row.trend === 'up' ? '↗ Improving' : row.trend === 'stable' ? '→ Stable' : '↘ Declining'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
