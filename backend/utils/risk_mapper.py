"""
VendorIQ — Risk Mapper Utility
Maps vendor DB model fields to/from the param dict format used by the risk engine.
"""

# DB column name → param key mapping
DB_TO_PARAM = {
    "ontime_delivery": "OnTime_Delivery",
    "avg_lead_time": "Avg_Lead_Time",
    "lead_time_variability": "Lead_Time_Variability",
    "emergency_fulfillment": "Emergency_Fulfillment",
    "shipment_accuracy": "Shipment_Accuracy",
    "avg_days_late": "Avg_Days_Late",
    "defect_rate_ppm": "Defect_Rate_PPM",
    "field_failure_rate": "Field_Failure_Rate",
    "warranty_claims": "Warranty_Claims",
    "inspection_pass_rate": "Inspection_Pass_Rate",
    "certification_score": "Certification_Score",
    "financial_stability": "Financial_Stability",
    "revenue_trend": "Revenue_Trend",
    "debt_equity": "Debt_Equity",
    "dpo": "DPO",
    "carrier_dependency": "Carrier_Dependency",
    "gpr_score": "GPR_Score",
    "tariff_exposure": "Tariff_Exposure",
    "disaster_risk": "Disaster_Risk",
    "single_source": "Single_Source",
    "tier2_visibility": "Tier2_Visibility",
    "vendor_tenure": "Vendor_Tenure",
    "response_time": "Response_Time",
    "audit_score": "Audit_Score",
    "capacity_utilization": "Capacity_Utilization",
    "carbon_score": "Carbon_Score",
    "labor_compliance": "Labor_Compliance",
    "esg_score": "ESG_Score",
}

PARAM_TO_DB = {v: k for k, v in DB_TO_PARAM.items()}


def vendor_to_params(vendor) -> dict:
    """Extract param dict from a Vendor ORM object."""
    params = {}
    for db_col, param_key in DB_TO_PARAM.items():
        val = getattr(vendor, db_col, None)
        params[param_key] = float(val) if val is not None else 0.0
    return params


def params_to_vendor_update(params: dict) -> dict:
    """Convert param dict back to DB column updates."""
    updates = {}
    for param_key, value in params.items():
        db_col = PARAM_TO_DB.get(param_key)
        if db_col:
            updates[db_col] = value
    return updates
