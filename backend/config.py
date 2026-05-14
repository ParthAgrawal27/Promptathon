"""
═══════════════════════════════════════════════════════════════
VendorIQ — Configuration Module
Centralised application configuration loaded from .env
═══════════════════════════════════════════════════════════════
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (one level up from backend/)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    """Application-wide settings pulled from environment variables."""

    # ── Database ─────────────────────────────────────────────
    # Try PostgreSQL first; if not available, fall back to SQLite
    _pg_url = os.getenv("DATABASE_URL", "")
    _sqlite_url = os.getenv("DATABASE_URL_SQLITE", "sqlite:///./vendoriq.db")

    @staticmethod
    def _test_pg_connection(url: str) -> bool:
        """Quick test if PostgreSQL is reachable."""
        try:
            import psycopg2
            parts = url.replace("postgresql://", "").split("@")
            host_part = parts[1] if len(parts) > 1 else "localhost:5432"
            host = host_part.split("/")[0].split(":")[0]
            port = int(host_part.split("/")[0].split(":")[1]) if ":" in host_part.split("/")[0] else 5432
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except Exception:
            return False

    if _pg_url and _pg_url.startswith("postgresql") and _test_pg_connection.__func__(_pg_url):
        DATABASE_URL: str = _pg_url
    else:
        DATABASE_URL: str = _sqlite_url

    # ── NewsAPI ──────────────────────────────────────────────
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")

    # ── App ──────────────────────────────────────────────────
    APP_ENV: str = os.getenv("APP_ENV", "development")
    APP_PORT: int = int(os.getenv("APP_PORT", "8000"))
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")

    # ── CORS ─────────────────────────────────────────────────
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # ── Scheduler ────────────────────────────────────────────
    NEWS_FETCH_INTERVAL: int = int(
        os.getenv("NEWS_FETCH_INTERVAL_MINUTES", "5")
    )
    RISK_RECALC_INTERVAL: int = int(
        os.getenv("RISK_RECALC_INTERVAL_MINUTES", "2")
    )

    # ── Logging ──────────────────────────────────────────────
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # ── Risk Engine Defaults ─────────────────────────────────
    DEFAULT_WEIGHTS: dict = {
        "OnTime_Delivery": 15,
        "Defect_Rate_PPM": 10,
        "Field_Failure_Rate": 8,
        "Financial_Stability": 15,
        "Inspection_Pass_Rate": 7,
        "Avg_Lead_Time": 10,
        "Shipment_Accuracy": 8,
        "Audit_Score": 7,
        "Capacity_Utilization": 5,
        "GPR_Score": 15,
    }

    # ── Risk Band Thresholds ─────────────────────────────────
    RISK_BANDS = {
        "Critical": 75,
        "High": 55,
        "Moderate": 35,
        "Low": 0,
    }


settings = Settings()
