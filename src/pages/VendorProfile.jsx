import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRiskEngine } from '../context/RiskEngine';
import { parameterConfig, getParamsByCategory } from '../data/mockData';
import { askLLM } from '../services/llmService';
import { buildVendorContext } from '../services/contextBuilder';
import './VendorProfile.css';

const QUICK_QUESTIONS = [
  'Why is this vendor high risk?',
  'Is it safe to place a large order?',
  'What corrective actions should we take?',
  'How does this vendor compare to a safe vendor?',
];

export default function VendorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scoredVendors, weights, activeEvents, loading } = useRiskEngine();

  // AI Advisor state — all hooks must be declared before any early return
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [autoLoaded, setAutoLoaded] = useState(false);

  // Derive vendor from scored list (safe even when loading)
  const vendor = useMemo(() => {
    if (loading || scoredVendors.length === 0) return null;
    return scoredVendors.find(v => v.id === parseInt(id)) || scoredVendors[0];
  }, [scoredVendors, id, loading]);

  const cacheKey = vendor ? `vendoriq_ai_${vendor.vendorId}` : '';

  // ── Auto-trigger for High/Critical vendors ────────────────────
  useEffect(() => {
    if (!vendor || autoLoaded) return;

    const isHighRisk = vendor.riskBand === 'High' || vendor.riskBand === 'Critical';
    if (!isHighRisk) { setAutoLoaded(true); return; }

    // Check cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { answer, ts } = JSON.parse(cached);
        // Cache valid for 1 hour
        if (Date.now() - ts < 3600000) {
          setAiResponse(answer);
          setAiQuestion('Auto-generated insight');
          setAutoLoaded(true);
          return;
        }
      }
    } catch (e) { /* ignore */ }

    setAutoLoaded(true);

    // Fire the auto-question
    const context = buildVendorContext(vendor, activeEvents);
    const question = 'Summarize why this vendor is high risk and what immediate procurement action should be taken';

    setAiLoading(true);
    setAiQuestion(question);
    askLLM(context, question).then(answer => {
      setAiResponse(answer);
      setAiLoading(false);
      try { localStorage.setItem(cacheKey, JSON.stringify({ answer, ts: Date.now() })); } catch (e) { /* quota */ }
    });
  }, [vendor?.vendorId, autoLoaded]);

  // Reset auto-load when vendor changes
  useEffect(() => {
    setAutoLoaded(false);
    setAiResponse('');
    setAiQuestion('');
  }, [id]);

  // ── AI Functions ──────────────────────────────────────────────
  const askQuestion = useCallback(async (question) => {
    if (!vendor) return;
    setAiLoading(true);
    setAiQuestion(question);
    setAiResponse('');

    const context = buildVendorContext(vendor, activeEvents);
    const answer = await askLLM(context, question);

    setAiResponse(answer);
    setAiLoading(false);
  }, [vendor, activeEvents]);

  const handleCustomAsk = useCallback(() => {
    if (customQuestion.trim()) {
      askQuestion(customQuestion.trim());
      setCustomQuestion('');
    }
  }, [customQuestion, askQuestion]);

  // ── Early returns (AFTER all hooks) ───────────────────────────
  if (loading) {
    return (
      <div className="vendor-profile animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading vendor data...</p>
        </div>
      </div>
    );
  }

  if (!vendor) return <div>Vendor not found</div>;

  const sortedContributions = Object.entries(vendor.contributions)
    .sort(([,a],[,b]) => b.contribution - a.contribution);
  const maxContrib = Math.max(...sortedContributions.map(([,c]) => c.contribution));

  const affectedByEvents = activeEvents.filter(e => e.region === 'Global' || e.region === vendor.region);

  const paramsByCategory = getParamsByCategory();

  return (
    <div className="vendor-profile animate-fade-in">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/vendors')} style={{ marginBottom: 'var(--space-2)' }}>← Back to Intelligence</button>
          <h1>{vendor.name}</h1>
          <p>{vendor.vendorId} · {vendor.region} · {vendor.country} · {vendor.tier} · {vendor.category} · {vendor.contractValue}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span className={`badge ${vendor.riskBand.toLowerCase()}`}>{vendor.riskBand}</span>
          <span className="font-mono" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: vendor.riskColor }}>{vendor.riskScore}</span>
        </div>
      </div>

      {affectedByEvents.length > 0 && (
        <div className="events-banner" style={{ marginBottom: 'var(--space-4)' }}>
          <span>⚡</span>
          <span style={{ fontSize: 'var(--text-sm)' }}><strong>{affectedByEvents.length} active event{affectedByEvents.length > 1 ? 's' : ''}</strong> affecting this vendor</span>
          {affectedByEvents.map(e => <span key={e.id} className="event-tag">{e.icon} {e.name}</span>)}
        </div>
      )}

      <div className="vp-layout">
        {/* Weighted Contribution Waterfall */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Weighted Risk Contribution</span>
            <span className="badge info">Analytical</span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
            Why this vendor received a score of {vendor.riskScore}/100 — based on current weight configuration.
          </p>
          <div className="vp-waterfall">
            {sortedContributions.map(([key, data]) => {
              const cfg = parameterConfig[key];
              const barWidth = (data.contribution / Math.max(maxContrib, 1)) * 100;
              const isHigh = data.normalized >= 60;
              return (
                <div key={key} className="vp-wf-row">
                  <span className="vp-wf-label">{cfg?.icon} {cfg?.label}</span>
                  <div className="vp-wf-bar-area">
                    <div className={`vp-wf-bar ${isHigh ? 'high' : 'low'}`} style={{ width: `${barWidth}%` }}>
                      <span className="vp-wf-bar-pct">{data.contribution.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="vp-wf-weight font-mono">{data.weight}%</span>
                  <span className={`vp-wf-norm font-mono ${data.normalized >= 60 ? 'bad' : 'good'}`}>{data.normalized}</span>
                </div>
              );
            })}
            <div className="vp-wf-total">
              <span>Total Weighted Score</span>
              <span className="font-mono" style={{ color: vendor.riskColor, fontWeight: 800 }}>{vendor.riskScore}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="vp-right">
          {/* All Parameters by Category */}
          {Object.entries(paramsByCategory).map(([category, params]) => (
            <div key={category} className="card">
              <div className="card-header"><span className="card-title">{category}</span></div>
              <div className="vp-params">
                {params.map(({ key, label, icon, unit }) => {
                  const val = vendor.params[key];
                  if (val === undefined) return null;
                  const modified = vendor.modifiedParams?.[key];
                  const changed = modified !== undefined && Math.abs(modified - val) > 0.1;
                  const displayVal = typeof modified === 'number' ? (Number.isInteger(modified) ? modified : modified.toFixed(2)) : (typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val);
                  return (
                    <div key={key} className="vp-param-row">
                      <span className="vp-param-label">{icon} {label}</span>
                      <span className="vp-param-val font-mono">
                        {displayVal}
                        {unit && <small> {unit}</small>}
                      </span>
                      {changed && <span className="vp-param-delta bad">modified</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Decision Reasoning */}
          <div className="card">
            <div className="card-header"><span className="card-title">Decision Reasoning</span></div>
            <div className="vp-reasoning">
              {vendor.riskScore >= 75 && <div className="vp-reason critical">⚠ Critical risk — immediate review required. Multiple parameters exceed thresholds.</div>}
              {vendor.riskScore >= 55 && vendor.riskScore < 75 && <div className="vp-reason high">⚡ Elevated risk — close monitoring recommended. Key parameters trending negative.</div>}
              {vendor.contributions.GPR_Score?.normalized >= 60 && <div className="vp-reason warning">🌍 Geopolitical exposure is significant at {vendor.contributions.GPR_Score.normalized}/100 normalized risk.</div>}
              {vendor.contributions.OnTime_Delivery?.normalized >= 50 && <div className="vp-reason warning">📦 Delivery reliability below expectations — {vendor.params.OnTime_Delivery?.toFixed(1)}% on-time rate.</div>}
              {vendor.contributions.Financial_Stability?.normalized >= 50 && <div className="vp-reason warning">💰 Financial stability concern — score of {vendor.params.Financial_Stability?.toFixed(0)}/100.</div>}
              {vendor.params.Defect_Rate_PPM > 1500 && <div className="vp-reason warning">🔍 Defect rate elevated at {vendor.params.Defect_Rate_PPM?.toFixed(0)} PPM — exceeds 1500 PPM threshold.</div>}
              {vendor.params.ESG_Score && vendor.params.ESG_Score < 60 && <div className="vp-reason warning">🌿 ESG score below threshold at {vendor.params.ESG_Score?.toFixed(0)}/100.</div>}
              {affectedByEvents.length > 0 && <div className="vp-reason critical">⚡ Active disruptions modifying raw parameters for this region.</div>}
              {vendor.riskScore < 35 && <div className="vp-reason success">✅ Vendor within acceptable risk thresholds across all weighted parameters.</div>}
            </div>
          </div>

          {/* ═══ AI Procurement Advisor Card ═══ */}
          <div className="card ai-advisor-card">
            <div className="card-header">
              <span className="card-title">
                <span className="ai-advisor-icon">🤖</span> AI Procurement Advisor
              </span>
              <span className="badge info">Llama 3.1</span>
            </div>

            {/* Quick question buttons */}
            <div className="ai-quick-questions">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  className="ai-quick-btn"
                  onClick={() => askQuestion(q)}
                  disabled={aiLoading}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="ai-input-row">
              <input
                type="text"
                className="ai-input"
                placeholder="Ask about this vendor's risk..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomAsk()}
                disabled={aiLoading}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCustomAsk}
                disabled={aiLoading || !customQuestion.trim()}
              >
                Ask
              </button>
            </div>

            {/* Loading state */}
            {aiLoading && (
              <div className="ai-loading">
                <div className="ai-spinner"></div>
                <span>Analyzing vendor risk data...</span>
              </div>
            )}

            {/* Response display */}
            {aiResponse && !aiLoading && (
              <div className="ai-response-card">
                <div className="ai-response-header">
                  <span className="ai-response-label">🤖 AI Analysis</span>
                  {aiQuestion && <span className="ai-response-q">{aiQuestion}</span>}
                </div>
                <div
                  className="ai-response-text"
                  dangerouslySetInnerHTML={{
                    __html: aiResponse
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                      .replace(/• /g, '&bull; ')
                  }}
                />
              </div>
            )}

            {/* Empty state */}
            {!aiResponse && !aiLoading && (
              <div className="ai-empty-state">
                <p>Ask a question or click a quick action above to get AI-powered procurement insights for this vendor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
