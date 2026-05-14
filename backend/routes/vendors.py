"""
VendorIQ — Vendor API Routes
GET /vendors, GET /vendor/{id}
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.vendor_service import get_all_vendors, get_vendor_by_id, vendor_to_response
from services.risk_service import calculate_single_vendor, get_current_weights
from services.event_service import get_active_events_as_dicts

router = APIRouter(prefix="/api", tags=["Vendors"])


@router.get("/vendors")
def list_vendors(
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=5000),
    region: str = None,
    category: str = None,
    risk_category: str = None,
    sort_by: str = "final_risk_score",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
):
    """
    Get paginated list of all vendors with risk scores.
    Supports filtering by region, category, and risk category.
    """
    vendors, total = get_all_vendors(db, page, per_page, region, category, risk_category, sort_by, sort_order)
    return {
        "vendors": [vendor_to_response(v) for v in vendors],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/vendor/{vendor_id}")
def get_vendor(vendor_id: str, db: Session = Depends(get_db)):
    """
    Get detailed vendor profile with full risk analysis,
    including contributions, decision tree, and reasoning.
    """
    vendor = get_vendor_by_id(db, vendor_id)
    if not vendor:
        return {"error": "Vendor not found"}, 404

    weights = get_current_weights(db)
    events = get_active_events_as_dicts(db)
    analysis = calculate_single_vendor(db, vendor.vendor_id, weights, events)

    response = vendor_to_response(vendor)
    if analysis:
        response["contributions"] = analysis["contributions"]
        response["decision_tree"] = analysis["decision_tree"]
        response["reasoning"] = analysis["reasoning"]
        response["modified_params"] = analysis["modified_params"]

    return response
