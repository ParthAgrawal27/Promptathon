"""
VendorIQ — Events API Routes
GET /live-events, POST /inject-event, GET /event-impacts
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import EventInject
from services.event_service import (
    store_event, apply_event_impacts, get_all_events,
    get_event_impact_records, get_active_events_as_dicts
)
from services.risk_service import recalculate_all_vendors, get_current_weights
from alerts import generate_event_alert
from utils.event_parser import is_duplicate_event

router = APIRouter(prefix="/api", tags=["Events"])


@router.get("/live-events")
def list_events(limit: int = 50, db: Session = Depends(get_db)):
    """Get recent live disruption events."""
    events = get_all_events(db, limit)
    return {
        "events": [
            {
                "event_id": e.event_id,
                "event_title": e.event_title,
                "event_type": e.event_type,
                "event_description": e.event_description,
                "event_severity": e.event_severity,
                "affected_region": e.affected_region,
                "source_url": e.source_url,
                "is_active": e.is_active,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in events
        ]
    }


@router.post("/inject-event")
async def inject_event(req: EventInject, db: Session = Depends(get_db)):
    """
    Manually inject a disruption event.
    Triggers: impact mapping → risk recalculation → alert generation → WS push.
    """
    event = store_event(db, req.dict())
    impacts = apply_event_impacts(db, event)
    generate_event_alert(event.event_title, event.event_type, event.event_severity, event.affected_region, db)

    # Recalculate all vendor scores with new event
    weights = get_current_weights(db)
    active_events = get_active_events_as_dicts(db)
    recalculate_all_vendors(db, weights, active_events)
    db.commit()

    # Push WebSocket updates
    from websocket_manager import manager
    await manager.send_event({
        "event_id": event.event_id,
        "event_title": event.event_title,
        "event_type": event.event_type,
        "event_severity": event.event_severity,
        "affected_region": event.affected_region,
    })
    await manager.send_dashboard_refresh()

    return {
        "status": "success",
        "event_id": event.event_id,
        "impacts_created": len(impacts),
    }


@router.get("/event-impacts")
def list_event_impacts(event_id: int = None, limit: int = 100, db: Session = Depends(get_db)):
    """Get event impact records."""
    impacts = get_event_impact_records(db, event_id, limit)
    return {
        "impacts": [
            {
                "impact_id": i.impact_id,
                "event_id": i.event_id,
                "vendor_id": i.vendor_id,
                "impacted_parameter": i.impacted_parameter,
                "impact_value": i.impact_value,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in impacts
        ]
    }


@router.post("/trigger-news-fetch")
async def trigger_news_fetch():
    """
    Manually trigger a fetch from NewsAPI.
    This will bypass the scheduler interval and fetch immediately.
    """
    from scheduler import news_fetch_job
    await news_fetch_job()
    return {"status": "success", "message": "NewsAPI fetch triggered successfully."}
