"""
VendorIQ — Alert Service
Business logic for alert queries and management.
"""
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from models import Alert

logger = logging.getLogger("vendoriq.services.alert")


def get_alerts(db: Session, severity: str = None, limit: int = 100) -> List[Alert]:
    """Get recent alerts with optional severity filter."""
    q = db.query(Alert).order_by(Alert.created_at.desc())
    if severity:
        q = q.filter(Alert.severity == severity)
    return q.limit(limit).all()


def get_unread_count(db: Session) -> int:
    """Count unread alerts."""
    return db.query(Alert).filter(Alert.is_read == 0).count()


def mark_alert_read(db: Session, alert_id: int) -> bool:
    """Mark a single alert as read."""
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if alert:
        alert.is_read = 1
        db.commit()
        return True
    return False


def mark_all_read(db: Session):
    """Mark all alerts as read."""
    db.query(Alert).filter(Alert.is_read == 0).update({Alert.is_read: 1})
    db.commit()
