"""
═══════════════════════════════════════════════════════════════
VendorIQ — Pydantic Schemas
Request/response validation for all API endpoints
═══════════════════════════════════════════════════════════════
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime


# ═══════════════════════════════════════════════════════════════
# VENDOR SCHEMAS
# ═══════════════════════════════════════════════════════════════

class VendorParams(BaseModel):
    """All 28 KPI parameters for a vendor."""
    OnTime_Delivery: float = 0
    Avg_Lead_Time: float = 0
    Lead_Time_Variability: float = 0
    Emergency_Fulfillment: float = 0
    Shipment_Accuracy: float = 0
    Avg_Days_Late: float = 0
    Defect_Rate_PPM: float = 0
    Field_Failure_Rate: float = 0
    Warranty_Claims: float = 0
    Inspection_Pass_Rate: float = 0
    Certification_Score: float = 0
    Financial_Stability: float = 0
    Revenue_Trend: float = 0
    Debt_Equity: float = 0
    DPO: float = 0
    Carrier_Dependency: float = 0
    GPR_Score: float = 0
    Tariff_Exposure: float = 0
    Disaster_Risk: float = 0
    Single_Source: float = 0
    Tier2_Visibility: float = 0
    Vendor_Tenure: float = 0
    Response_Time: float = 0
    Audit_Score: float = 0
    Capacity_Utilization: float = 0
    Carbon_Score: float = 0
    Labor_Compliance: float = 0
    ESG_Score: float = 0


class VendorResponse(BaseModel):
    """Vendor data returned to the frontend."""
    vendor_id: str
    vendor_name: str
    country: str
    region: str
    category: Optional[str] = None
    tier: Optional[str] = None
    contract_value: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    params: VendorParams
    final_risk_score: float
    risk_category: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VendorListResponse(BaseModel):
    """Paginated vendor list."""
    vendors: List[VendorResponse]
    total: int
    page: int
    per_page: int


# ═══════════════════════════════════════════════════════════════
# RISK ENGINE SCHEMAS
# ═══════════════════════════════════════════════════════════════

class WeightUpdate(BaseModel):
    """Request to update risk engine weights."""
    weights: Dict[str, float] = Field(
        ...,
        description="Map of KPI parameter name → weight (should sum to ~100)"
    )


class RiskCalculationRequest(BaseModel):
    """Request to calculate risk for specific vendors."""
    vendor_ids: Optional[List[str]] = None  # None = recalculate all
    weights: Optional[Dict[str, float]] = None  # None = use current weights


class ContributionDetail(BaseModel):
    """Per-parameter contribution to final risk score."""
    normalized: float
    weight: float
    contribution: float
    raw: float


class ExplainabilityNode(BaseModel):
    """Decision tree node for risk explainability."""
    condition: str
    result: str
    triggered: bool
    impact: str


class RiskCalculationResponse(BaseModel):
    """Full risk analysis response with explainability."""
    vendor_id: str
    vendor_name: str
    final_risk_score: float
    risk_category: str
    contributions: Dict[str, ContributionDetail]
    decision_tree: List[ExplainabilityNode]
    reasoning: List[str]
    modified_params: Optional[Dict[str, float]] = None


class RiskHistoryResponse(BaseModel):
    """Single risk history entry."""
    history_id: int
    vendor_id: str
    previous_risk_score: float
    updated_risk_score: float
    trigger_reason: str
    timestamp: datetime

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════
# EVENT SCHEMAS
# ═══════════════════════════════════════════════════════════════

class EventInject(BaseModel):
    """Manual event injection request."""
    event_title: str
    event_type: str = "Custom"
    event_description: Optional[str] = ""
    event_severity: str = "moderate"  # critical, high, moderate, low
    affected_region: str = "Global"


class LiveEventResponse(BaseModel):
    """Live event data returned to frontend."""
    event_id: int
    event_title: str
    event_type: str
    event_description: Optional[str] = None
    event_severity: str
    affected_region: str
    source_url: Optional[str] = None
    is_active: int = 1
    created_at: datetime

    class Config:
        from_attributes = True


class EventImpactResponse(BaseModel):
    """Event impact on a specific vendor."""
    impact_id: int
    event_id: int
    vendor_id: str
    impacted_parameter: str
    impact_value: float
    created_at: datetime

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════
# ALERT SCHEMAS
# ═══════════════════════════════════════════════════════════════

class AlertResponse(BaseModel):
    """Alert data returned to frontend."""
    alert_id: int
    vendor_id: Optional[str] = None
    alert_type: str
    alert_message: str
    severity: str
    is_read: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════
# SIMULATION SCHEMAS
# ═══════════════════════════════════════════════════════════════

class SimulationRequest(BaseModel):
    """What-if simulation request."""
    vendor_ids: Optional[List[str]] = None  # None = simulate all (top 100)
    modified_params: Optional[Dict[str, float]] = None  # Override KPIs
    inject_events: Optional[List[EventInject]] = None
    custom_weights: Optional[Dict[str, float]] = None


class SimulationVendorResult(BaseModel):
    """Per-vendor simulation comparison."""
    vendor_id: str
    vendor_name: str
    baseline_score: float
    simulated_score: float
    delta: float
    baseline_category: str
    simulated_category: str


class SimulationResponse(BaseModel):
    """Full simulation analysis."""
    vendors: List[SimulationVendorResult]
    avg_baseline: float
    avg_simulated: float
    avg_delta: float
    critical_count_before: int
    critical_count_after: int
    high_count_before: int
    high_count_after: int


# ═══════════════════════════════════════════════════════════════
# WEBSOCKET SCHEMAS
# ═══════════════════════════════════════════════════════════════

class WSMessage(BaseModel):
    """WebSocket message envelope."""
    type: str  # risk_update, alert, event, dashboard_refresh
    data: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)
