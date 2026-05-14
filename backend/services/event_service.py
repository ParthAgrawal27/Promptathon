"""
VendorIQ — Event Service
Manages live event storage, impact mapping, and vendor impact application.
"""
import logging
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from models import LiveEvent, EventImpact, Vendor
from event_engine import get_event_impacts
from utils.event_parser import is_duplicate_event

logger = logging.getLogger("vendoriq.services.event")


def store_event(db: Session, event_data: dict) -> LiveEvent:
    """Store a new live event in the database."""
    event = LiveEvent(
        event_title=event_data["event_title"],
        event_type=event_data.get("event_type", "Logistics"),
        event_description=event_data.get("event_description", ""),
        event_severity=event_data.get("event_severity", "moderate"),
        affected_region=event_data.get("affected_region", "Global"),
        source_url=event_data.get("source_url", ""),
        is_active=1,
        created_at=datetime.utcnow(),
    )
    db.add(event)
    db.flush()  # Get the event_id
    return event


def apply_event_impacts(db: Session, event: LiveEvent) -> List[EventImpact]:
    """
    Map an event to affected vendors and record KPI impacts.
    Returns list of created EventImpact records.
    """
    impacts_map = get_event_impacts(event.event_type, event.event_severity)
    region = event.affected_region

    # Find affected vendors
    if region == "Global":
        vendors = db.query(Vendor).all()
    else:
        vendors = db.query(Vendor).filter(Vendor.region == region).all()

    impact_records = []
    for vendor in vendors:
        for param, multiplier in impacts_map.items():
            impact = EventImpact(
                event_id=event.event_id,
                vendor_id=vendor.vendor_id,
                impacted_parameter=param,
                impact_value=multiplier,
                created_at=datetime.utcnow(),
            )
            db.add(impact)
            impact_records.append(impact)

    db.flush()
    logger.info(f"Applied {len(impact_records)} impacts from event '{event.event_title}'")
    return impact_records


def get_active_events(db: Session) -> List[LiveEvent]:
    """Get all currently active events."""
    return db.query(LiveEvent).filter(LiveEvent.is_active == 1).order_by(LiveEvent.created_at.desc()).all()


def get_all_events(db: Session, limit: int = 50) -> List[LiveEvent]:
    """Get recent events."""
    return db.query(LiveEvent).order_by(LiveEvent.created_at.desc()).limit(limit).all()


def get_event_impact_records(db: Session, event_id: int = None, limit: int = 100) -> list:
    """Get event impact records."""
    q = db.query(EventImpact).order_by(EventImpact.created_at.desc())
    if event_id:
        q = q.filter(EventImpact.event_id == event_id)
    return q.limit(limit).all()


def get_active_events_as_dicts(db: Session) -> list:
    """Convert active events to the dict format expected by risk_engine."""
    events = get_active_events(db)
    result = []
    for e in events:
        impacts = get_event_impacts(e.event_type, e.event_severity)
        result.append({
            "id": e.event_id,
            "name": e.event_title,
            "type": e.event_type,
            "severity": e.event_severity,
            "region": e.affected_region,
            "impacts": impacts,
        })
    return result
