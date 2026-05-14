"""
VendorIQ — Heuristic Risk Scoring Engine
Configurable analytical engine with decision-tree explainability.
NO ML models — pure rule-based + weighted scoring.
"""
from typing import Dict, List, Optional
import logging

logger = logging.getLogger("vendoriq.risk_engine")

PARAMETER_CONFIG = {
    "OnTime_Delivery": {"min": 40, "max": 100, "invert": True},
    "Avg_Lead_Time": {"min": 1, "max": 45, "invert": False},
    "Lead_Time_Variability": {"min": 0, "max": 10, "invert": False},
    "Emergency_Fulfillment": {"min": 20, "max": 100, "invert": True},
    "Avg_Days_Late": {"min": 0, "max": 10, "invert": False},
    "Defect_Rate_PPM": {"min": 0, "max": 2000, "invert": False},
    "Field_Failure_Rate": {"min": 0, "max": 5, "invert": False},
    "Warranty_Claims": {"min": 0, "max": 3, "invert": False},
    "Inspection_Pass_Rate": {"min": 50, "max": 100, "invert": True},
    "Certification_Score": {"min": 0, "max": 100, "invert": True},
    "Financial_Stability": {"min": 0, "max": 100, "invert": True},
    "Revenue_Trend": {"min": -10, "max": 10, "invert": True},
    "Debt_Equity": {"min": 0, "max": 3, "invert": False},
    "DPO": {"min": 10, "max": 90, "invert": False},
    "Shipment_Accuracy": {"min": 60, "max": 100, "invert": True},
    "Carrier_Dependency": {"min": 0, "max": 100, "invert": False},
    "GPR_Score": {"min": 0, "max": 100, "invert": False},
    "Tariff_Exposure": {"min": 0, "max": 100, "invert": False},
    "Disaster_Risk": {"min": 0, "max": 100, "invert": False},
    "Single_Source": {"min": 0, "max": 1, "invert": False},
    "Tier2_Visibility": {"min": 0, "max": 10, "invert": True},
    "Audit_Score": {"min": 0, "max": 100, "invert": True},
    "Capacity_Utilization": {"min": 0, "max": 100, "invert": False},
    "Carbon_Score": {"min": 0, "max": 100, "invert": True},
    "Labor_Compliance": {"min": 0, "max": 100, "invert": True},
    "ESG_Score": {"min": 0, "max": 100, "invert": True},
}

SCORED_PARAM_KEYS = [
    "OnTime_Delivery", "Defect_Rate_PPM", "Field_Failure_Rate",
    "Financial_Stability", "Inspection_Pass_Rate", "Avg_Lead_Time",
    "Shipment_Accuracy", "Audit_Score", "Capacity_Utilization", "GPR_Score",
]


def normalize_param(key: str, raw_value: float) -> float:
    cfg = PARAMETER_CONFIG.get(key)
    if not cfg:
        return 50.0
    rng = cfg["max"] - cfg["min"]
    if rng == 0:
        return 50.0
    clamped = max(cfg["min"], min(cfg["max"], raw_value))
    ratio = (clamped - cfg["min"]) / rng
    return (1 - ratio) * 100 if cfg["invert"] else ratio * 100


def get_risk_band(score: float) -> str:
    if score >= 75: return "Critical"
    if score >= 55: return "High"
    if score >= 35: return "Moderate"
    return "Low"


def get_risk_color(score: float) -> str:
    if score >= 75: return "#DC2626"
    if score >= 55: return "#EA580C"
    if score >= 35: return "#D97706"
    return "#059669"


def calculate_vendor_risk(
    params: Dict[str, float],
    weights: Dict[str, float],
    active_events: Optional[List[dict]] = None,
    vendor_region: str = ""
) -> dict:
    """
    Core heuristic risk calculation.
    1. Apply event impacts  2. Normalize  3. Weight  4. Explain
    """
    modified = {**params}
    if active_events:
        for evt in active_events:
            if evt.get("region", "Global") == "Global" or evt.get("region") == vendor_region:
                for p, mult in evt.get("impacts", {}).items():
                    if p in modified:
                        cfg = PARAMETER_CONFIG.get(p, {})
                        if cfg.get("invert"):
                            modified[p] *= (mult if mult < 1 else 1 / mult)
                        else:
                            modified[p] *= mult

    total_w = sum(weights.get(p, 0) for p in SCORED_PARAM_KEYS) or 1
    score = 0.0
    contribs = {}
    for p in SCORED_PARAM_KEYS:
        w = weights.get(p, 0)
        raw = modified.get(p, params.get(p, 50))
        norm = normalize_param(p, raw)
        c = (norm * w) / total_w
        score += c
        contribs[p] = {"normalized": round(norm), "weight": w, "contribution": round(c, 1), "raw": round(raw, 2)}

    final = round(min(99, max(1, score)))
    cat = get_risk_band(final)

    return {
        "score": final, "category": cat, "color": get_risk_color(final),
        "contributions": contribs,
        "decision_tree": _build_tree(modified, weights, active_events or []),
        "reasoning": _build_reasoning(modified, final, cat),
        "modified_params": {k: round(v, 2) for k, v in modified.items()},
    }


def _build_tree(params, weights, events):
    has_geo = any(e.get("type") in ("Geopolitical", "Maritime", "War") for e in events)
    gpr_w = weights.get("GPR_Score", 0)
    low_del = params.get("OnTime_Delivery", 100) < 70
    hi_defect = params.get("Defect_Rate_PPM", 0) > 1500
    hi_lead = params.get("Avg_Lead_Time", 0) > 20
    lo_acc = params.get("Shipment_Accuracy", 100) < 80
    lo_fin = params.get("Financial_Stability", 100) < 50
    hi_cap = params.get("Capacity_Utilization", 0) > 90
    hi_gpr = params.get("GPR_Score", 0) > 60
    return [
        {"condition": "GPR_Weight > 20%", "result": "Escalate APAC vendors", "triggered": gpr_w > 20, "impact": "high" if gpr_w > 20 else "none"},
        {"condition": "Active_Event = WAR/MARITIME", "result": "+40% GPR multiplier", "triggered": has_geo, "impact": "critical" if has_geo else "none"},
        {"condition": "OnTime_Delivery < 70% AND Defect > 1500", "result": "Operational risk escalation", "triggered": low_del and hi_defect, "impact": "critical" if low_del and hi_defect else "none"},
        {"condition": "OnTime_Delivery < 70%", "result": "Flag delivery risk", "triggered": low_del, "impact": "high" if low_del else "none"},
        {"condition": "Avg_Lead_Time > 20 days", "result": "Logistics bottleneck", "triggered": hi_lead, "impact": "high" if hi_lead else "none"},
        {"condition": "Lead_Time > 25 AND Accuracy < 80%", "result": "Logistics instability", "triggered": params.get("Avg_Lead_Time", 0) > 25 and lo_acc, "impact": "critical" if params.get("Avg_Lead_Time", 0) > 25 and lo_acc else "none"},
        {"condition": "Financial_Stability < 50", "result": "Financial distress alert", "triggered": lo_fin, "impact": "high" if lo_fin else "none"},
        {"condition": "Capacity_Utilization > 90%", "result": "Overload warning", "triggered": hi_cap, "impact": "moderate" if hi_cap else "none"},
        {"condition": "GPR_Score > 60", "result": "Geopolitical disruption risk", "triggered": hi_gpr, "impact": "high" if hi_gpr else "none"},
    ]


def _build_reasoning(params, score, category):
    reasons = []
    if score >= 75:
        reasons.append(f"CRITICAL: Risk score {score}/100 exceeds critical threshold. Immediate review required.")
    d = params.get("OnTime_Delivery", 100)
    defect = params.get("Defect_Rate_PPM", 0)
    if d < 70 and defect > 1500:
        reasons.append(f"Dual operational risk: delivery {d:.1f}% + defect {defect:.0f} PPM.")
    elif d < 70:
        reasons.append(f"Delivery at {d:.1f}% below 70% threshold.")
    gpr = params.get("GPR_Score", 0)
    if gpr > 60:
        reasons.append(f"Geopolitical risk {gpr:.0f}/100 — regional instability.")
    fin = params.get("Financial_Stability", 100)
    if fin < 50:
        reasons.append(f"Financial stability {fin:.0f}/100 — liquidity concern.")
    cap = params.get("Capacity_Utilization", 0)
    if cap > 90:
        reasons.append(f"Capacity at {cap:.0f}% — overload risk.")
    if not reasons:
        reasons.append(f"Risk score {score}/100 ({category}). All parameters within thresholds.")
    return reasons
