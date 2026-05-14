/* ═══════════════════════════════════════════════════════════════════
   Context Builder – Converts vendor objects into concise LLM context
   Keeps under 400 tokens · Uses vendorId only (never vendor name)
   ═══════════════════════════════════════════════════════════════════ */

import { parameterConfig } from '../data/mockData';

/**
 * Build a concise text context block for a single vendor.
 * Designed to stay under ~400 tokens for efficient LLM usage.
 *
 * @param {Object} vendor - A scored vendor object from RiskEngine
 * @param {Array} activeEvents - Currently active global events
 * @returns {string} - Plain text context block
 */
export function buildVendorContext(vendor, activeEvents = []) {
  if (!vendor) return 'No vendor data available.';

  const lines = [];

  // ── Vendor Identity (no name, vendorId only) ──────────────────
  lines.push(`VENDOR: ${vendor.vendorId}`);
  lines.push(`Region: ${vendor.region} | Country: ${vendor.country}`);
  lines.push(`Tier: ${vendor.tier} | Category: ${vendor.category}`);
  lines.push(`Contract Value: ${vendor.contractValue}`);
  lines.push('');

  // ── Overall Risk Assessment ───────────────────────────────────
  lines.push(`RISK SCORE: ${vendor.riskScore}/100`);
  lines.push(`RISK BAND: ${vendor.riskBand}`);
  lines.push('');

  // ── Top 5 Contributing Parameters ─────────────────────────────
  if (vendor.contributions) {
    const sorted = Object.entries(vendor.contributions)
      .sort(([, a], [, b]) => b.contribution - a.contribution)
      .slice(0, 5);

    lines.push('TOP 5 RISK CONTRIBUTORS (weighted):');
    sorted.forEach(([key, data], i) => {
      const cfg = parameterConfig[key];
      const label = cfg?.label || key;
      lines.push(`  ${i + 1}. ${label}: contribution=${data.contribution.toFixed(1)}, weight=${data.weight}%, normalized=${data.normalized}/100`);
    });
    lines.push('');
  }

  // ── Key Raw Parameter Values ──────────────────────────────────
  if (vendor.params) {
    const keyMetrics = [
      'OnTime_Delivery', 'Defect_Rate_PPM', 'Financial_Stability',
      'Avg_Lead_Time', 'GPR_Score', 'Shipment_Accuracy',
      'Inspection_Pass_Rate', 'Audit_Score', 'ESG_Score',
      'Field_Failure_Rate',
    ];

    lines.push('KEY METRICS (raw values):');
    keyMetrics.forEach(key => {
      const val = vendor.params[key];
      if (val !== undefined) {
        const cfg = parameterConfig[key];
        const label = cfg?.label || key;
        const unit = cfg?.unit || '';
        const formatted = typeof val === 'number'
          ? (Number.isInteger(val) ? val : val.toFixed(2))
          : val;
        lines.push(`  ${label}: ${formatted}${unit ? ' ' + unit : ''}`);
      }
    });
    lines.push('');
  }

  // ── Active Events Affecting This Vendor ───────────────────────
  const affectingEvents = activeEvents.filter(
    e => e.region === 'Global' || e.region === vendor.region
  );

  if (affectingEvents.length > 0) {
    lines.push('ACTIVE DISRUPTION EVENTS:');
    affectingEvents.forEach(e => {
      const impactedParams = Object.keys(e.impacts || {}).join(', ');
      lines.push(`  - ${e.name} (${e.severity}) — impacts: ${impactedParams}`);
    });
  } else {
    lines.push('ACTIVE EVENTS: None currently affecting this vendor.');
  }

  return lines.join('\n');
}

/**
 * Build a combined context for comparing two vendors.
 *
 * @param {Object} vendorA - First vendor
 * @param {Object} vendorB - Second vendor
 * @param {Array} activeEvents - Currently active global events
 * @returns {string} - Combined context block
 */
export function buildComparisonContext(vendorA, vendorB, activeEvents = []) {
  const ctxA = buildVendorContext(vendorA, activeEvents);
  const ctxB = buildVendorContext(vendorB, activeEvents);

  return `=== VENDOR A ===\n${ctxA}\n\n=== VENDOR B ===\n${ctxB}`;
}
