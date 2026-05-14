"""
VendorIQ — Risk Service
Orchestrates risk calculation, weight management, and risk history tracking.
"""
import logging
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from models import Vendor, RiskHistory, WeightConfig
from risk_engine import calculate_vendor_risk, get_risk_band
from utils.risk_mapper import vendor_to_params
from config import settings

logger = logging.getLogger("vendoriq.services.risk")


def get_current_weights(db: Session) -> dict:
    """Get the current active weight configuration."""
    config = db.query(WeightConfig).filter(WeightConfig.profile_name == "active").first()
    if config and config.weights:
        return config.weights
    return {**settings.DEFAULT_WEIGHTS}


def update_weights(db: Session, new_weights: dict) -> dict:
    """Update the active weight configuration."""
    config = db.query(WeightConfig).filter(WeightConfig.profile_name == "active").first()
    if config:
        config.weights = new_weights
        config.updated_at = datetime.utcnow()
    else:
        config = WeightConfig(profile_name="active", weights=new_weights)
        db.add(config)
    db.commit()
    logger.info(f"Weights updated: {new_weights}")
    return new_weights


def recalculate_all_vendors(db: Session, weights: dict = None, active_events: list = None) -> int:
    """
    Recalculate risk scores for ALL vendors.
    Called after weight changes or new events.
    """
    if weights is None:
        weights = get_current_weights(db)

    vendors = db.query(Vendor).all()
    count = 0
    for vendor in vendors:
        params = vendor_to_params(vendor)
        result = calculate_vendor_risk(params, weights, active_events or [], vendor.region or "")
        old_score = vendor.final_risk_score or 0
        new_score = result["score"]

        # Only create history if score actually changed
        if abs(old_score - new_score) >= 1:
            history = RiskHistory(
                vendor_id=vendor.vendor_id,
                previous_risk_score=old_score,
                updated_risk_score=new_score,
                trigger_reason="Scheduled recalculation" if not active_events else "Event-driven recalculation",
                timestamp=datetime.utcnow(),
            )
            db.add(history)

        vendor.final_risk_score = new_score
        vendor.risk_category = result["category"]
        count += 1

    db.commit()
    logger.info(f"Recalculated {count} vendors")
    return count


def calculate_single_vendor(db: Session, vendor_id: str, weights: dict = None, events: list = None) -> Optional[dict]:
    """Calculate risk for a single vendor and return full analysis."""
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        return None

    if weights is None:
        weights = get_current_weights(db)

    params = vendor_to_params(vendor)
    result = calculate_vendor_risk(params, weights, events or [], vendor.region or "")

    return {
        "vendor_id": vendor.vendor_id,
        "vendor_name": vendor.vendor_name,
        "final_risk_score": result["score"],
        "risk_category": result["category"],
        "contributions": result["contributions"],
        "decision_tree": result["decision_tree"],
        "reasoning": result["reasoning"],
        "modified_params": result["modified_params"],
    }


def get_risk_history(db: Session, vendor_id: str = None, limit: int = 50) -> list:
    """Get risk history entries, optionally filtered by vendor."""
    q = db.query(RiskHistory).order_by(RiskHistory.timestamp.desc())
    if vendor_id:
        q = q.filter(RiskHistory.vendor_id == vendor_id)
    return q.limit(limit).all()
