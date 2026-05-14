"""
═══════════════════════════════════════════════════════════════
VendorIQ — FastAPI Application Entry Point
Enterprise-grade Vendor Risk Intelligence & Decision Support Platform

System Flow:
  NewsAPI → Event Engine → Severity Analysis → Vendor Impact Mapping
  → KPI Adjustment → Dynamic Risk Recalculation → Alert Generation
  → PostgreSQL Storage → WebSocket Push → Real-Time Dashboard Update
═══════════════════════════════════════════════════════════════
"""

import sys
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import settings
from database import init_db, SessionLocal
from scheduler import start_scheduler, stop_scheduler

# ── Logging Setup ────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s │ %(name)-30s │ %(levelname)-8s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("vendoriq.main")


# ── Lifespan (startup/shutdown) ──────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: init DB, load data, start scheduler."""
    logger.info("═══ VendorIQ Backend Starting ═══")

    # 1. Initialize database tables
    init_db()
    logger.info("Database initialized")

    # 2. Load CSV vendor data into DB (first run only)
    db = SessionLocal()
    try:
        from services.vendor_service import load_csv_to_db
        count = load_csv_to_db(db)
        logger.info(f"Vendor data: {count} vendors in database")

        # 3. Initial risk score calculation
        from services.risk_service import recalculate_all_vendors, get_current_weights
        from services.event_service import get_active_events_as_dicts
        weights = get_current_weights(db)
        active_events = get_active_events_as_dicts(db)
        recalculate_all_vendors(db, weights, active_events)
        logger.info("Initial risk scores calculated")

        # 4. Generate initial alerts
        from models import Vendor, Alert
        from alerts import generate_vendor_alerts
        # Only generate if no alerts exist yet
        if db.query(Alert).count() == 0:
            vendors = db.query(Vendor).filter(Vendor.final_risk_score >= 55).limit(50).all()
            for v in vendors:
                generate_vendor_alerts(v, db)
            db.commit()
            logger.info(f"Generated initial alerts for {len(vendors)} high-risk vendors")

    except Exception as e:
        logger.error(f"Startup data loading error: {e}", exc_info=True)
    finally:
        db.close()

    # 5. Start background scheduler
    start_scheduler()
    logger.info("═══ VendorIQ Backend Ready ═══")

    yield  # App is running

    # Shutdown
    stop_scheduler()
    logger.info("═══ VendorIQ Backend Stopped ═══")


# ── FastAPI Application ──────────────────────────────────────
app = FastAPI(
    title="VendorIQ — Vendor Risk Intelligence Platform",
    description=(
        "Enterprise-grade analytical intelligence engine for supply chain risk management. "
        "Real-time heuristic scoring, live event detection, WebSocket updates, "
        "and what-if simulation — powered by configurable risk analytics."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS Middleware ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register API Routes ─────────────────────────────────────
from routes.vendors import router as vendors_router
from routes.risk import router as risk_router
from routes.events import router as events_router
from routes.alerts import router as alerts_router
from routes.simulation import router as simulation_router
from routes.websocket import router as ws_router

app.include_router(vendors_router)
app.include_router(risk_router)
app.include_router(events_router)
app.include_router(alerts_router)
app.include_router(simulation_router)
app.include_router(ws_router)


# ── Health Check ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    from websocket_manager import manager
    return {
        "status": "online",
        "platform": "VendorIQ Risk Intelligence Engine",
        "version": "1.0.0",
        "ws_connections": manager.connection_count,
    }


@app.get("/api/stats", tags=["Health"])
def api_stats():
    """Get system-wide statistics."""
    db = SessionLocal()
    try:
        from models import Vendor, LiveEvent, Alert, RiskHistory
        return {
            "vendors": db.query(Vendor).count(),
            "events": db.query(LiveEvent).count(),
            "alerts": db.query(Alert).count(),
            "risk_history": db.query(RiskHistory).count(),
            "active_events": db.query(LiveEvent).filter(LiveEvent.is_active == 1).count(),
        }
    finally:
        db.close()


# ── Run with Uvicorn ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_ENV == "development",
        log_level=settings.LOG_LEVEL.lower(),
    )
