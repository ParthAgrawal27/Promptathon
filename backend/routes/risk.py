"""
VendorIQ — Risk API Routes
POST /calculate-risk, POST /update-weights, GET /risk-history
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import WeightUpdate, RiskCalculationRequest
from services.risk_service import (
    get_current_weights, update_weights, recalculate_all_vendors,
    calculate_single_vendor, get_risk_history
)
from services.event_service import get_active_events_as_dicts

router = APIRouter(prefix="/api", tags=["Risk Engine"])


@router.get("/weights")
def get_weights(db: Session = Depends(get_db)):
    """Get current weight configuration."""
    return {"weights": get_current_weights(db)}


@router.post("/update-weights")
async def api_update_weights(req: WeightUpdate, db: Session = Depends(get_db)):
    """
    Update risk engine weights and trigger full recalculation.
    All 5,000 vendor risk scores are recalculated with new weights.
    """
    weights = update_weights(db, req.weights)
    events = get_active_events_as_dicts(db)
    count = recalculate_all_vendors(db, weights, events)

    # Push WebSocket update
    from websocket_manager import manager
    await manager.send_dashboard_refresh()

    return {"weights": weights, "recalculated": count, "status": "success"}


@router.post("/calculate-risk")
async def api_calculate_risk(req: RiskCalculationRequest, db: Session = Depends(get_db)):
    """
    Calculate/recalculate risk scores.
    If vendor_ids provided: calculate for specific vendors.
    Otherwise: recalculate all vendors.
    """
    weights = req.weights or get_current_weights(db)
    events = get_active_events_as_dicts(db)

    if req.vendor_ids:
        results = []
        for vid in req.vendor_ids:
            r = calculate_single_vendor(db, vid, weights, events)
            if r:
                results.append(r)
        return {"results": results}
    else:
        count = recalculate_all_vendors(db, weights, events)
        from websocket_manager import manager
        await manager.send_dashboard_refresh()
        return {"recalculated": count, "status": "success"}


@router.get("/risk-history")
def api_risk_history(
    vendor_id: str = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Get risk score change history."""
    history = get_risk_history(db, vendor_id, limit)
    return {
        "history": [
            {
                "history_id": h.history_id,
                "vendor_id": h.vendor_id,
                "previous_risk_score": h.previous_risk_score,
                "updated_risk_score": h.updated_risk_score,
                "trigger_reason": h.trigger_reason,
                "timestamp": h.timestamp.isoformat() if h.timestamp else None,
            }
            for h in history
        ]
    }
