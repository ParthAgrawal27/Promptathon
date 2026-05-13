/* ═══════════════════════════════════════════════════════════════════
   CSV Loader – Parses vendor_risk_dataset_5000.csv into structured
   vendor objects for the VendorIQ risk engine.
   ═══════════════════════════════════════════════════════════════════ */

// ── Deterministic metadata generation ───────────────────────────
const VENDOR_PREFIXES = [
  'Apex', 'Global', 'Pacific', 'Dragon', 'Nordic', 'Atlas', 'Shenzhen',
  'Cairo', 'Lagos', 'Istanbul', 'Bangalore', 'EuroTech', 'TechFusion',
  'StarLine', 'Quantum', 'Nexus', 'Prime', 'Vertex', 'Sigma', 'Titan',
  'Zenith', 'Vanguard', 'Pinnacle', 'Meridian', 'Eclipse', 'Fusion',
  'Catalyst', 'Horizon', 'Spectrum', 'Forge', 'Orbital', 'Summit',
  'Phoenix', 'Beacon', 'Cobalt', 'Sterling', 'Iron Ridge', 'Sapphire',
  'Emerald', 'Onyx', 'Crimson', 'Azure', 'Jade', 'Amber', 'Slate',
];

const VENDOR_SUFFIXES = [
  'Manufacturing', 'Electronics', 'Solutions', 'Corp', 'Industries',
  'Supply Co.', 'Logistics', 'Materials', 'Technologies', 'Systems',
  'Components', 'Services', 'International', 'Enterprises', 'Group',
  'Trading', 'Dynamics', 'Works', 'Foundry', 'Labs',
];

const REGIONS = [
  { name: 'Asia Pacific', countries: ['China', 'Taiwan', 'India', 'Indonesia', 'Japan', 'South Korea', 'Vietnam', 'Thailand', 'Malaysia', 'Philippines'],
    lats: [22, 25, 13, -6, 36, 37, 21, 14, 3, 14], lngs: [114, 121, 78, 107, 140, 127, 106, 101, 102, 121] },
  { name: 'Europe', countries: ['Germany', 'Sweden', 'France', 'UK', 'Italy', 'Netherlands', 'Spain', 'Poland', 'Czech Republic', 'Switzerland'],
    lats: [48, 59, 49, 52, 42, 52, 40, 52, 50, 47], lngs: [12, 18, 2, -1, 12, 5, -4, 21, 15, 8] },
  { name: 'North America', countries: ['USA', 'Canada', 'Mexico'],
    lats: [38, 44, 19], lngs: [-97, -79, -99] },
  { name: 'Middle East', countries: ['UAE', 'Turkey', 'Saudi Arabia', 'Israel', 'Qatar'],
    lats: [25, 41, 24, 32, 25], lngs: [55, 29, 46, 35, 51] },
  { name: 'South America', countries: ['Brazil', 'Argentina', 'Chile', 'Colombia'],
    lats: [-24, -34, -33, 5], lngs: [-47, -58, -71, -74] },
  { name: 'Africa', countries: ['Egypt', 'Nigeria', 'South Africa', 'Kenya', 'Morocco'],
    lats: [30, 7, -34, -1, 34], lngs: [31, 3, 18, 37, -7] },
];

const CATEGORIES = [
  'Electronics', 'Semiconductors', 'Raw Materials', 'Chemicals',
  'Logistics', 'Technology', 'Textiles', 'Automotive', 'Pharma',
  'Aerospace', 'Energy', 'Food & Agriculture', 'Packaging',
];

const TIERS = ['T1', 'T1', 'T1', 'T2', 'T2', 'T3']; // weighted distribution

function seededHash(id) {
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateVendorMeta(vendorId) {
  const h = seededHash(vendorId);
  const h2 = seededHash(vendorId + '_2');
  const h3 = seededHash(vendorId + '_3');

  const prefix = VENDOR_PREFIXES[h % VENDOR_PREFIXES.length];
  const suffix = VENDOR_SUFFIXES[h2 % VENDOR_SUFFIXES.length];
  const name = `${prefix} ${suffix}`;

  const regionObj = REGIONS[h3 % REGIONS.length];
  const countryIdx = (h + h2) % regionObj.countries.length;
  const country = regionObj.countries[countryIdx];
  const lat = regionObj.lats[countryIdx] + ((h % 100) - 50) * 0.05;
  const lng = regionObj.lngs[countryIdx] + ((h2 % 100) - 50) * 0.05;

  const tier = TIERS[h % TIERS.length];
  const category = CATEGORIES[(h + h3) % CATEGORIES.length];
  const contractValue = `$${(0.5 + (h % 100) * 0.08).toFixed(1)}M`;

  return { name, region: regionObj.name, country, lat, lng, tier, category, contractValue };
}

// ── CSV Param Keys (in CSV column order) ────────────────────────
const PARAM_KEYS = [
  'OnTime_Delivery', 'Avg_Lead_Time', 'Lead_Time_Variability',
  'Emergency_Fulfillment', 'Shipment_Accuracy', 'Avg_Days_Late',
  'Defect_Rate_PPM', 'Field_Failure_Rate', 'Warranty_Claims',
  'Inspection_Pass_Rate', 'Certification_Score', 'Financial_Stability',
  'Revenue_Trend', 'Debt_Equity', 'DPO', 'Carrier_Dependency',
  'GPR_Score', 'Tariff_Exposure', 'Disaster_Risk', 'Single_Source',
  'Tier2_Visibility', 'Vendor_Tenure', 'Response_Time', 'Audit_Score',
  'Capacity_Utilization', 'Carbon_Score', 'Labor_Compliance', 'ESG_Score',
];

// ── Main Parser ─────────────────────────────────────────────────
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  const vendors = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 3) continue;

    const vendorId = cols[0].trim();
    const numericId = parseInt(vendorId.replace('V', ''), 10);
    const meta = generateVendorMeta(vendorId);

    const params = {};
    PARAM_KEYS.forEach(key => {
      const idx = header.indexOf(key);
      if (idx !== -1) {
        params[key] = parseFloat(cols[idx]) || 0;
      }
    });

    // Extract pre-computed risk fields from CSV for comparison
    const riskScoreIdx = header.indexOf('Risk_Score');
    const riskCatIdx = header.indexOf('Risk_Category');
    const csvRiskScore = riskScoreIdx !== -1 ? parseFloat(cols[riskScoreIdx]) : null;
    const csvRiskCategory = riskCatIdx !== -1 ? cols[riskCatIdx]?.trim() : null;

    vendors.push({
      id: numericId,
      vendorId,
      ...meta,
      params,
      csvRiskScore,
      csvRiskCategory,
    });
  }

  return vendors;
}

// ── Async Loader ────────────────────────────────────────────────
let cachedVendors = null;

export async function loadVendors() {
  if (cachedVendors) return cachedVendors;

  const response = await fetch('/vendor_risk_dataset_5000.csv');
  const csvText = await response.text();
  cachedVendors = parseCSV(csvText);
  return cachedVendors;
}

export function getCachedVendors() {
  return cachedVendors;
}
