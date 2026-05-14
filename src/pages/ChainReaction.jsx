import { useState, useCallback } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { networkNodes, networkEdges, getRiskColor } from '../data/mockData';
import { askLLM } from '../services/llmService';
import './ChainReaction.css';

export default function ChainReaction() {
  const { scoredVendors, activeEvents } = useRiskEngine();
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [llmExplanation, setLlmExplanation] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);

  const getNodeRisk = (node) => {
    if (node.id === 'you') return 0;
    const vendor = scoredVendors.find(v => v.id === node.vendorId);
    return vendor ? vendor.riskScore : 30;
  };
  const getColor = (risk) => getRiskColor(risk);

  const isConnected = (nodeId) => {
    if (!hoveredNode && !selectedNode) return true;
    const activeId = hoveredNode || selectedNode;
    if (nodeId === activeId) return true;
    return networkEdges.some(e => (e.from === activeId && e.to === nodeId) || (e.to === activeId && e.from === nodeId));
  };
  const isEdgeConnected = (edge) => {
    if (!hoveredNode && !selectedNode) return true;
    const activeId = hoveredNode || selectedNode;
    return edge.from === activeId || edge.to === activeId;
  };

  const activeNode = (selectedNode || hoveredNode) ? networkNodes.find(n => n.id === (selectedNode || hoveredNode)) : null;
  const activeVendor = activeNode?.vendorId ? scoredVendors.find(v => v.id === activeNode.vendorId) : null;

  // Build network context for LLM
  const buildNetworkContext = useCallback(() => {
    const criticalNodes = networkNodes.filter(n => getNodeRisk(n) >= 75);
    const highNodes = networkNodes.filter(n => { const r = getNodeRisk(n); return r >= 55 && r < 75; });
    const totalNodes = networkNodes.length;
    const totalEdges = networkEdges.length;

    let context = `SUPPLY CHAIN NETWORK OVERVIEW:\n`;
    context += `- Total Nodes: ${totalNodes}\n- Total Edges (dependencies): ${totalEdges}\n`;
    context += `- Critical Risk Nodes (≥75): ${criticalNodes.length}\n- High Risk Nodes (55-74): ${highNodes.length}\n`;
    context += `- Active Disruption Events: ${activeEvents.length}\n\n`;

    if (activeEvents.length > 0) {
      context += `ACTIVE DISRUPTIONS:\n`;
      activeEvents.forEach(e => { context += `- ${e.name} (${e.type}, ${e.severity}, Region: ${e.region})\n`; });
      context += `\n`;
    }

    context += `CRITICAL NODES DETAIL:\n`;
    criticalNodes.forEach(node => {
      const vendor = scoredVendors.find(v => v.id === node.vendorId);
      if (vendor) {
        const deps = networkEdges.filter(e => e.from === node.id || e.to === node.id).length;
        const downstream = networkEdges.filter(e => e.from === node.id).length;
        context += `- ${vendor.vendorId} (${vendor.name}): Score ${vendor.riskScore}, Region: ${vendor.region}, Dependencies: ${deps}, Downstream: ${downstream}\n`;
      }
    });

    context += `\nHIGH RISK NODES DETAIL:\n`;
    highNodes.forEach(node => {
      const vendor = scoredVendors.find(v => v.id === node.vendorId);
      if (vendor) {
        const deps = networkEdges.filter(e => e.from === node.id || e.to === node.id).length;
        context += `- ${vendor.vendorId} (${vendor.name}): Score ${vendor.riskScore}, Region: ${vendor.region}, Dependencies: ${deps}\n`;
      }
    });

    return context;
  }, [scoredVendors, activeEvents]);

  const handleExplain = useCallback(async () => {
    setLlmLoading(true);
    setLlmExplanation('');
    const context = buildNetworkContext();
    const question = 'Analyze the current supply chain network topology. Identify the most critical cascade risk paths — which nodes, if they fail, will cause the largest downstream disruption? Explain the propagation risk and recommend mitigation actions. Be specific with vendor IDs and risk scores.';
    const answer = await askLLM(context, question);
    setLlmExplanation(answer);
    setLlmLoading(false);
  }, [buildNetworkContext]);

  return (
    <div className="chain-reaction animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Supply Chain Risk Propagation</h1>
          <p>Interactive dependency graph · Cascade analysis · Click nodes to trace risk paths</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-primary btn-sm" onClick={handleExplain} disabled={llmLoading}>
            {llmLoading ? '⏳ Analyzing...' : '🤖 AI Explain Network'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedNode(null); setHoveredNode(null); }}>Reset View</button>
          {activeEvents.length > 0 && <span className="badge critical">⚡ {activeEvents.length} disruptions</span>}
        </div>
      </div>

      {/* ── AI Explanation Panel ── */}
      {(llmLoading || llmExplanation) && (
        <div className="card" style={{ marginBottom: 'var(--space-4)', borderLeft: '3px solid var(--color-primary)' }}>
          <div className="card-header">
            <span className="card-title">🤖 AI Network Analysis</span>
            <span className="badge info">Llama 3.1</span>
          </div>
          {llmLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              <div className="ai-spinner" style={{ width: 18, height: 18, border: '2px solid var(--border-default)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'ai-spin 0.8s linear infinite', flexShrink: 0 }}></div>
              <span>Analyzing supply chain topology and cascade risk paths...</span>
            </div>
          ) : (
            <div
              style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, padding: '0 var(--space-2)' }}
              dangerouslySetInnerHTML={{
                __html: llmExplanation
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
                  .replace(/• /g, '&bull; ')
              }}
            />
          )}
        </div>
      )}

      <div className="cr-layout">
        <div className="card cr-canvas-card">
          <svg viewBox="0 0 800 520" className="cr-svg">
            <defs>
              <radialGradient id="bgGrad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#F1F5F9" />
              </radialGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <rect width="800" height="520" fill="url(#bgGrad)" rx="8" />
            <g opacity="0.04">
              {Array.from({ length: 20 }, (_, i) => <line key={`gv-${i}`} x1={i*40} y1="0" x2={i*40} y2="520" stroke="#64748B" />)}
              {Array.from({ length: 13 }, (_, i) => <line key={`gh-${i}`} x1="0" y1={i*40} x2="800" y2={i*40} stroke="#64748B" />)}
            </g>
            {networkEdges.map((edge, i) => {
              const from = networkNodes.find(n => n.id === edge.from);
              const to = networkNodes.find(n => n.id === edge.to);
              const connected = isEdgeConnected(edge);
              const risk = getNodeRisk(from);
              return (
                <g key={i}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={connected ? getColor(risk) : '#CBD5E1'} strokeWidth={connected ? 2 : 0.5}
                    opacity={connected ? 0.6 : 0.15} strokeDasharray={edge.weight < 0.5 ? '4,4' : 'none'} />
                  {connected && (
                    <circle r="2" fill={getColor(risk)} opacity="0.9">
                      <animateMotion dur={`${3-edge.weight}s`} repeatCount="indefinite">
                        <mpath xlinkHref={`#crpath-${i}`} />
                      </animateMotion>
                    </circle>
                  )}
                  <path id={`crpath-${i}`} d={`M${from.x},${from.y} L${to.x},${to.y}`} fill="none" stroke="none" />
                </g>
              );
            })}
            {networkNodes.map(node => {
              const risk = getNodeRisk(node);
              const connected = isConnected(node.id);
              const isActive = node.id === selectedNode || node.id === hoveredNode;
              const color = node.id === 'you' ? '#2563EB' : getColor(risk);
              return (
                <g key={node.id} style={{ cursor: 'pointer', opacity: connected ? 1 : 0.2 }}
                  onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}>
                  {risk >= 70 && <circle cx={node.x} cy={node.y} r={node.size+8} fill="none" stroke={color} strokeWidth="1" opacity="0.3" className="cr-pulse-ring" />}
                  {isActive && <circle cx={node.x} cy={node.y} r={node.size+12} fill={`${color}15`} />}
                  <circle cx={node.x} cy={node.y} r={node.size} fill={`${color}20`} stroke={color} strokeWidth={isActive?3:1.5} filter={isActive?'url(#glow)':'none'} />
                  <circle cx={node.x} cy={node.y} r={Math.max(8,node.size-6)} fill="#FFFFFF" stroke="var(--border-default)" strokeWidth="0.5" />
                  <text x={node.x} y={node.y+3} textAnchor="middle" fill={color} fontSize={node.id==='you'?'11':'9'} fontWeight="700" fontFamily="Inter">
                    {node.id === 'you' ? '●' : risk}
                  </text>
                  <text x={node.x} y={node.y+node.size+14} textAnchor="middle" fill={connected?'var(--text-secondary)':'var(--text-muted)'} fontSize="10" fontWeight="500" fontFamily="Inter">{node.label}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="cr-info">
          {activeVendor ? (
            <div className="card animate-slide-in">
              <div className="card-header">
                <span className="card-title">{activeVendor.name}</span>
                <span className={`badge ${activeVendor.riskBand.toLowerCase()}`}>{activeVendor.riskBand}</span>
              </div>
              <div className="cr-node-details">
                <div className="cr-detail-row"><span>Risk Score</span><span style={{ color: activeVendor.riskColor, fontWeight: 700 }} className="font-mono">{activeVendor.riskScore}</span></div>
                <div className="cr-detail-row"><span>Dependencies</span><span>{networkEdges.filter(e => e.from === activeNode.id || e.to === activeNode.id).length}</span></div>
                <div className="cr-detail-row"><span>Downstream</span><span>{networkEdges.filter(e => e.from === activeNode.id).length} nodes</span></div>
                <div className="cr-detail-row"><span>Region</span><span>{activeVendor.region}</span></div>
              </div>
              <div className="divider"></div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                {activeVendor.riskScore >= 70
                  ? '⚠ Critical node — failure cascades to downstream dependencies within 48 hours.'
                  : 'Within acceptable thresholds. Monitor connected nodes for changes.'}
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="card-header"><span className="card-title">Network Summary</span></div>
              <div className="cr-summary">
                <div className="cr-sum-item"><span className="cr-sum-val" style={{color:'var(--color-danger)'}}>{networkNodes.filter(n => getNodeRisk(n) >= 70).length}</span><span className="cr-sum-label">Critical</span></div>
                <div className="cr-sum-item"><span className="cr-sum-val">{networkNodes.length}</span><span className="cr-sum-label">Nodes</span></div>
                <div className="cr-sum-item"><span className="cr-sum-val">{networkEdges.length}</span><span className="cr-sum-label">Edges</span></div>
              </div>
            </div>
          )}
          <div className="card">
            <div className="card-header"><span className="card-title">Legend</span></div>
            <div className="cr-legend">
              {[{color:'#DC2626',label:'Critical (≥75)'},{color:'#EA580C',label:'High (55-74)'},{color:'#D97706',label:'Moderate (35-54)'},{color:'#059669',label:'Healthy (<35)'}].map(item=>(
                <div key={item.label} className="cr-legend-item"><span className="cr-legend-dot" style={{background:item.color}}></span><span>{item.label}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
