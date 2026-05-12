/* ═══════════════════════════════════════════════════════════════════
   VendorIQ – Analytical Intelligence Data Layer
   Raw vendor parameters · Event catalog · Risk frameworks
   ═══════════════════════════════════════════════════════════════════ */

// ── Parameter Configuration ─────────────────────────────────────
export const parameterConfig = {
  OnTime_Delivery:     { label: 'On-Time Delivery',    unit: '%',   invert: true,  min: 40, max: 100, icon: '📦', category: 'Operations' },
  Defect_Rate_PPM:     { label: 'Defect Rate (PPM)',   unit: 'PPM', invert: false, min: 0,  max: 10000, icon: '🔍', category: 'Quality' },
  Field_Failure_Rate:  { label: 'Field Failure Rate',  unit: '%',   invert: false, min: 0,  max: 10, icon: '⚠', category: 'Quality' },
  Financial_Stability: { label: 'Financial Stability', unit: '/100',invert: true,  min: 0,  max: 100, icon: '💰', category: 'Financial' },
  Inspection_Pass_Rate:{ label: 'Inspection Pass Rate',unit: '%',   invert: true,  min: 50, max: 100, icon: '✅', category: 'Quality' },
  Avg_Lead_Time:       { label: 'Avg Lead Time',       unit: 'days',invert: false, min: 1,  max: 45, icon: '⏱', category: 'Logistics' },
  Shipment_Accuracy:   { label: 'Shipment Accuracy',   unit: '%',   invert: true,  min: 60, max: 100, icon: '🎯', category: 'Logistics' },
  Audit_Score:         { label: 'Audit Score',         unit: '/100',invert: true,  min: 0,  max: 100, icon: '📋', category: 'Compliance' },
  Capacity_Utilization:{ label: 'Capacity Utilization',unit: '%',   invert: false, min: 30, max: 100, icon: '⚙', category: 'Operations' },
  GPR_Score:           { label: 'Geopolitical Risk',   unit: '/100',invert: false, min: 0,  max: 100, icon: '🌍', category: 'Geopolitical' },
};

// ── Default Weights (sum to 100) ────────────────────────────────
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

// ── Raw Vendor Data (pre-scoring) ───────────────────────────────
export const vendorRawData = [
  { id: 1, name: 'Shenzhen Electronics', region: 'Asia Pacific', country: 'China', tier: 'T1', category: 'Electronics', contractValue: '$4.2M', lat: 22.54, lng: 114.06,
    params: { OnTime_Delivery: 55, Defect_Rate_PPM: 5700, Field_Failure_Rate: 3.2, Financial_Stability: 32, Inspection_Pass_Rate: 78, Avg_Lead_Time: 28, Shipment_Accuracy: 82, Audit_Score: 45, Capacity_Utilization: 92, GPR_Score: 78 }},
  { id: 2, name: 'Apex Manufacturing Co.', region: 'Asia Pacific', country: 'Taiwan', tier: 'T1', category: 'Semiconductors', contractValue: '$3.8M', lat: 25.03, lng: 121.57,
    params: { OnTime_Delivery: 62, Defect_Rate_PPM: 4200, Field_Failure_Rate: 2.8, Financial_Stability: 45, Inspection_Pass_Rate: 81, Avg_Lead_Time: 24, Shipment_Accuracy: 85, Audit_Score: 52, Capacity_Utilization: 88, GPR_Score: 72 }},
  { id: 3, name: 'Dragon Steel Corp', region: 'Asia Pacific', country: 'China', tier: 'T1', category: 'Raw Materials', contractValue: '$5.1M', lat: 31.23, lng: 121.47,
    params: { OnTime_Delivery: 60, Defect_Rate_PPM: 4900, Field_Failure_Rate: 3.0, Financial_Stability: 40, Inspection_Pass_Rate: 75, Avg_Lead_Time: 30, Shipment_Accuracy: 80, Audit_Score: 48, Capacity_Utilization: 95, GPR_Score: 75 }},
  { id: 4, name: 'Pacific Raw Materials', region: 'Asia Pacific', country: 'Indonesia', tier: 'T1', category: 'Raw Materials', contractValue: '$2.1M', lat: -6.21, lng: 106.85,
    params: { OnTime_Delivery: 68, Defect_Rate_PPM: 3800, Field_Failure_Rate: 2.4, Financial_Stability: 52, Inspection_Pass_Rate: 83, Avg_Lead_Time: 22, Shipment_Accuracy: 86, Audit_Score: 55, Capacity_Utilization: 85, GPR_Score: 65 }},
  { id: 5, name: 'GlobalTech Solutions', region: 'North America', country: 'USA', tier: 'T1', category: 'Technology', contractValue: '$6.5M', lat: 37.77, lng: -122.42,
    params: { OnTime_Delivery: 71, Defect_Rate_PPM: 2800, Field_Failure_Rate: 1.8, Financial_Stability: 58, Inspection_Pass_Rate: 87, Avg_Lead_Time: 14, Shipment_Accuracy: 89, Audit_Score: 68, Capacity_Utilization: 78, GPR_Score: 25 }},
  { id: 6, name: 'Cairo Textiles', region: 'Africa', country: 'Egypt', tier: 'T3', category: 'Textiles', contractValue: '$1.2M', lat: 30.04, lng: 31.24,
    params: { OnTime_Delivery: 70, Defect_Rate_PPM: 3500, Field_Failure_Rate: 2.2, Financial_Stability: 55, Inspection_Pass_Rate: 80, Avg_Lead_Time: 20, Shipment_Accuracy: 84, Audit_Score: 50, Capacity_Utilization: 82, GPR_Score: 68 }},
  { id: 7, name: 'Atlas Logistics Ltd.', region: 'Middle East', country: 'UAE', tier: 'T2', category: 'Logistics', contractValue: '$3.0M', lat: 25.20, lng: 55.27,
    params: { OnTime_Delivery: 74, Defect_Rate_PPM: 2100, Field_Failure_Rate: 1.5, Financial_Stability: 61, Inspection_Pass_Rate: 88, Avg_Lead_Time: 12, Shipment_Accuracy: 90, Audit_Score: 65, Capacity_Utilization: 75, GPR_Score: 55 }},
  { id: 8, name: 'Nordic Supply Chain', region: 'Europe', country: 'Sweden', tier: 'T1', category: 'Logistics', contractValue: '$4.8M', lat: 59.33, lng: 18.07,
    params: { OnTime_Delivery: 88, Defect_Rate_PPM: 1200, Field_Failure_Rate: 0.8, Financial_Stability: 76, Inspection_Pass_Rate: 94, Avg_Lead_Time: 8, Shipment_Accuracy: 95, Audit_Score: 82, Capacity_Utilization: 68, GPR_Score: 12 }},
  { id: 9, name: 'EuroComponents GmbH', region: 'Europe', country: 'Germany', tier: 'T1', category: 'Electronics', contractValue: '$5.5M', lat: 48.14, lng: 11.58,
    params: { OnTime_Delivery: 92, Defect_Rate_PPM: 800, Field_Failure_Rate: 0.5, Financial_Stability: 82, Inspection_Pass_Rate: 96, Avg_Lead_Time: 6, Shipment_Accuracy: 97, Audit_Score: 88, Capacity_Utilization: 65, GPR_Score: 8 }},
  { id: 10, name: 'TechFusion Inc.', region: 'North America', country: 'Canada', tier: 'T2', category: 'Technology', contractValue: '$2.8M', lat: 43.65, lng: -79.38,
    params: { OnTime_Delivery: 95, Defect_Rate_PPM: 500, Field_Failure_Rate: 0.3, Financial_Stability: 88, Inspection_Pass_Rate: 97, Avg_Lead_Time: 5, Shipment_Accuracy: 98, Audit_Score: 92, Capacity_Utilization: 60, GPR_Score: 5 }},
  { id: 11, name: 'Midwest Agriculture', region: 'North America', country: 'USA', tier: 'T2', category: 'Raw Materials', contractValue: '$1.9M', lat: 41.88, lng: -87.63,
    params: { OnTime_Delivery: 90, Defect_Rate_PPM: 900, Field_Failure_Rate: 0.6, Financial_Stability: 80, Inspection_Pass_Rate: 93, Avg_Lead_Time: 7, Shipment_Accuracy: 94, Audit_Score: 85, Capacity_Utilization: 70, GPR_Score: 10 }},
  { id: 12, name: 'Bangalore IT Services', region: 'Asia Pacific', country: 'India', tier: 'T2', category: 'Technology', contractValue: '$3.2M', lat: 12.97, lng: 77.59,
    params: { OnTime_Delivery: 85, Defect_Rate_PPM: 1400, Field_Failure_Rate: 1.0, Financial_Stability: 70, Inspection_Pass_Rate: 90, Avg_Lead_Time: 10, Shipment_Accuracy: 91, Audit_Score: 75, Capacity_Utilization: 72, GPR_Score: 35 }},
  { id: 13, name: 'SouthAm Chemicals', region: 'South America', country: 'Brazil', tier: 'T2', category: 'Chemicals', contractValue: '$2.4M', lat: -23.55, lng: -46.63,
    params: { OnTime_Delivery: 80, Defect_Rate_PPM: 2200, Field_Failure_Rate: 1.6, Financial_Stability: 60, Inspection_Pass_Rate: 85, Avg_Lead_Time: 18, Shipment_Accuracy: 87, Audit_Score: 62, Capacity_Utilization: 78, GPR_Score: 42 }},
  { id: 14, name: 'Istanbul Metals', region: 'Middle East', country: 'Turkey', tier: 'T2', category: 'Raw Materials', contractValue: '$1.8M', lat: 41.01, lng: 28.98,
    params: { OnTime_Delivery: 72, Defect_Rate_PPM: 3100, Field_Failure_Rate: 2.0, Financial_Stability: 48, Inspection_Pass_Rate: 82, Avg_Lead_Time: 16, Shipment_Accuracy: 83, Audit_Score: 55, Capacity_Utilization: 80, GPR_Score: 62 }},
  { id: 15, name: 'Lagos Polymers', region: 'Africa', country: 'Nigeria', tier: 'T3', category: 'Chemicals', contractValue: '$0.9M', lat: 6.52, lng: 3.38,
    params: { OnTime_Delivery: 65, Defect_Rate_PPM: 4500, Field_Failure_Rate: 2.6, Financial_Stability: 38, Inspection_Pass_Rate: 72, Avg_Lead_Time: 25, Shipment_Accuracy: 76, Audit_Score: 40, Capacity_Utilization: 88, GPR_Score: 70 }},
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

// ── Network Graph ───────────────────────────────────────────────
export const networkNodes = [
  { id: 'you', label: 'Your Org', x: 400, y: 260, size: 28, tier: 0 },
  { id: 'v1', label: 'Shenzhen Elec.', x: 120, y: 100, size: 22, tier: 1, vendorId: 1 },
  { id: 'v2', label: 'Apex Mfg.', x: 200, y: 380, size: 22, tier: 1, vendorId: 2 },
  { id: 'v3', label: 'Dragon Steel', x: 80, y: 260, size: 20, tier: 1, vendorId: 3 },
  { id: 'v8', label: 'Nordic Supply', x: 620, y: 100, size: 20, tier: 1, vendorId: 8 },
  { id: 'v9', label: 'EuroComp.', x: 700, y: 260, size: 20, tier: 1, vendorId: 9 },
  { id: 'v5', label: 'GlobalTech', x: 550, y: 420, size: 18, tier: 1, vendorId: 5 },
  { id: 'v7', label: 'Atlas Logistics', x: 300, y: 80, size: 16, tier: 2, vendorId: 7 },
  { id: 'v12', label: 'Bangalore IT', x: 250, y: 460, size: 16, tier: 2, vendorId: 12 },
  { id: 'v6', label: 'Cairo Textiles', x: 500, y: 160, size: 14, tier: 2, vendorId: 6 },
  { id: 'v14', label: 'Istanbul Met.', x: 380, y: 440, size: 14, tier: 2, vendorId: 14 },
  { id: 'v15', label: 'Lagos Poly.', x: 680, y: 400, size: 14, tier: 3, vendorId: 15 },
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
  { id: 3, timestamp: '14:15:30', user: 'system', action: 'Recalculation', resource: '15 vendors rescored', status: 'success', ip: '10.0.0.1' },
  { id: 4, timestamp: '14:10:12', user: 'admin@vendoriq.com', action: 'Profile Switch', resource: 'Crisis Response', status: 'success', ip: '192.168.1.10' },
  { id: 5, timestamp: '13:55:00', user: 'analyst@vendoriq.com', action: 'Export Report', resource: 'Q1 Risk Assessment', status: 'success', ip: '192.168.1.22' },
  { id: 6, timestamp: '13:42:18', user: 'system', action: 'Alert Triggered', resource: 'Shenzhen Electronics → Critical', status: 'warning', ip: '10.0.0.1' },
  { id: 7, timestamp: '13:30:00', user: 'viewer@vendoriq.com', action: 'Login', resource: 'Dashboard Access', status: 'success', ip: '192.168.1.35' },
  { id: 8, timestamp: '13:15:44', user: 'system', action: 'Threshold Breach', resource: 'Dragon Steel GPR > 70', status: 'warning', ip: '10.0.0.1' },
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
          if (parameterConfig[param].invert) {
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
    const normalized = normalizeParam(param, modifiedParams[param] ?? vendor.params[param]);
    const contribution = (normalized * weight) / totalWeight;
    score += contribution;
    contributions[param] = { normalized: Math.round(normalized), weight, contribution: Math.round(contribution * 10) / 10, raw: modifiedParams[param] ?? vendor.params[param] };
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
