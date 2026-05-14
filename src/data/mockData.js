/* ═══════════════════════════════════════════════════════════════════
   VendorIQ – Analytical Intelligence Data Layer
   Expanded to 25 parameters from 5,000-vendor CSV dataset
   Raw vendor parameters · Event catalog · Risk frameworks
   ═══════════════════════════════════════════════════════════════════ */

// ── Parameter Configuration (25 params, 6 categories) ───────────
export const parameterConfig = {
  // === Operations ===
  OnTime_Delivery:       { label: 'On-Time Delivery',      unit: '%',    invert: true,  min: 40,  max: 100,   icon: '📦', category: 'Operations' },
  Avg_Lead_Time:         { label: 'Avg Lead Time',          unit: 'days', invert: false, min: 1,   max: 45,    icon: '⏱',  category: 'Operations' },
  Lead_Time_Variability: { label: 'Lead Time Variability',  unit: 'σ',    invert: false, min: 0,   max: 10,    icon: '📊', category: 'Operations' },
  Emergency_Fulfillment: { label: 'Emergency Fulfillment',  unit: '%',    invert: true,  min: 20,  max: 100,   icon: '🚨', category: 'Operations' },
  Avg_Days_Late:         { label: 'Avg Days Late',          unit: 'days', invert: false, min: 0,   max: 10,    icon: '📅', category: 'Operations' },

  // === Quality ===
  Defect_Rate_PPM:       { label: 'Defect Rate (PPM)',      unit: 'PPM',  invert: false, min: 0,   max: 2000,  icon: '🔍', category: 'Quality' },
  Field_Failure_Rate:    { label: 'Field Failure Rate',     unit: '%',    invert: false, min: 0,   max: 5,     icon: '⚠',  category: 'Quality' },
  Warranty_Claims:       { label: 'Warranty Claims',        unit: '/yr',  invert: false, min: 0,   max: 3,     icon: '🛡',  category: 'Quality' },
  Inspection_Pass_Rate:  { label: 'Inspection Pass Rate',   unit: '%',    invert: true,  min: 50,  max: 100,   icon: '✅', category: 'Quality' },
  Certification_Score:   { label: 'Certification Score',    unit: '/100', invert: true,  min: 0,   max: 100,   icon: '🏅', category: 'Quality' },

  // === Financial ===
  Financial_Stability:   { label: 'Financial Stability',    unit: '/100', invert: true,  min: 0,   max: 100,   icon: '💰', category: 'Financial' },
  Revenue_Trend:         { label: 'Revenue Trend',          unit: '%',    invert: true,  min: -10, max: 10,    icon: '📈', category: 'Financial' },
  Debt_Equity:           { label: 'Debt-to-Equity Ratio',   unit: 'x',    invert: false, min: 0,   max: 3,     icon: '💳', category: 'Financial' },
  DPO:                   { label: 'Days Payable Outstanding',unit: 'days', invert: false, min: 10,  max: 90,    icon: '🏦', category: 'Financial' },

  // === Logistics ===
  Shipment_Accuracy:     { label: 'Shipment Accuracy',      unit: '%',    invert: true,  min: 60,  max: 100,   icon: '🎯', category: 'Logistics' },
  Carrier_Dependency:    { label: 'Carrier Dependency',     unit: '%',    invert: false, min: 0,   max: 100,   icon: '🚛', category: 'Logistics' },

  // === Geopolitical ===
  GPR_Score:             { label: 'Geopolitical Risk',      unit: '/100', invert: false, min: 0,   max: 100,   icon: '🌍', category: 'Geopolitical' },
  Tariff_Exposure:       { label: 'Tariff Exposure',        unit: '%',    invert: false, min: 0,   max: 100,   icon: '📜', category: 'Geopolitical' },
  Disaster_Risk:         { label: 'Disaster Risk',          unit: '/100', invert: false, min: 0,   max: 100,   icon: '🌋', category: 'Geopolitical' },
  Single_Source:         { label: 'Single Source Risk',     unit: '',     invert: false, min: 0,   max: 1,     icon: '⚡', category: 'Geopolitical' },
  Tier2_Visibility:      { label: 'Tier-2 Visibility',      unit: '/10',  invert: true,  min: 0,   max: 10,    icon: '👁',  category: 'Geopolitical' },

  // === ESG & Compliance ===
  Audit_Score:           { label: 'Audit Score',            unit: '/100', invert: true,  min: 0,   max: 100,   icon: '📋', category: 'ESG & Compliance' },
  Carbon_Score:          { label: 'Carbon Score',           unit: '/100', invert: true,  min: 0,   max: 100,   icon: '🌱', category: 'ESG & Compliance' },
  Labor_Compliance:      { label: 'Labor Compliance',       unit: '/100', invert: true,  min: 0,   max: 100,   icon: '👷', category: 'ESG & Compliance' },
  ESG_Score:             { label: 'ESG Score',              unit: '/100', invert: true,  min: 0,   max: 100,   icon: '🌿', category: 'ESG & Compliance' },
};

// ── Scored Weight Keys (the 10 primary params used in the weighted scoring) ──
// We keep scoring to a focused set of 10 params for clarity; the rest are displayed as context.
export const scoredParamKeys = [
  'OnTime_Delivery', 'Defect_Rate_PPM', 'Field_Failure_Rate',
  'Financial_Stability', 'Inspection_Pass_Rate', 'Avg_Lead_Time',
  'Shipment_Accuracy', 'Audit_Score', 'Capacity_Utilization', 'GPR_Score',
];

// All param keys for display (25)
export const allParamKeys = Object.keys(parameterConfig);

// ── Default Weights (sum to 100, for the 10 scored params) ──────
export const defaultWeights = {
  OnTime_Delivery: 15,
  Defect_Rate_PPM: 10,
  Field_Failure_Rate: 8,
  Financial_Stability: 15,
  Inspection_Pass_Rate: 7,
  Avg_Lead_Time: 10,
  Shipment_Accuracy: 8,
  Audit_Score: 7,
  Capacity_Utilization: 5,
  GPR_Score: 15,
};

// ── Risk Framework Profiles ─────────────────────────────────────
export const riskProfiles = [
  { id: 'balanced', name: 'Balanced', icon: '⚖', desc: 'Equal emphasis across all parameters',
    weights: { ...defaultWeights } },
  { id: 'logistics', name: 'Logistics-Focused', icon: '🚛', desc: 'Prioritizes delivery, lead time, shipment accuracy',
    weights: { OnTime_Delivery: 22, Defect_Rate_PPM: 5, Field_Failure_Rate: 3, Financial_Stability: 10, Inspection_Pass_Rate: 5, Avg_Lead_Time: 20, Shipment_Accuracy: 18, Audit_Score: 5, Capacity_Utilization: 7, GPR_Score: 5 } },
  { id: 'esg', name: 'ESG Priority', icon: '🌱', desc: 'Environmental, social, and governance focus',
    weights: { OnTime_Delivery: 8, Defect_Rate_PPM: 5, Field_Failure_Rate: 5, Financial_Stability: 10, Inspection_Pass_Rate: 10, Avg_Lead_Time: 5, Shipment_Accuracy: 5, Audit_Score: 25, Capacity_Utilization: 5, GPR_Score: 22 } },
  { id: 'crisis', name: 'Crisis Response', icon: '🚨', desc: 'Maximizes geopolitical and financial resilience',
    weights: { OnTime_Delivery: 8, Defect_Rate_PPM: 5, Field_Failure_Rate: 5, Financial_Stability: 22, Inspection_Pass_Rate: 3, Avg_Lead_Time: 12, Shipment_Accuracy: 5, Audit_Score: 5, Capacity_Utilization: 10, GPR_Score: 25 } },
  { id: 'financial', name: 'Financial Risk', icon: '💹', desc: 'Heavy emphasis on financial health and stability',
    weights: { OnTime_Delivery: 10, Defect_Rate_PPM: 5, Field_Failure_Rate: 5, Financial_Stability: 30, Inspection_Pass_Rate: 5, Avg_Lead_Time: 8, Shipment_Accuracy: 5, Audit_Score: 12, Capacity_Utilization: 10, GPR_Score: 10 } },
  { id: 'geopolitical', name: 'Geopolitical Sensitive', icon: '🌐', desc: 'Maximum geopolitical and regional risk awareness',
    weights: { OnTime_Delivery: 8, Defect_Rate_PPM: 5, Field_Failure_Rate: 3, Financial_Stability: 12, Inspection_Pass_Rate: 3, Avg_Lead_Time: 12, Shipment_Accuracy: 7, Audit_Score: 8, Capacity_Utilization: 7, GPR_Score: 35 } },
];

// ── Global Event Catalog ────────────────────────────────────────
export const eventCatalog = [
  { id: 'red_sea', name: 'Red Sea Shipping Disruption', type: 'Maritime', severity: 'critical', region: 'Middle East', icon: '🚢',
    impacts: { Avg_Lead_Time: 1.4, Shipment_Accuracy: 0.85, GPR_Score: 1.25 }, desc: 'Houthi attacks on commercial shipping through Bab el-Mandeb strait.' },
  { id: 'suez_block', name: 'Suez Canal Blockage', type: 'Maritime', severity: 'critical', region: 'Middle East', icon: '⚓',
    impacts: { Avg_Lead_Time: 1.6, Shipment_Accuracy: 0.75, GPR_Score: 1.15, OnTime_Delivery: 0.8 }, desc: 'Complete blockage of Suez Canal disrupting east-west trade.' },
  { id: 'taiwan_strait', name: 'Taiwan Strait Crisis', type: 'Geopolitical', severity: 'critical', region: 'Asia Pacific', icon: '⚔',
    impacts: { GPR_Score: 1.8, Financial_Stability: 0.7, Avg_Lead_Time: 1.5, Capacity_Utilization: 1.3 }, desc: 'Military escalation around Taiwan affecting semiconductor supply.' },
  { id: 'eu_tariff', name: 'EU Trade Tariff Increase', type: 'Trade', severity: 'high', region: 'Europe', icon: '📜',
    impacts: { Financial_Stability: 0.9, GPR_Score: 1.15, Avg_Lead_Time: 1.1 }, desc: 'European Union imposes 25% tariff on imported electronics.' },
  { id: 'pandemic', name: 'Pandemic Outbreak', type: 'Health', severity: 'critical', region: 'Global', icon: '🦠',
    impacts: { Avg_Lead_Time: 1.8, OnTime_Delivery: 0.6, Capacity_Utilization: 1.4, Shipment_Accuracy: 0.7, Field_Failure_Rate: 1.3 }, desc: 'Global pandemic causing factory shutdowns and logistics chaos.' },
  { id: 'port_closure', name: 'Shanghai Port Closure', type: 'Logistics', severity: 'high', region: 'Asia Pacific', icon: '🏗',
    impacts: { Avg_Lead_Time: 1.5, OnTime_Delivery: 0.75, Shipment_Accuracy: 0.8 }, desc: 'Major port closure due to environmental or security incident.' },
  { id: 'cyber_attack', name: 'Logistics Cyber Attack', type: 'Cyber', severity: 'high', region: 'Global', icon: '💻',
    impacts: { Shipment_Accuracy: 0.7, OnTime_Delivery: 0.8, Audit_Score: 0.85 }, desc: 'Ransomware attack on global logistics management systems.' },
  { id: 'fuel_crisis', name: 'Global Fuel Crisis', type: 'Energy', severity: 'high', region: 'Global', icon: '⛽',
    impacts: { Avg_Lead_Time: 1.3, Financial_Stability: 0.85, GPR_Score: 1.2 }, desc: 'Oil supply disruption causing transportation cost surge.' },
  { id: 'labor_strike', name: 'Major Labor Strike', type: 'Labor', severity: 'moderate', region: 'Europe', icon: '✊',
    impacts: { OnTime_Delivery: 0.8, Capacity_Utilization: 1.25, Avg_Lead_Time: 1.2 }, desc: 'Widespread labor action affecting manufacturing output.' },
  { id: 'earthquake', name: 'Earthquake – East Asia', type: 'Natural Disaster', severity: 'critical', region: 'Asia Pacific', icon: '🌋',
    impacts: { Capacity_Utilization: 1.5, OnTime_Delivery: 0.5, Financial_Stability: 0.75, Avg_Lead_Time: 1.7, Field_Failure_Rate: 1.5 }, desc: 'Major earthquake disrupting manufacturing in East Asia.' },
];

// ── Region Mapping ──────────────────────────────────────────────
export const regionConfig = {
  'Asia Pacific': { color: '#EF4444', abbr: 'APAC' },
  'Europe': { color: '#3B82F6', abbr: 'EU' },
  'North America': { color: '#10B981', abbr: 'NA' },
  'Middle East': { color: '#F59E0B', abbr: 'ME' },
  'South America': { color: '#8B5CF6', abbr: 'SA' },
  'Africa': { color: '#EC4899', abbr: 'AF' },
  'Global': { color: '#6366F1', abbr: 'ALL' },
};

// ── Network Graph (static subset) ──────────────────────────────
export const networkNodes = [
  { id: 'you', label: 'Your Org', x: 400, y: 260, size: 28, tier: 0 },
  { id: 'v1', label: 'Vendor #1', x: 120, y: 100, size: 22, tier: 1, vendorId: 1 },
  { id: 'v2', label: 'Vendor #2', x: 200, y: 380, size: 22, tier: 1, vendorId: 2 },
  { id: 'v3', label: 'Vendor #3', x: 80, y: 260, size: 20, tier: 1, vendorId: 3 },
  { id: 'v8', label: 'Vendor #8', x: 620, y: 100, size: 20, tier: 1, vendorId: 8 },
  { id: 'v9', label: 'Vendor #9', x: 700, y: 260, size: 20, tier: 1, vendorId: 9 },
  { id: 'v5', label: 'Vendor #5', x: 550, y: 420, size: 18, tier: 1, vendorId: 5 },
  { id: 'v7', label: 'Vendor #7', x: 300, y: 80, size: 16, tier: 2, vendorId: 7 },
  { id: 'v12', label: 'Vendor #12', x: 250, y: 460, size: 16, tier: 2, vendorId: 12 },
  { id: 'v6', label: 'Vendor #6', x: 500, y: 160, size: 14, tier: 2, vendorId: 6 },
  { id: 'v14', label: 'Vendor #14', x: 380, y: 440, size: 14, tier: 2, vendorId: 14 },
  { id: 'v15', label: 'Vendor #15', x: 680, y: 400, size: 14, tier: 3, vendorId: 15 },
];

export const networkEdges = [
  { from: 'v1', to: 'you', weight: 0.9 }, { from: 'v2', to: 'you', weight: 0.85 },
  { from: 'v3', to: 'you', weight: 0.8 }, { from: 'v8', to: 'you', weight: 0.7 },
  { from: 'v9', to: 'you', weight: 0.75 }, { from: 'v5', to: 'you', weight: 0.6 },
  { from: 'v7', to: 'v1', weight: 0.7 }, { from: 'v7', to: 'v3', weight: 0.5 },
  { from: 'v12', to: 'v2', weight: 0.6 }, { from: 'v6', to: 'v8', weight: 0.4 },
  { from: 'v14', to: 'v7', weight: 0.5 }, { from: 'v15', to: 'v5', weight: 0.3 },
  { from: 'v3', to: 'v1', weight: 0.6 }, { from: 'v14', to: 'v6', weight: 0.4 },
];

// ── Audit Log Data ──────────────────────────────────────────────
export const auditLogs = [
  { id: 1, timestamp: '14:23:01', user: 'admin@vendoriq.com', action: 'Weight Update', resource: 'GPR_Score → 25%', status: 'success', ip: '192.168.1.10' },
  { id: 2, timestamp: '14:18:45', user: 'analyst@vendoriq.com', action: 'Event Injected', resource: 'Red Sea Disruption', status: 'success', ip: '192.168.1.22' },
  { id: 3, timestamp: '14:15:30', user: 'system', action: 'Recalculation', resource: '5000 vendors rescored', status: 'success', ip: '10.0.0.1' },
  { id: 4, timestamp: '14:10:12', user: 'admin@vendoriq.com', action: 'Profile Switch', resource: 'Crisis Response', status: 'success', ip: '192.168.1.10' },
  { id: 5, timestamp: '13:55:00', user: 'analyst@vendoriq.com', action: 'Export Report', resource: 'Q1 Risk Assessment', status: 'success', ip: '192.168.1.22' },
  { id: 6, timestamp: '13:42:18', user: 'system', action: 'Alert Triggered', resource: 'Vendor #1 → Critical', status: 'warning', ip: '10.0.0.1' },
  { id: 7, timestamp: '13:30:00', user: 'viewer@vendoriq.com', action: 'Login', resource: 'Dashboard Access', status: 'success', ip: '192.168.1.35' },
  { id: 8, timestamp: '13:15:44', user: 'system', action: 'Threshold Breach', resource: 'Vendor #3 GPR > 70', status: 'warning', ip: '10.0.0.1' },
];

// ── Smart Alerts Data ───────────────────────────────────────────
export const alerts = [
  { id: 1, severity: 'critical', type: 'Risk Score', title: 'Shenzhen Electronics exceeds critical threshold', time: '2 min ago', description: 'Composite risk score surged to 82/100 driven by geopolitical instability and declining on-time delivery rates. Immediate vendor review recommended.' },
  { id: 2, severity: 'critical', type: 'Geopolitical', title: 'Taiwan Strait military escalation detected', time: '15 min ago', description: 'Intelligence feeds report naval exercises near Taiwan. Apex Manufacturing and regional semiconductor suppliers face elevated disruption risk.' },
  { id: 3, severity: 'critical', type: 'Supply Chain', title: 'Dragon Steel delivery rate below 60%', time: '1 hr ago', description: 'On-time delivery has dropped to 58% over the past 30 days. Lead times have increased by 35%. Consider activating backup supplier protocols.' },
  { id: 4, severity: 'high', type: 'Financial', title: 'Lagos Polymers financial stability declining', time: '3 hr ago', description: 'Financial stability index dropped to 38/100. Credit rating downgrade expected. Contract exposure: $0.9M.' },
  { id: 5, severity: 'high', type: 'Compliance', title: 'Cairo Textiles audit score below threshold', time: '5 hr ago', description: 'Latest compliance audit returned a score of 50/100, falling below the minimum acceptable threshold of 60. Remediation plan required within 14 days.' },
  { id: 6, severity: 'high', type: 'Logistics', title: 'Red Sea route delays impacting 4 vendors', time: '6 hr ago', description: 'Ongoing Houthi disruptions in the Bab el-Mandeb strait are adding 8-12 days to shipping routes for Middle East and Asia Pacific vendors.' },
  { id: 7, severity: 'moderate', type: 'Capacity', title: 'Dragon Steel capacity utilization at 95%', time: '8 hr ago', description: 'Operating near maximum capacity increases risk of quality degradation and inability to absorb demand spikes. Monitor closely.' },
  { id: 8, severity: 'moderate', type: 'Quality', title: 'Apex Manufacturing defect rate trending up', time: '12 hr ago', description: 'Defect rate PPM has increased 15% over the past quarter from 3,600 to 4,200. Field failure rate also trending upward.' },
  { id: 9, severity: 'moderate', type: 'Logistics', title: 'Istanbul Metals lead time exceeding SLA', time: '1 day ago', description: 'Average lead time has increased to 16 days against an SLA target of 12 days. Shipment accuracy also declining.' },
  { id: 10, severity: 'low', type: 'Information', title: 'Nordic Supply Chain contract renewal due', time: '2 days ago', description: 'Contract with Nordic Supply Chain (Sweden) is due for renewal in 45 days. Current performance metrics are excellent — low risk vendor.' },
  { id: 11, severity: 'low', type: 'System', title: 'Weight engine profile updated to Balanced', time: '3 days ago', description: 'Risk analyst switched the active scoring profile from Crisis Response back to Balanced. All vendor scores have been recalculated.' },
];

// ── Scoring Utilities ───────────────────────────────────────────
export function normalizeParam(key, rawValue) {
  const cfg = parameterConfig[key];
  if (!cfg) return 50;
  const clamped = Math.max(cfg.min, Math.min(cfg.max, rawValue));
  const ratio = (clamped - cfg.min) / (cfg.max - cfg.min);
  return cfg.invert ? (1 - ratio) * 100 : ratio * 100;
}

export function calcVendorScore(vendor, weights, activeEvents = []) {
  let modifiedParams = { ...vendor.params };
  // Apply event impacts
  activeEvents.forEach(evt => {
    const matchesRegion = evt.region === 'Global' || evt.region === vendor.region;
    if (matchesRegion) {
      Object.entries(evt.impacts).forEach(([param, multiplier]) => {
        if (modifiedParams[param] !== undefined) {
          if (parameterConfig[param]?.invert) {
            modifiedParams[param] = modifiedParams[param] * (multiplier < 1 ? multiplier : 1 / multiplier);
          } else {
            modifiedParams[param] = modifiedParams[param] * multiplier;
          }
        }
      });
    }
  });
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  let score = 0;
  const contributions = {};
  Object.entries(weights).forEach(([param, weight]) => {
    const rawVal = modifiedParams[param] ?? vendor.params[param] ?? 50;
    const normalized = normalizeParam(param, rawVal);
    const contribution = (normalized * weight) / totalWeight;
    score += contribution;
    contributions[param] = { normalized: Math.round(normalized), weight, contribution: Math.round(contribution * 10) / 10, raw: rawVal };
  });
  return { score: Math.round(Math.min(99, Math.max(1, score))), contributions, modifiedParams };
}

export function getRiskBand(score) {
  if (score >= 75) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 35) return 'Moderate';
  return 'Low';
}

export function getRiskColor(score) {
  if (score >= 75) return '#DC2626';
  if (score >= 55) return '#EA580C';
  if (score >= 35) return '#D97706';
  return '#059669';
}

// ── Category helpers ────────────────────────────────────────────
export function getParamsByCategory() {
  const cats = {};
  Object.entries(parameterConfig).forEach(([key, cfg]) => {
    if (!cats[cfg.category]) cats[cfg.category] = [];
    cats[cfg.category].push({ key, ...cfg });
  });
  return cats;
}
