import { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';

const suggestedQueries = [
  'Why is Shenzhen Electronics at critical risk?',
  'Suggest alternative suppliers for Apex Manufacturing',
  'What is the predicted disruption timeline for Q2?',
  'Compare Nordic Supply Chain vs EuroComponents',
  'Show cascade impact if Dragon Steel fails',
];

const initialMessages = [
  {
    role: 'assistant',
    content: 'Hello! I\'m your VendorIQ AI Assistant. I can help you analyze vendor risks, explain predictions, suggest alternatives, and run scenario analyses. What would you like to know?',
    time: '11:20 AM',
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const responses = {
        'Why is Shenzhen Electronics at critical risk?': `**Shenzhen Electronics (Risk: 91/100)**\n\nThe critical risk assessment is driven by multiple converging factors:\n\n📊 **Top Contributing Factors:**\n• **Financial Health: 32%** — Liquidity ratio at 0.6x, well below the 1.0x safety threshold\n• **Delivery Reliability: 55%** — 45% of shipments delayed in Q1, the worst among Tier 1 suppliers\n• **Defect Rate: 5.7%** — Nearly 3x the acceptable threshold of 2%\n• **Geopolitical Risk** — Located in high-tension trade zone with active tariff disputes\n\n⚡ **Cascade Impact:** 12 downstream nodes affected. If Shenzhen fails, estimated $2.4M revenue impact within 30 days.\n\n💡 **Recommendation:** Activate contingency sourcing from Nordic Supply Chain (risk: 42) which can absorb 60% of Shenzhen's volume.`,

        'Suggest alternative suppliers for Apex Manufacturing': `**Alternative Supplier Analysis for Apex Manufacturing**\n\nBased on capability matching, capacity analysis, and risk profiling:\n\n🏆 **Top 3 Alternatives:**\n\n1. **Nordic Supply Chain** (Risk: 42)\n   - Delivery: 88% | Financial: 76% | ESG: A\n   - Capacity overlap: 60% | Lead time: +2 days\n   - ✅ Recommended — Best risk-reward ratio\n\n2. **EuroComponents GmbH** (Risk: 35)\n   - Delivery: 92% | Financial: 82% | ESG: A\n   - Capacity overlap: 40% | Lead time: +3 days\n   - ✅ Low risk, but limited capacity\n\n3. **TechFusion Inc.** (Risk: 19)\n   - Delivery: 97% | Financial: 94% | ESG: A+\n   - Capacity overlap: 30% | Lead time: +1 day\n   - ✅ Excellent metrics, premium pricing\n\n📈 Combined coverage: **130%** of Apex's volume. Switching cost estimated at $340K.`,

        default: `I've analyzed your query. Here's what I found:\n\n📊 Based on the current risk model (v3.2, 94% confidence), the vendor landscape shows **${Math.floor(Math.random() * 5 + 3)} vendors** requiring attention this week.\n\n**Key Insights:**\n• Supply chain health index is trending ${Math.random() > 0.5 ? 'downward' : 'stable'}\n• ${Math.floor(Math.random() * 3 + 1)} new risk factors detected in the last 24 hours\n• Model recommendation: Review high-dependency nodes in APAC region\n\nWould you like me to drill deeper into any of these areas?`,
      };

      const response = responses[msg] || responses.default;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setTyping(false);
    }, 1500);
  };

  return (
    <div className="ai-assistant animate-fade-in">
      <div className="page-header">
        <div>
          <h1>AI Assistant Workspace</h1>
          <p>Natural language risk analysis · Powered by GPT-4 + VendorIQ Risk Engine</p>
        </div>
      </div>

      <div className="assistant-layout">
        <div className="card chat-panel">
          <div className="chat-feed" ref={feedRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="chat-avatar">
                  {msg.role === 'assistant' ? (
                    <div className="ai-avatar">AI</div>
                  ) : (
                    <div className="user-avatar-sm">PK</div>
                  )}
                </div>
                <div className="chat-bubble">
                  <div className="chat-meta">
                    <span className="chat-sender">{msg.role === 'assistant' ? 'VendorIQ AI' : 'You'}</span>
                    <span className="chat-time">{msg.time}</span>
                  </div>
                  <div className="chat-text" dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                      .replace(/• /g, '&bull; ')
                  }} />
                </div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg assistant">
                <div className="chat-avatar"><div className="ai-avatar">AI</div></div>
                <div className="chat-bubble">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <div className="suggested-queries">
              {suggestedQueries.map((q, i) => (
                <button key={i} className="suggested-btn" onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about vendor risks, predictions, alternatives..."
                className="chat-input"
              />
              <button className="btn btn-primary" onClick={() => sendMessage()}>
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="assistant-sidebar">
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div className="quick-actions-list">
              {[
                { icon: '📊', label: 'Generate Risk Report' },
                { icon: '🔍', label: 'Analyze Vendor' },
                { icon: '🔄', label: 'Run Simulation' },
                { icon: '📋', label: 'Compare Vendors' },
                { icon: '⚠', label: 'Review Alerts' },
              ].map((action, i) => (
                <button key={i} className="quick-action-btn" onClick={() => sendMessage(action.label)}>
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Session Context</span></div>
            <div className="session-context">
              <div className="ctx-item"><span className="ctx-label">Model</span><span className="ctx-val">GPT-4 + Risk v3.2</span></div>
              <div className="ctx-item"><span className="ctx-label">Vendors</span><span className="ctx-val">5,000 active</span></div>
              <div className="ctx-item"><span className="ctx-label">Data Points</span><span className="ctx-val">150,000</span></div>
              <div className="ctx-item"><span className="ctx-label">Last Sync</span><span className="ctx-val">2 min ago</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
