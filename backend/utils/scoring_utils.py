"""
VendorIQ — Scoring Utilities
Helper functions for risk score computation and statistics.
"""
from typing import List, Dict


def compute_portfolio_stats(vendors: list) -> dict:
    """Compute aggregate portfolio risk statistics."""
    if not vendors:
        return {"critical": 0, "high": 0, "moderate": 0, "low": 0, "avg": 0, "total": 0}

    critical = sum(1 for v in vendors if v.get("risk_category") == "Critical" or v.get("final_risk_score", 0) >= 75)
    high = sum(1 for v in vendors if v.get("risk_category") == "High" or 55 <= v.get("final_risk_score", 0) < 75)
    moderate = sum(1 for v in vendors if v.get("risk_category") == "Moderate" or 35 <= v.get("final_risk_score", 0) < 55)
    low = sum(1 for v in vendors if v.get("risk_category") == "Low" or v.get("final_risk_score", 0) < 35)
    avg = round(sum(v.get("final_risk_score", 0) for v in vendors) / len(vendors))

    return {"critical": critical, "high": high, "moderate": moderate, "low": low, "avg": avg, "total": len(vendors)}


def rank_vendors(vendors: list, key: str = "final_risk_score", reverse: bool = True) -> list:
    """Sort vendors by risk score (highest risk first by default)."""
    return sorted(vendors, key=lambda v: v.get(key, 0), reverse=reverse)
