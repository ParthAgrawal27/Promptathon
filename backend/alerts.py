"""
VendorIQ — Smart Alert Engine
Generates dynamic alerts based on vendor risk scores and thresholds.
"""
import logging
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from models import Alert, Vendor

logger = logging.getLogger("vendoriq.alerts")

# Alert threshold rules
ALERT_RULES = [
    {"condition": lambda v: v.final_risk_score >= 80, "type": "Risk Threshold", "severity": "critical",
     "msg": lambda v: f"{v.vendor_name} risk score {v.final_risk_score:.0f}/100 exceeds critical threshold (80). Immediate review required."},
    {"condition": lambda v: v.final_risk_score >= 65, "type": "Risk Threshold", "severity": "high",
     "msg": lambda v: f"{v.vendor_name} risk score {v.final_risk_score:.0f}/100 is elevated. Monitor closely."},
    {"condition": lambda v: (v.capacity_utilization or 0) > 90, "type": "Capacity", "severity": "high",
     "msg": lambda v: f"{v.vendor_name} capacity utilization at {v.capacity_utilization:.0f}% — overload warning."},
    {"condition": lambda v: (v.shipment_accuracy or 100) < 75, "type": "Logistics", "severity": "high",
     "msg": lambda v: f"{v.vendor_name} shipment accuracy at {v.shipment_accuracy:.1f}% — logistics alert."},
    {"condition": lambda v: (v.ontime_delivery or 100) < 65, "type": "Delivery", "severity": "high",
     "msg": lambda v: f"{v.vendor_name} on-time delivery at {v.ontime_delivery:.1f}% — supply continuity risk."},
    {"condition": lambda v: (v.financial_stability or 100) < 45, "type": "Financial", "severity": "critical",
     "msg": lambda v: f"{v.vendor_name} financial stability at {v.financial_stability:.0f}/100 — financial distress."},
    {"condition": lambda v: (v.gpr_score or 0) > 70, "type": "Geopolitical", "severity": "high",
     "msg": lambda v: f"{v.vendor_name} geopolitical risk {v.gpr_score:.0f}/100 — regional instability."},
    {"condition": lambda v: (v.defect_rate_ppm or 0) > 1800, "type": "Quality", "severity": "moderate",
     "msg": lambda v: f"{v.vendor_name} defect rate {v.defect_rate_ppm:.0f} PPM exceeds 1800 threshold."},
]


def generate_vendor_alerts(vendor: Vendor, db: Session) -> List[Alert]:
    """Generate alerts for a single vendor based on threshold rules."""
    generated = []
    for rule in ALERT_RULES:
        try:
            if rule["condition"](vendor):
                alert = Alert(
                    vendor_id=vendor.vendor_id,
                    alert_type=rule["type"],
                    alert_message=rule["msg"](vendor),
                    severity=rule["severity"],
                    created_at=datetime.utcnow(),
                )
                db.add(alert)
                generated.append(alert)
        except Exception as e:
            logger.error(f"Alert rule error for {vendor.vendor_id}: {e}")
    return generated


def generate_event_alert(event_title: str, event_type: str, severity: str, region: str, db: Session) -> Alert:
    """Generate a system-wide alert for a detected disruption event."""
    alert = Alert(
        vendor_id=None,
        alert_type="Disruption",
        alert_message=f"Live disruption detected: {event_title} ({event_type}) affecting {region}.",
        severity=severity,
        created_at=datetime.utcnow(),
    )
    db.add(alert)
    return alert


def cleanup_old_alerts(db: Session, keep_count: int = 500):
    """Keep only the most recent alerts to prevent DB bloat."""
    total = db.query(Alert).count()
    if total > keep_count:
        oldest = db.query(Alert).order_by(Alert.created_at.asc()).limit(total - keep_count).all()
        for a in oldest:
            db.delete(a)
        db.commit()
        logger.info(f"Cleaned up {len(oldest)} old alerts")
