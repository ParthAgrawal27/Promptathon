import { useState, useMemo } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { calcVendorScore, getRiskColor, eventCatalog } from '../data/mockData';
import './SimulationLab.css';

const flowNodes = [
  { id: 'raw', label: 'Raw Materials', x: 80, y: 260 },
  { id: 'supA', label: 'Supplier A', x: 280, y: 130 },
  { id: 'supB', label: 'Supplier B', x: 280, y: 390 },
  { id: 'mfg', label: 'Manufacturing', x: 480, y: 260 },
  { id: 'dist', label: 'Distribution', x: 650, y: 260 },
  { id: 'cust', label: 'Customer', x: 800, y: 260 },
];
const flowEdges = [
  { from: 'raw', to: 'supA' }, { from: 'raw', to: 'supB' },
  { from: 'supA', to: 'mfg' }, { from: 'supB', to: 'mfg' },
  { from: 'mfg', to: 'dist' }, { from: 'dist', to: 'cust' },
];

export default function SimulationLab() {
  const { weights, activeEvents, scoredVendors, loading } = useRiskEngine();
  const [simEvents, setSimEvents] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Use a subset (top 100 by risk) for simulation performance
  const vendorSubset = useMemo(() => scoredVendors.slice(0, 100), [scoredVendors]);

  const allSimEvents = [...activeEvents, ...simEvents.filter(se => !activeEvents.find(ae => ae.id === se.id))];

  // Simulate vendor scores with current weights + sim events
  const simVendors = useMemo(() => {
    return vendorSubset.map(v => {
      const { score } = calcVendorScore(v, weights, allSimEvents);
      return { ...v, simScore: score, simColor: getRiskColor(score) };
    }).sort((a, b) => b.simScore - a.simScore);
  }, [vendorSubset, weights, allSimEvents]);

  const baseVendors = useMemo(() => {
    return vendorSubset.map(v => {
      const { score } = calcVendorScore(v, weights, []);
      return { ...v, baseScore: score };
    });
  }, [vendorSubset, weights]);

  const avgSim = simVendors.length ? Math.round(simVendors.reduce((a, v) => a + v.simScore, 0) / simVendors.length) : 0;
  const avgBase = baseVendors.length ? Math.round(baseVendors.reduce((a, v) => a + v.baseScore, 0) / baseVendors.length) : 0;
  const delta = avgSim - avgBase;

  const toggleSimEvent = (evt) => {
    if (simEvents.find(e => e.id === evt.id)) setSimEvents(prev => prev.filter(e => e.id !== evt.id));
    else setSimEvents(prev => [...prev, evt]);
  };

  // Assign risk to flow nodes based on sim scores
  const nodeRisk = (nodeId) => {
    if (nodeId === 'raw') return simVendors.find(v => v.category === 'Raw Materials')?.simScore || 30;
    if (nodeId === 'supA') return simVendors[0]?.simScore || 50;
    if (nodeId === 'supB') return simVendors[1]?.simScore || 40;
    if (nodeId === 'mfg') return Math.round(avgSim * 0.8);
    if (nodeId === 'dist') return Math.round(avgSim * 0.5);
    return Math.round(avgSim * 0.3);
  };

  return (
    <div className="sim-lab animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Digital Twin Simulation Lab</h1>
          <p>Scenario-based intelligence · Inject disruptions · Compare outcomes in real time</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <span className={`badge ${delta > 5 ? 'critical' : delta > 0 ? 'moderate' : 'low'}`}>
            Impact: {delta > 0 ? '+' : ''}{delta} pts
          </span>
        </div>
      </div>

      <div className="sim-layout">
        {/* Controls */}
        <div className="card sim-controls">
          <div className="card-header"><span className="card-title">Scenario Injection</span></div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
            Toggle disruption events to simulate their impact on the supply chain.
          </p>
          <div className="sim-scenarios">
            {eventCatalog.map(evt => {
              const isActive = allSimEvents.find(e => e.id === evt.id);
              return (
                <button key={evt.id} className={`sim-scenario-btn ${isActive ? 'active' : ''}`}
                  onClick={() => toggleSimEvent(evt)}>
                  <span>{evt.icon}</span>
                  <span className="sim-scenario-name">{evt.name}</span>
                  <span className={`badge ${evt.severity}`} style={{ fontSize: '9px' }}>{evt.severity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="card sim-flow-card">
          <div className="card-header">
            <span className="card-title">Supply Chain Flow · Live</span>
            <span className={`badge ${delta > 10 ? 'critical' : 'info'}`}>Impact: {delta > 0 ? '+' : ''}{delta}%</span>
          </div>
          <svg viewBox="0 0 900 520" className="sim-svg">
            <rect width="900" height="520" fill="#F8FAFC" rx="8" />
            {/* Edges */}
            {flowEdges.map((edge, i) => {
              const from = flowNodes.find(n => n.id === edge.from);
              const to = flowNodes.find(n => n.id === edge.to);
              const risk = nodeRisk(from.id);
              return (
                <g key={i}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={getRiskColor(risk)} strokeWidth="2" opacity="0.4" />
                  <circle r="3" fill={getRiskColor(risk)} opacity="0.8">
                    <animateMotion dur={`${2.5 - risk / 100}s`} repeatCount="indefinite">
                      <mpath xlinkHref={`#sim-path-${i}`} />
                    </animateMotion>
                  </circle>
                  <path id={`sim-path-${i}`} d={`M${from.x},${from.y} L${to.x},${to.y}`} fill="none" />
                </g>
              );
            })}
            {/* Nodes */}
            {flowNodes.map(node => {
              const risk = nodeRisk(node.id);
              const color = getRiskColor(risk);
              return (
                <g key={node.id}>
                  {risk >= 65 && <circle cx={node.x} cy={node.y} r="34" fill="none" stroke={color} strokeWidth="1" opacity="0.3" className="flow-node pulse" />}
                  <circle cx={node.x} cy={node.y} r="28" fill={`${color}20`} stroke={color} strokeWidth="2" />
                  <circle cx={node.x} cy={node.y} r="22" fill="#FFFFFF" stroke="var(--border-default)" strokeWidth="1" />
                  <text x={node.x} y={node.y - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600" fontFamily="Inter">{Math.round(risk)}</text>
                  <text x={node.x} y={node.y + 8} textAnchor="middle" fill={color} fontSize="7" fontFamily="Inter">risk</text>
                  <text x={node.x} y={node.y + 44} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="500" fontFamily="Inter">{node.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* KPI Results */}
      <div className="grid-4" style={{ marginTop: 'var(--space-4)' }}>
        <div className="kpi-card danger">
          <span className="kpi-label">Projected Risk Score</span>
          <span className="kpi-value font-mono" style={{ color: 'var(--color-danger)' }}>{avgSim}</span>
          <div className="progress-bar"><div className="fill" style={{ width: `${avgSim}%`, background: 'var(--color-danger)' }}></div></div>
        </div>
        <div className="kpi-card info">
          <span className="kpi-label">Baseline Score</span>
          <span className="kpi-value font-mono" style={{ color: 'var(--color-primary)' }}>{avgBase}</span>
          <div className="progress-bar"><div className="fill" style={{ width: `${avgBase}%`, background: 'var(--color-primary)' }}></div></div>
        </div>
        <div className="kpi-card warning">
          <span className="kpi-label">Active Scenarios</span>
          <span className="kpi-value font-mono" style={{ color: 'var(--color-warning)' }}>{allSimEvents.length}</span>
        </div>
        <div className="kpi-card success">
          <span className="kpi-label">Cost Impact</span>
          <span className="kpi-value font-mono" style={{ color: delta > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            ${(delta * 12.5).toFixed(0)}K
          </span>
          <span className="kpi-trend neutral">Per disruption event</span>
        </div>
      </div>
    </div>
  );
}
