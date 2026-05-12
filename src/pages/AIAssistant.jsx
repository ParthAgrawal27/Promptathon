import { useState } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import './AIAssistant.css';

const presetQueries = [
  'Why did Shenzhen Electronics become critical?',
  'Compare top 3 vendors by weighted risk',
  'Explain how geopolitical weight affects rankings',
  'What happens if I increase delivery weight to 30%?',
  'Summarize current active event impacts',
  'Recommend mitigation for high-risk vendors',
];

export default function AIAssistant() {
  const { scoredVendors, weights, activeEvents, stats } = useRiskEngine();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Welcome to the Procurement Decision Intelligence Assistant. I can explain scoring logic, summarize event impacts, recommend mitigation strategies, and compare vendor scenarios.\n\nCurrently monitoring ${stats.total} vendors with ${stats.critical} critical, ${stats.high} high risk. ${activeEvents.length} active disruption event${activeEvents.length !== 1 ? 's' : ''}.` },
  ]);
  const [input, setInput] = useState('');

  const generateResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('why') && q.includes('critical')) {
      const critical = scoredVendors.filter(v => v.riskBand === 'Critical');
      if (critical.length === 0) return 'No vendors are currently in critical status under the active weight configuration.';
      const v = critical[0];
      const topFactors = Object.entries(v.contributions).sort(([,a],[,b]) => b.contribution - a.contribution).slice(0, 3);
      return `**${v.name}** has a weighted risk score of **${v.riskScore}/100** (${v.riskBand}).\n\n**Top contributing factors:**\n${topFactors.map(([k, c]) => `• ${k.replace(/_/g, ' ')}: normalized ${c.normalized}/100 × weight ${c.weight}% = **${c.contribution.toFixed(1)} contribution**`).join('\n')}\n\n${activeEvents.length > 0 ? `⚡ Active disruptions are modifying raw parameters for ${v.region} region vendors.` : 'No active events affecting this vendor currently.'}\n\nThis score is calculated using rule-based heuristic logic, not opaque ML predictions.`;
    }
    if (q.includes('compare') || q.includes('top')) {
      const top3 = scoredVendors.slice(0, 3);
      return `**Top 3 Highest Risk Vendors:**\n\n${top3.map((v, i) => `${i + 1}. **${v.name}** — Score: ${v.riskScore} (${v.riskBand})\n   Region: ${v.region} | Tier: ${v.tier}`).join('\n\n')}\n\nRankings are dynamically computed using the current weight profile. Adjusting weights in the Weight Engine will reorder these instantly.`;
    }
    if (q.includes('weight') || q.includes('geopolitical')) {
      const topWeights = Object.entries(weights).sort(([,a],[,b]) => b - a).slice(0, 5);
      return `**Current Weight Configuration:**\n\n${topWeights.map(([k, v]) => `• ${k.replace(/_/g, ' ')}: **${v}%**`).join('\n')}\n\nGeopolitical Risk is currently weighted at **${weights.GPR_Score}%**. Increasing this value will escalate vendors in high-GPR regions (Asia Pacific, Middle East, Africa) while having minimal effect on North American and European vendors.\n\nTo modify weights, visit the **Weight Engine** page.`;
    }
    if (q.includes('event') || q.includes('disruption') || q.includes('impact')) {
      if (activeEvents.length === 0) return 'No active disruption events. Visit the **Global Events** page to inject scenarios and observe their impact on vendor risk scores.';
      return `**Active Disruptions (${activeEvents.length}):**\n\n${activeEvents.map(e => `• **${e.name}** (${e.severity}) — ${e.region}\n  Impacts: ${Object.entries(e.impacts).map(([p, m]) => `${p.replace(/_/g, ' ')} ${m > 1 ? '+' : ''}${Math.round((m - 1) * 100)}%`).join(', ')}`).join('\n\n')}\n\nThese events are modifying raw vendor parameters in real-time, causing ${stats.critical} vendors to reach critical status.`;
    }
    if (q.includes('mitigation') || q.includes('recommend')) {
      const critical = scoredVendors.filter(v => v.riskBand === 'Critical').slice(0, 3);
      return `**Mitigation Recommendations:**\n\n${critical.map(v => `• **${v.name}** (Score: ${v.riskScore})\n  → Diversify sourcing from ${v.region}\n  → Increase safety stock for ${v.category} materials\n  → Activate backup supplier agreements`).join('\n\n')}\n\n**General Strategies:**\n• Switch to Crisis Response weight profile for conservative scoring\n• Monitor Global Events dashboard for emerging disruptions\n• Run simulation scenarios in the Digital Twin lab`;
    }
    return `Based on the current analytical configuration:\n\n• **${stats.total} vendors** monitored across ${Object.keys(scoredVendors.reduce((a, v) => ({...a, [v.region]: true}), {})).length} regions\n• **${stats.critical} critical**, ${stats.high} high, ${stats.moderate} moderate, ${stats.low} low risk\n• **${activeEvents.length} active events** affecting calculations\n• Global Risk Index: **${stats.avg}/100**\n\nAsk me about specific vendors, weight configurations, event impacts, or mitigation strategies.`;
  };

  const handleSend = (text) => {
    const query = text || input;
    if (!query.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: generateResponse(query) }]);
    }, 400);
    setInput('');
  };

  return (
    <div className="ai-assistant animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Decision Intelligence Assistant</h1>
          <p>Procurement analytics · Scoring logic · Event impact analysis · Mitigation strategies</p>
        </div>
      </div>

      <div className="assistant-layout">
        <div className="card chat-panel">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                <div className="chat-avatar">{msg.role === 'assistant' ? '◇' : '◉'}</div>
                <div className="chat-text" dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
                }} />
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input type="text" className="chat-input" placeholder="Ask about risk scores, events, weights, vendors..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button className="btn btn-primary btn-sm" onClick={() => handleSend()}>Send</button>
          </div>
        </div>

        <div className="chat-sidebar">
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Queries</span></div>
            <div className="quick-queries">
              {presetQueries.map((q, i) => (
                <button key={i} className="quick-query-btn" onClick={() => handleSend(q)}>{q}</button>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginTop: 'var(--space-3)' }}>
            <div className="card-header"><span className="card-title">System Context</span></div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vendors</span><span className="font-mono">{stats.total}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Critical</span><span className="font-mono" style={{ color: 'var(--color-danger)' }}>{stats.critical}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Active Events</span><span className="font-mono">{activeEvents.length}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Risk Index</span><span className="font-mono">{stats.avg}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
