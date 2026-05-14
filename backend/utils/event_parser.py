"""
VendorIQ — Event Parser Utility
Helpers for parsing and deduplicating news events.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import LiveEvent


def is_duplicate_event(db: Session, title: str, hours: int = 12) -> bool:
    """Check if a similar event was already stored within the time window."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    existing = db.query(LiveEvent).filter(
        LiveEvent.event_title == title,
        LiveEvent.created_at >= cutoff
    ).first()
    return existing is not None


def severity_to_score(severity: str) -> int:
    """Convert severity string to numeric score for sorting."""
    return {"critical": 4, "high": 3, "moderate": 2, "low": 1}.get(severity, 0)
