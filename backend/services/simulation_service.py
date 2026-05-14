"""
VendorIQ — Simulation Service
What-if analysis engine for hypothetical scenario modeling.
"""
import logging
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from models import Vendor
from risk_engine import calculate_vendor_risk, get_risk_band
from utils.risk_mapper import vendor_to_params
from services.risk_service import get_current_weights

logger = logging.getLogger("vendoriq.services.simulation")


def run_simulation(
    db: Session,
    vendor_ids: Optional[List[str]] = None,
    modified_params: Optional[Dict[str, float]] = None,
    inject_events: Optional[List[dict]] = None,
    custom_weights: Optional[Dict[str, float]] = None,
) -> dict:
    """
    Run a what-if simulation comparing baseline vs modified risk scores.

    Args:
        vendor_ids: Specific vendors to simulate (None = top 100 by risk)
        modified_params: KPI overrides to apply across all vendors
        inject_events: Hypothetical events to simulate
        custom_weights: Custom weight configuration
    """
    weights = custom_weights or get_current_weights(db)

    # Get target vendors
    if vendor_ids:
        vendors = db.query(Vendor).filter(Vendor.vendor_id.in_(vendor_ids)).all()
    else:
        vendors = db.query(Vendor).order_by(Vendor.final_risk_score.desc()).limit(100).all()

    # Convert injected events to engine format
    sim_events = []
    if inject_events:
        for evt in inject_events:
            from event_engine import get_event_impacts
            impacts = get_event_impacts(evt.get("event_type", "Logistics"), evt.get("event_severity", "moderate"))
            sim_events.append({
                "type": evt.get("event_type", "Logistics"),
                "region": evt.get("affected_region", "Global"),
                "impacts": impacts,
            })

    results = []
    for vendor in vendors:
        params = vendor_to_params(vendor)

        # Baseline (no events, no modifications)
        baseline = calculate_vendor_risk(params, weights, [], vendor.region or "")

        # Apply param modifications for simulation
        sim_params = {**params}
        if modified_params:
            for k, v in modified_params.items():
                if k in sim_params:
                    sim_params[k] = v

        # Simulated (with events + modifications)
        simulated = calculate_vendor_risk(sim_params, weights, sim_events, vendor.region or "")

        results.append({
            "vendor_id": vendor.vendor_id,
            "vendor_name": vendor.vendor_name,
            "baseline_score": baseline["score"],
            "simulated_score": simulated["score"],
            "delta": simulated["score"] - baseline["score"],
            "baseline_category": baseline["category"],
            "simulated_category": simulated["category"],
        })

    # Aggregate stats
    avg_base = round(sum(r["baseline_score"] for r in results) / len(results)) if results else 0
    avg_sim = round(sum(r["simulated_score"] for r in results) / len(results)) if results else 0

    return {
        "vendors": sorted(results, key=lambda r: r["delta"], reverse=True),
        "avg_baseline": avg_base,
        "avg_simulated": avg_sim,
        "avg_delta": avg_sim - avg_base,
        "critical_count_before": sum(1 for r in results if r["baseline_category"] == "Critical"),
        "critical_count_after": sum(1 for r in results if r["simulated_category"] == "Critical"),
        "high_count_before": sum(1 for r in results if r["baseline_category"] == "High"),
        "high_count_after": sum(1 for r in results if r["simulated_category"] == "High"),
    }
