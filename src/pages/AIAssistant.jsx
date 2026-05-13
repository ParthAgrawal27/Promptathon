import { useState, useRef, useEffect } from 'react';
import { useRiskEngine } from '../context/RiskEngine';
import { askLLM } from '../services/llmService';
import { buildVendorContext } from '../services/contextBuilder';
import './AIAssistant.css';

const QUICK_QUESTIONS = [
  { icon: '🔴', text: 'Who are the top 3 highest risk vendors?' },
  { icon: '⚠', text: 'Which vendors need immediate action?' },
  { icon: '📊', text: "Explain this vendor's biggest risk driver" },
  { icon: '📦', text: 'Should I place an order with this vendor this month?' },
  { icon: '💡', text: "What would improve this vendor's score the most?" },
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hello! I'm your **VendorIQ AI Assistant**, powered by Llama 3.1. I can help you analyze vendor risks, explain risk scores, and provide procurement recommendations.\n\n**To get started:**\n1. Select a vendor from the dropdown above\n2. Ask me anything about their risk profile\n3. Or use the quick questions below\n\nI only discuss vendor risk analysis — all insights are grounded in your actual data.",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export default function AIAssistant() {
  const { scoredVendors, activeEvents, loading, stats } = useRiskEngine();
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Get selected vendor object
  const selectedVendor = scoredVendors.find(v => v.id === selectedVendorId) || null;

  // Build vendor context whenever vendor changes
  const vendorContext = selectedVendor
    ? buildVendorContext(selectedVendor, activeEvents)
    : '';

  // Build conversation history for multi-turn (exclude initial greeting)
  const conversationHistory = messages
    .filter(m => m !== INITIAL_MESSAGE)
    .map(m => ({ role: m.role, content: m.content }));

  // ── Send message ──────────────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const userMessage = {
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Build context — if no vendor selected but question is about "top" vendors, include a summary
    let context = vendorContext;
    if (!selectedVendor && scoredVendors.length > 0) {
      // Provide top 10 vendor summary for general questions
      const top10 = scoredVendors.slice(0, 10);
      context = 'VENDOR PORTFOLIO SUMMARY:\n' +
        `Total vendors: ${scoredVendors.length}\n` +
        `Critical: ${stats.critical} | High: ${stats.high} | Moderate: ${stats.moderate} | Low: ${stats.low}\n` +
        `Average risk score: ${stats.avg}/100\n\n` +
        'TOP 10 HIGHEST RISK VENDORS:\n' +
        top10.map((v, i) => `${i + 1}. ${v.vendorId} — Score: ${v.riskScore}/100, Band: ${v.riskBand}, Region: ${v.region}, Category: ${v.category}`).join('\n');
    }

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: msg },
    ];

    // Remove the latest user message from history since askLLM appends it
    const historyForLLM = updatedHistory.slice(0, -1);

    const response = await askLLM(context, msg, historyForLLM);

    const aiMessage = {
      role: 'assistant',
      content: response,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  // ── Clear chat ────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    setIsTyping(false);
  };

  // ── Handle vendor selection ───────────────────────────────────
  const handleVendorSelect = (e) => {
    const id = Number(e.target.value);
    setSelectedVendorId(id || null);

    if (id) {
      const vendor = scoredVendors.find(v => v.id === id);
      if (vendor) {
        const sysMsg = {
          role: 'assistant',
          content: `📋 Loaded context for **${vendor.vendorId}** — Risk Score: **${vendor.riskScore}/100** (${vendor.riskBand})\n\nRegion: ${vendor.region} · ${vendor.country} · ${vendor.tier} · ${vendor.category}\n\nYou can now ask me anything about this vendor's risk profile.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, sysMsg]);
      }
    }
  };

  if (loading) {
    return (
      <div className="ai-assistant animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading vendor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-assistant animate-fade-in">
      <div className="page-header">
        <div>
          <h1>AI Risk Analyst</h1>
          <p>Vendor risk analysis powered by Llama 3.1 · {scoredVendors.length} vendors loaded</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>🗑 Clear Chat</button>
        </div>
      </div>

      <div className="assistant-layout">
        <div className="card chat-panel">
          {/* Vendor Selector */}
          <div className="chat-vendor-selector">
            <label>Select Vendor Context</label>
            <select
              value={selectedVendorId || ''}
              onChange={handleVendorSelect}
            >
              <option value="">— No specific vendor (general questions) —</option>
              {scoredVendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vendorId} — {v.name} ({v.riskBand}, {v.riskScore})
                </option>
              ))}
            </select>
          </div>

          {/* Chat Feed */}
          <div className="chat-feed" ref={feedRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="chat-avatar">
                  {msg.role === 'assistant' ? (
                    <div className="ai-avatar">AI</div>
                  ) : (
                    <div className="user-avatar-sm">You</div>
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
            {isTyping && (
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

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="suggested-queries">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  className="suggested-btn"
                  onClick={() => sendMessage(q.text)}
                  disabled={isTyping}
                >
                  {q.icon} {q.text}
                </button>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
                placeholder={selectedVendor
                  ? `Ask about ${selectedVendor.vendorId} risk profile...`
                  : 'Ask about vendor risks, recommendations...'
                }
                className="chat-input"
                disabled={isTyping}
              />
              <button
                className="btn btn-primary"
                onClick={() => sendMessage()}
                disabled={isTyping || !input.trim()}
              >
                {isTyping ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        <div className="assistant-sidebar">
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div className="quick-actions-list">
              {[
                { icon: '📊', label: 'Analyze Selected Vendor' },
                { icon: '🔍', label: 'Find Riskiest Vendors' },
                { icon: '🛡', label: 'Get Mitigation Plan' },
                { icon: '📋', label: 'Compliance Review' },
                { icon: '⚠', label: 'Review Active Alerts' },
              ].map((action, i) => (
                <button key={i} className="quick-action-btn" onClick={() => sendMessage(action.label)} disabled={isTyping}>
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Session Context</span></div>
            <div className="session-context">
              <div className="ctx-item"><span className="ctx-label">Model</span><span className="ctx-val">Llama 3.1 8B</span></div>
              <div className="ctx-item"><span className="ctx-label">Provider</span><span className="ctx-val">Groq</span></div>
              <div className="ctx-item"><span className="ctx-label">Vendors</span><span className="ctx-val">{scoredVendors.length.toLocaleString()} loaded</span></div>
              <div className="ctx-item"><span className="ctx-label">Active Events</span><span className="ctx-val">{activeEvents.length}</span></div>
              <div className="ctx-item">
                <span className="ctx-label">Selected</span>
                <span className="ctx-val">{selectedVendor ? selectedVendor.vendorId : 'None'}</span>
              </div>
              <div className="ctx-item"><span className="ctx-label">Messages</span><span className="ctx-val">{messages.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
