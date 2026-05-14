"""
VendorIQ — Alerts API Routes
GET /alerts
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.alert_service import get_alerts, get_unread_count, mark_all_read, mark_alert_read

router = APIRouter(prefix="/api", tags=["Alerts"])


@router.get("/alerts")
def list_alerts(
    severity: str = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Get recent alerts with optional severity filter."""
    alerts = get_alerts(db, severity, limit)
    return {
        "alerts": [
            {
                "alert_id": a.alert_id,
                "vendor_id": a.vendor_id,
                "alert_type": a.alert_type,
                "alert_message": a.alert_message,
                "severity": a.severity,
                "is_read": a.is_read,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ],
        "unread_count": get_unread_count(db),
    }


@router.post("/alerts/mark-read/{alert_id}")
def api_mark_read(alert_id: int, db: Session = Depends(get_db)):
    """Mark a single alert as read."""
    success = mark_alert_read(db, alert_id)
    return {"status": "success" if success else "not_found"}


@router.post("/alerts/mark-all-read")
def api_mark_all_read(db: Session = Depends(get_db)):
    """Mark all alerts as read."""
    mark_all_read(db)
    return {"status": "success"}
