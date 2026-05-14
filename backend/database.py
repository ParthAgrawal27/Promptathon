"""
═══════════════════════════════════════════════════════════════
VendorIQ — Database Engine & Session Management
SQLAlchemy async-compatible setup with SQLite fallback
═══════════════════════════════════════════════════════════════
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# ── Engine Creation ──────────────────────────────────────────
# SQLite requires connect_args for thread safety
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,       # Verify connections before use
    echo=False,                # Set True for SQL debug logging
)

# ── Session Factory ──────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Declarative Base ─────────────────────────────────────────
Base = declarative_base()


def get_db():
    """
    FastAPI dependency — yields a database session per request.
    Automatically closes the session when the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables defined in models.py."""
    import models  # noqa: F401 — ensures models are registered
    Base.metadata.create_all(bind=engine)
