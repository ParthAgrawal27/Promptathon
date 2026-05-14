"""
VendorIQ — Live Event Engine
NewsAPI integration for real-time disruption intelligence.
Fetches, parses, classifies, and scores global supply chain events.
"""
import aiohttp
import logging
from datetime import datetime
from typing import List, Dict, Optional
from config import settings

logger = logging.getLogger("vendoriq.event_engine")

# Keyword-to-event-type mapping for classification
EVENT_KEYWORDS = {
    "War": ["war", "military", "conflict", "invasion", "troops", "missile", "bombing", "armed forces", "defense", "nato"],
    "Maritime": ["canal", "shipping", "port", "maritime", "blockage", "suez", "strait", "vessel", "cargo ship", "container"],
    "Geopolitical": ["sanctions", "geopolitical", "diplomacy", "embassy", "treaty", "territorial", "annexation", "sovereignty"],
    "Trade": ["tariff", "trade war", "import ban", "export restriction", "quota", "trade agreement", "customs", "embargo"],
    "Labor": ["strike", "labor", "union", "walkout", "protest", "workers", "wage dispute", "shutdown"],
    "Natural Disaster": ["earthquake", "tsunami", "hurricane", "flood", "typhoon", "volcano", "wildfire", "cyclone", "tornado"],
    "Cyber": ["cyber attack", "ransomware", "data breach", "hacking", "cybersecurity", "malware"],
    "Energy": ["oil price", "fuel crisis", "energy shortage", "gas pipeline", "opec", "oil supply", "energy crisis"],
    "Health": ["pandemic", "outbreak", "epidemic", "virus", "quarantine", "lockdown", "covid", "WHO emergency"],
    "Logistics": ["supply chain", "logistics", "freight", "transportation", "warehouse", "delivery delay", "backlog"],
}

# Region detection from text
REGION_KEYWORDS = {
    "Asia Pacific": ["china", "taiwan", "india", "japan", "korea", "vietnam", "indonesia", "asia", "pacific", "southeast asia", "philippines", "thailand", "malaysia"],
    "Europe": ["europe", "eu", "germany", "france", "uk", "britain", "italy", "spain", "sweden", "poland", "netherlands"],
    "Middle East": ["middle east", "iran", "iraq", "saudi", "uae", "israel", "qatar", "yemen", "syria", "houthi", "red sea", "suez"],
    "North America": ["usa", "united states", "america", "canada", "mexico", "us"],
    "South America": ["brazil", "argentina", "chile", "colombia", "south america", "latin america"],
    "Africa": ["africa", "nigeria", "egypt", "kenya", "south africa", "morocco"],
}

# Severity scoring based on keyword density and type
SEVERITY_WEIGHTS = {
    "War": 5, "Natural Disaster": 5, "Health": 4, "Maritime": 4,
    "Cyber": 3, "Geopolitical": 3, "Trade": 3, "Energy": 3,
    "Labor": 2, "Logistics": 2,
}

# NewsAPI search queries for supply chain disruptions
SEARCH_QUERIES = [
    "supply chain disruption",
    "trade war tariff",
    "shipping canal blockage",
    "geopolitical conflict",
    "logistics crisis",
    "port strike",
    "natural disaster supply",
]


async def fetch_news_events() -> List[dict]:
    """
    Fetch live disruption news from NewsAPI.
    Returns parsed and classified events ready for DB storage.
    """
    if not settings.NEWS_API_KEY:
        logger.warning("No NEWS_API_KEY configured — skipping fetch")
        return []

    all_articles = []
    async with aiohttp.ClientSession() as session:
        for query in SEARCH_QUERIES[:3]:  # Limit queries to avoid rate limits
            url = (
                f"https://newsapi.org/v2/everything?"
                f"q={query}&language=en&sortBy=publishedAt&pageSize=5"
                f"&apiKey={settings.NEWS_API_KEY}"
            )
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        all_articles.extend(data.get("articles", []))
                    else:
                        logger.warning(f"NewsAPI returned {resp.status} for query: {query}")
            except Exception as e:
                logger.error(f"NewsAPI fetch error: {e}")

    # Deduplicate by title
    seen = set()
    unique = []
    for art in all_articles:
        title = art.get("title", "")
        if title and title not in seen:
            seen.add(title)
            unique.append(art)

    # Classify and score each article
    events = []
    for art in unique[:15]:  # Cap at 15 events per cycle
        parsed = classify_article(art)
        if parsed:
            events.append(parsed)

    logger.info(f"Fetched and classified {len(events)} events from NewsAPI")
    return events


def classify_article(article: dict) -> Optional[dict]:
    """
    Classify a news article into event type, severity, and region.
    """
    title = (article.get("title") or "").lower()
    desc = (article.get("description") or "").lower()
    text = f"{title} {desc}"

    if not text.strip() or text.strip() == "[removed]":
        return None

    # Detect event type
    event_type = "Logistics"  # default
    max_matches = 0
    for etype, keywords in EVENT_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in text)
        if matches > max_matches:
            max_matches = matches
            event_type = etype

    if max_matches == 0:
        return None  # No relevant keywords found

    # Detect region
    region = "Global"
    for reg, keywords in REGION_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            region = reg
            break

    # Calculate severity
    severity_score = SEVERITY_WEIGHTS.get(event_type, 2) + min(max_matches, 3)
    if severity_score >= 7:
        severity = "critical"
    elif severity_score >= 5:
        severity = "high"
    elif severity_score >= 3:
        severity = "moderate"
    else:
        severity = "low"

    return {
        "event_title": article.get("title", "Unknown Event")[:500],
        "event_type": event_type,
        "event_description": (article.get("description") or "")[:1000],
        "event_severity": severity,
        "affected_region": region,
        "source_url": article.get("url", ""),
    }


def get_event_impacts(event_type: str, severity: str) -> Dict[str, float]:
    """
    Map event type + severity to KPI impact multipliers.
    These multipliers modify vendor params during risk recalculation.
    >1.0 = increases risk (for non-inverted params)
    <1.0 = decreases performance (for inverted params)
    """
    base = {
        "War": {"GPR_Score": 1.4, "Financial_Stability": 0.75, "Avg_Lead_Time": 1.3, "Capacity_Utilization": 1.2},
        "Maritime": {"Avg_Lead_Time": 1.5, "Shipment_Accuracy": 0.8, "GPR_Score": 1.2, "OnTime_Delivery": 0.85},
        "Geopolitical": {"GPR_Score": 1.3, "Financial_Stability": 0.85, "Tariff_Exposure": 1.2},
        "Trade": {"Financial_Stability": 0.9, "GPR_Score": 1.15, "Avg_Lead_Time": 1.1},
        "Labor": {"OnTime_Delivery": 0.85, "Capacity_Utilization": 1.2, "Avg_Lead_Time": 1.15},
        "Natural Disaster": {"Capacity_Utilization": 1.4, "OnTime_Delivery": 0.6, "Financial_Stability": 0.8, "Avg_Lead_Time": 1.5},
        "Cyber": {"Shipment_Accuracy": 0.75, "OnTime_Delivery": 0.85, "Audit_Score": 0.85},
        "Energy": {"Avg_Lead_Time": 1.25, "Financial_Stability": 0.88, "GPR_Score": 1.15},
        "Health": {"Avg_Lead_Time": 1.6, "OnTime_Delivery": 0.65, "Capacity_Utilization": 1.35},
        "Logistics": {"Avg_Lead_Time": 1.3, "Shipment_Accuracy": 0.85, "OnTime_Delivery": 0.8},
    }
    impacts = base.get(event_type, {"GPR_Score": 1.1})

    # Amplify impacts based on severity
    multiplier = {"critical": 1.3, "high": 1.1, "moderate": 1.0, "low": 0.8}.get(severity, 1.0)
    amplified = {}
    for param, val in impacts.items():
        if val > 1:
            amplified[param] = 1 + (val - 1) * multiplier
        else:
            amplified[param] = 1 - (1 - val) * multiplier
    return amplified
