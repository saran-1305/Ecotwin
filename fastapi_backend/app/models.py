
from pydantic import BaseModel, Field
from typing import List, Optional

# --- Request Models ---

class UserPrefs(BaseModel):
    carbonWeight: int = Field(default=50, ge=0, le=100)
    plasticAvoidanceWeight: int = Field(default=50, ge=0, le=100)
    ethicsWeight: int = Field(default=50, ge=0, le=100)
    durabilityWeight: int = Field(default=50, ge=0, le=100)
    localWeight: int = Field(default=50, ge=0, le=100)

class ExtractedData(BaseModel):
    title: str
    brand: Optional[str] = None
    priceText: Optional[str] = None
    currency: Optional[str] = None
    imageUrl: Optional[str] = None
    bullets: List[str] = []
    description: Optional[str] = None
    materials: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    certifications: Optional[List[str]] = None

class AnalyzeRequest(BaseModel):
    url: str
    source: str
    extracted: Optional[ExtractedData] = None
    userPrefs: Optional[UserPrefs] = None

# --- Response Models ---

class Breakdown(BaseModel):
    material: Optional[int] = None
    packaging: Optional[int] = None
    brand_record: Optional[int] = None
    lifecycle: Optional[int] = None
    durability: Optional[int] = None

class CarbonEstimateResult(BaseModel):
    kg_co2e: Optional[float] = None
    source: Optional[str] = None

class Recyclability(BaseModel):
    percent: Optional[int] = None
    label: Optional[str] = None

class LaborRisk(BaseModel):
    grade: Optional[str] = None
    score: Optional[int] = None

class SDGMapping(BaseModel):
    goal: int
    score: float
    label: str

class AnalyzeResponse(BaseModel):
    analysis_id: str
    canonical_url: str
    product_title: Optional[str] = None
    brand: Optional[str] = None
    product_image: Optional[str] = None
    eco_score: Optional[int] = None
    confidence: Optional[float] = None
    score_band: Optional[str] = None
    breakdown: Breakdown
    carbon_estimate: CarbonEstimateResult
    recyclability: Recyclability
    labor_risk: LaborRisk
    sdg_mapping: List[SDGMapping] = []
    key_findings: List[str] = []
    signals: List[str] = []
    
    # New Fields for Calibration Trust
    positive_signals_detected: List[str] = []
    negative_signals_detected: List[str] = []
    scoring_reasoning: Optional[str] = None
    data_quality: Optional[str] = None
    product_category: Optional[str] = "unknown"
    epeat_eligible: Optional[bool] = False
    live_signals: List[str] = []
    signals_status: str = "ok"
    status: str = "success"
    error_message: Optional[str] = None
    partial_analysis: bool = False
    unavailable_modules: List[str] = []
    created_at: str
    score_version: str = "v1"

# --- Ledger Models ---

class LedgerEventRequest(BaseModel):
    user_id: str
    source: str # "extension_quick_scan" or "deep_analysis"
    platform: str
    event_type: str = "product_scan"
    canonical_url: str
    product_title: str
    brand: Optional[str] = None
    product_image: Optional[str] = None
    analysis_id: str
    eco_score: int
    confidence: Optional[float] = None
    score_band: Optional[str] = None
    breakdown: Optional[dict] = None
    carbon_estimate: Optional[dict] = None
    sdg_mapping: Optional[list] = []
    key_findings: Optional[list] = []
    
    # New calibration fields to store in ledger
    positive_signals_detected: Optional[list] = []
    negative_signals_detected: Optional[list] = []
    scoring_reasoning: Optional[str] = None
    data_quality: Optional[str] = None
    
    created_at_client: str

class LedgerEvent(LedgerEventRequest):
    ledger_id: str
    scanType: str = "quick" # "quick" or "full"
    status: str = "success"
    created_at: str
