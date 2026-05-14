"""
VendorIQ — Simulation API Routes
POST /simulate
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import SimulationRequest
from services.simulation_service import run_simulation

router = APIRouter(prefix="/api", tags=["Simulation"])


@router.post("/simulate")
def api_simulate(req: SimulationRequest, db: Session = Depends(get_db)):
    """
    Run a what-if simulation.
    Compare baseline vs modified risk scores with hypothetical events and KPI changes.
    """
    inject_events = None
    if req.inject_events:
        inject_events = [e.dict() for e in req.inject_events]

    result = run_simulation(
        db,
        vendor_ids=req.vendor_ids,
        modified_params=req.modified_params,
        inject_events=inject_events,
        custom_weights=req.custom_weights,
    )
    return result
