"""
VendorIQ — Vendor Service
Business logic for vendor CRUD operations and CSV data ingestion.
"""
import csv
import logging
from pathlib import Path
from typing import List, Optional
from sqlalchemy.orm import Session
from models import Vendor
from utils.risk_mapper import vendor_to_params

logger = logging.getLogger("vendoriq.services.vendor")

# Deterministic metadata generation (mirrors frontend csvLoader.js)
PREFIXES = [
    'Apex', 'Global', 'Pacific', 'Dragon', 'Nordic', 'Atlas', 'Shenzhen',
    'Cairo', 'Lagos', 'Istanbul', 'Bangalore', 'EuroTech', 'TechFusion',
    'StarLine', 'Quantum', 'Nexus', 'Prime', 'Vertex', 'Sigma', 'Titan',
    'Zenith', 'Vanguard', 'Pinnacle', 'Meridian', 'Eclipse', 'Fusion',
    'Catalyst', 'Horizon', 'Spectrum', 'Forge', 'Orbital', 'Summit',
    'Phoenix', 'Beacon', 'Cobalt', 'Sterling', 'Iron Ridge', 'Sapphire',
    'Emerald', 'Onyx', 'Crimson', 'Azure', 'Jade', 'Amber', 'Slate',
]
SUFFIXES = [
    'Manufacturing', 'Electronics', 'Solutions', 'Corp', 'Industries',
    'Supply Co.', 'Logistics', 'Materials', 'Technologies', 'Systems',
    'Components', 'Services', 'International', 'Enterprises', 'Group',
    'Trading', 'Dynamics', 'Works', 'Foundry', 'Labs',
]
REGIONS = [
    {"name": "Asia Pacific", "countries": ["China", "Taiwan", "India", "Indonesia", "Japan", "South Korea", "Vietnam", "Thailand", "Malaysia", "Philippines"],
     "lats": [22, 25, 13, -6, 36, 37, 21, 14, 3, 14], "lngs": [114, 121, 78, 107, 140, 127, 106, 101, 102, 121]},
    {"name": "Europe", "countries": ["Germany", "Sweden", "France", "UK", "Italy", "Netherlands", "Spain", "Poland", "Czech Republic", "Switzerland"],
     "lats": [48, 59, 49, 52, 42, 52, 40, 52, 50, 47], "lngs": [12, 18, 2, -1, 12, 5, -4, 21, 15, 8]},
    {"name": "North America", "countries": ["USA", "Canada", "Mexico"],
     "lats": [38, 44, 19], "lngs": [-97, -79, -99]},
    {"name": "Middle East", "countries": ["UAE", "Turkey", "Saudi Arabia", "Israel", "Qatar"],
     "lats": [25, 41, 24, 32, 25], "lngs": [55, 29, 46, 35, 51]},
    {"name": "South America", "countries": ["Brazil", "Argentina", "Chile", "Colombia"],
     "lats": [-24, -34, -33, 5], "lngs": [-47, -58, -71, -74]},
    {"name": "Africa", "countries": ["Egypt", "Nigeria", "South Africa", "Kenya", "Morocco"],
     "lats": [30, 7, -34, -1, 34], "lngs": [31, 3, 18, 37, -7]},
]
CATEGORIES = [
    'Electronics', 'Semiconductors', 'Raw Materials', 'Chemicals',
    'Logistics', 'Technology', 'Textiles', 'Automotive', 'Pharma',
    'Aerospace', 'Energy', 'Food & Agriculture', 'Packaging',
]
TIERS = ['T1', 'T1', 'T1', 'T2', 'T2', 'T3']

CSV_PARAM_KEYS = [
    'OnTime_Delivery', 'Avg_Lead_Time', 'Lead_Time_Variability',
    'Emergency_Fulfillment', 'Shipment_Accuracy', 'Avg_Days_Late',
    'Defect_Rate_PPM', 'Field_Failure_Rate', 'Warranty_Claims',
    'Inspection_Pass_Rate', 'Certification_Score', 'Financial_Stability',
    'Revenue_Trend', 'Debt_Equity', 'DPO', 'Carrier_Dependency',
    'GPR_Score', 'Tariff_Exposure', 'Disaster_Risk', 'Single_Source',
    'Tier2_Visibility', 'Vendor_Tenure', 'Response_Time', 'Audit_Score',
    'Capacity_Utilization', 'Carbon_Score', 'Labor_Compliance', 'ESG_Score',
]


def _seeded_hash(s: str) -> int:
    h = 0
    for c in s:
        h = ((h << 5) - h + ord(c)) & 0xFFFFFFFF
    return h


def _generate_meta(vendor_id: str) -> dict:
    h = _seeded_hash(vendor_id)
    h2 = _seeded_hash(vendor_id + '_2')
    h3 = _seeded_hash(vendor_id + '_3')
    prefix = PREFIXES[h % len(PREFIXES)]
    suffix = SUFFIXES[h2 % len(SUFFIXES)]
    region_obj = REGIONS[h3 % len(REGIONS)]
    ci = (h + h2) % len(region_obj["countries"])
    country = region_obj["countries"][ci]
    lat = region_obj["lats"][ci] + ((h % 100) - 50) * 0.05
    lng = region_obj["lngs"][ci] + ((h2 % 100) - 50) * 0.05
    tier = TIERS[h % len(TIERS)]
    cat = CATEGORIES[(h + h3) % len(CATEGORIES)]
    cv = f"${(0.5 + (h % 100) * 0.08):.1f}M"
    return {"name": f"{prefix} {suffix}", "region": region_obj["name"], "country": country,
            "lat": lat, "lng": lng, "tier": tier, "category": cat, "contract_value": cv}


def load_csv_to_db(db: Session, csv_path: str = None):
    """Load vendor_risk_dataset_5000.csv into the database."""
    if csv_path is None:
        csv_path = str(Path(__file__).resolve().parent.parent.parent / "vendor_risk_dataset_5000.csv")

    if not Path(csv_path).exists():
        logger.error(f"CSV not found: {csv_path}")
        return 0

    existing = db.query(Vendor).count()
    if existing > 0:
        logger.info(f"Database already has {existing} vendors — skipping CSV import")
        return existing

    logger.info(f"Loading vendors from {csv_path}...")
    count = 0
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            vid = row.get('Vendor_ID', '').strip()
            if not vid:
                continue
            meta = _generate_meta(vid)
            vendor = Vendor(
                vendor_id=vid,
                vendor_name=meta["name"],
                country=meta["country"],
                region=meta["region"],
                category=meta["category"],
                tier=meta["tier"],
                contract_value=meta["contract_value"],
                lat=meta["lat"],
                lng=meta["lng"],
            )
            # Set all KPI columns from CSV
            for param_key in CSV_PARAM_KEYS:
                db_col = param_key.lower()
                if db_col == "ontime_delivery": db_col = "ontime_delivery"
                elif db_col == "avg_lead_time": db_col = "avg_lead_time"
                elif db_col == "lead_time_variability": db_col = "lead_time_variability"
                elif db_col == "emergency_fulfillment": db_col = "emergency_fulfillment"
                elif db_col == "shipment_accuracy": db_col = "shipment_accuracy"
                elif db_col == "avg_days_late": db_col = "avg_days_late"
                elif db_col == "defect_rate_ppm": db_col = "defect_rate_ppm"
                elif db_col == "field_failure_rate": db_col = "field_failure_rate"
                elif db_col == "warranty_claims": db_col = "warranty_claims"
                elif db_col == "inspection_pass_rate": db_col = "inspection_pass_rate"
                elif db_col == "certification_score": db_col = "certification_score"
                elif db_col == "financial_stability": db_col = "financial_stability"
                elif db_col == "revenue_trend": db_col = "revenue_trend"
                elif db_col == "debt_equity": db_col = "debt_equity"
                elif db_col == "carrier_dependency": db_col = "carrier_dependency"
                elif db_col == "gpr_score": db_col = "gpr_score"
                elif db_col == "tariff_exposure": db_col = "tariff_exposure"
                elif db_col == "disaster_risk": db_col = "disaster_risk"
                elif db_col == "single_source": db_col = "single_source"
                elif db_col == "tier2_visibility": db_col = "tier2_visibility"
                elif db_col == "vendor_tenure": db_col = "vendor_tenure"
                elif db_col == "response_time": db_col = "response_time"
                elif db_col == "audit_score": db_col = "audit_score"
                elif db_col == "capacity_utilization": db_col = "capacity_utilization"
                elif db_col == "carbon_score": db_col = "carbon_score"
                elif db_col == "labor_compliance": db_col = "labor_compliance"
                elif db_col == "esg_score": db_col = "esg_score"
                val = row.get(param_key, '0')
                try:
                    setattr(vendor, db_col, float(val) if val else 0.0)
                except (ValueError, TypeError):
                    setattr(vendor, db_col, 0.0)

            db.add(vendor)
            count += 1
            if count % 500 == 0:
                db.flush()

    db.commit()
    logger.info(f"Loaded {count} vendors into database")
    return count


def get_all_vendors(db: Session, page: int = 1, per_page: int = 100, region: str = None, category: str = None, risk_category: str = None, sort_by: str = "final_risk_score", sort_order: str = "desc"):
    """Get paginated vendor list with optional filters."""
    q = db.query(Vendor)
    if region:
        q = q.filter(Vendor.region == region)
    if category:
        q = q.filter(Vendor.category == category)
    if risk_category:
        q = q.filter(Vendor.risk_category == risk_category)
    total = q.count()
    if sort_order == "desc":
        q = q.order_by(getattr(Vendor, sort_by, Vendor.final_risk_score).desc())
    else:
        q = q.order_by(getattr(Vendor, sort_by, Vendor.final_risk_score).asc())
    vendors = q.offset((page - 1) * per_page).limit(per_page).all()
    return vendors, total


def get_vendor_by_id(db: Session, vendor_id: str) -> Optional[Vendor]:
    """Get a single vendor by ID."""
    # Support both "V123" and "123" formats
    v = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not v and not vendor_id.startswith("V"):
        v = db.query(Vendor).filter(Vendor.vendor_id == f"V{vendor_id}").first()
    return v


def vendor_to_response(vendor: Vendor) -> dict:
    """Convert Vendor ORM object to API response dict."""
    params = vendor_to_params(vendor)
    return {
        "vendor_id": vendor.vendor_id,
        "vendor_name": vendor.vendor_name,
        "country": vendor.country,
        "region": vendor.region,
        "category": vendor.category,
        "tier": vendor.tier,
        "contract_value": vendor.contract_value,
        "lat": vendor.lat,
        "lng": vendor.lng,
        "params": params,
        "final_risk_score": vendor.final_risk_score or 0,
        "risk_category": vendor.risk_category or "Low",
        "created_at": vendor.created_at.isoformat() if vendor.created_at else None,
    }
