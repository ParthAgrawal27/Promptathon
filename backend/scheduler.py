"""
VendorIQ — Background Scheduler
APScheduler-based background tasks for NewsAPI polling and risk recalculation.
"""
import asyncio
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from database import SessionLocal
from config import settings
from event_engine import fetch_news_events
from services.event_service import store_event, apply_event_impacts, get_active_events_as_dicts
from services.risk_service import recalculate_all_vendors, get_current_weights
from alerts import generate_event_alert, cleanup_old_alerts
from utils.event_parser import is_duplicate_event
from websocket_manager import manager

logger = logging.getLogger("vendoriq.scheduler")

scheduler = AsyncIOScheduler()


async def news_fetch_job():
    """
    Scheduled job: Fetch news from NewsAPI, classify, store, and trigger recalculation.
    
    Flow: NewsAPI → Classification → DB Storage → Impact Mapping → 
          Risk Recalculation → Alert Generation → WebSocket Push
    """
    logger.info("=== NewsAPI fetch job started ===")
    db = SessionLocal()
    try:
        events = await fetch_news_events()
        new_count = 0

        for evt_data in events:
            # Skip duplicates
            if is_duplicate_event(db, evt_data["event_title"]):
                continue

            # Store event
            event = store_event(db, evt_data)
            apply_event_impacts(db, event)
            generate_event_alert(
                event.event_title, event.event_type,
                event.event_severity, event.affected_region, db
            )
            new_count += 1

            # Push event via WebSocket
            await manager.send_event({
                "event_id": event.event_id,
                "event_title": event.event_title,
                "event_type": event.event_type,
                "event_severity": event.event_severity,
                "affected_region": event.affected_region,
            })

        if new_count > 0:
            # Recalculate all vendor risks with new events
            weights = get_current_weights(db)
            active_events = get_active_events_as_dicts(db)
            recalculate_all_vendors(db, weights, active_events)
            db.commit()

            # Push dashboard refresh
            await manager.send_dashboard_refresh()
            logger.info(f"Processed {new_count} new events, recalculated all vendors")
        else:
            db.commit()
            logger.info("No new events found")

        # Cleanup old alerts periodically
        cleanup_old_alerts(db)

    except Exception as e:
        logger.error(f"News fetch job error: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


async def risk_recalc_job():
    """Periodic risk recalculation to keep scores fresh."""
    logger.info("=== Periodic risk recalculation ===")
    db = SessionLocal()
    try:
        weights = get_current_weights(db)
        active_events = get_active_events_as_dicts(db)
        count = recalculate_all_vendors(db, weights, active_events)
        db.commit()
        await manager.send_dashboard_refresh()
        logger.info(f"Recalculated {count} vendors")
    except Exception as e:
        logger.error(f"Risk recalc job error: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Initialize and start the background scheduler."""
    # News fetch every N minutes
    scheduler.add_job(
        news_fetch_job,
        trigger=IntervalTrigger(minutes=settings.NEWS_FETCH_INTERVAL),
        id="news_fetch",
        name="NewsAPI Fetch & Process",
        replace_existing=True,
    )

    # Risk recalculation every N minutes
    scheduler.add_job(
        risk_recalc_job,
        trigger=IntervalTrigger(minutes=settings.RISK_RECALC_INTERVAL),
        id="risk_recalc",
        name="Periodic Risk Recalculation",
        replace_existing=True,
    )

    scheduler.start()
    logger.info(
        f"Scheduler started: news every {settings.NEWS_FETCH_INTERVAL}min, "
        f"recalc every {settings.RISK_RECALC_INTERVAL}min"
    )


def stop_scheduler():
    """Gracefully stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
