from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.services.scoring import calculate_score
from app.models import AnalyzeRequest, AnalyzeResponse, LedgerEventRequest
from app.services.ledger_service import add_ledger_event, get_ledger_events
import uuid
from datetime import datetime

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "EcoTwin FastAPI Backend Running"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_product_endpoint(request: AnalyzeRequest):
    try:
        # Check Cache (Normalize URL simply by stripping trailing slashes/queries if needed, using raw url for now)
        canonical_url = request.url.split('?')[0].rstrip('/') if request.url else ""
        from app.services.cache_service import get_cached_analysis, set_cached_analysis
        
        cached_response = get_cached_analysis(canonical_url)
        if cached_response:
             print(f"CACHE HIT: Returning cached analysis for {canonical_url}")
             return AnalyzeResponse(**dict(cached_response))

        from app.services.scraper import scrape_product_page
        from app.services.hybrid_engine import analyze_product_hybrid
        
        extracted_data = request.extracted
        if not extracted_data:
            extracted_data = scrape_product_page(request.url)

        unavailable = []
        partial = False
        
        # 1. Hybrid Engine Pipeline (Replaces OpenAI + Climatiq APIs)
        # This deterministic engine pulls signals, estimates carbon/labor rules, and runs local NLP.
        hybrid_result = await analyze_product_hybrid(canonical_url, extracted_data)
        
        # Robust External Scoring & Recalibration Strategy
        # Run the hybrid result through our dedicated deterministic engine to get the rigorous calibrated score.
        final_scores = calculate_score(hybrid_result)

        breakdown = final_scores.get("breakdown", {})
        eco_score = final_scores.get("eco_score")
        score_band = final_scores.get("level")
        confidence = final_scores.get("confidence")
        data_quality = final_scores.get("data_quality")
        scoring_reasoning = final_scores.get("scoring_reasoning")
        positive_signals = final_scores.get("positive_signals_detected", [])
        negative_signals = final_scores.get("negative_signals_detected", [])
        
        # Merge with upstream categorized signals
        if hybrid_result:
            all_upstream = (
                hybrid_result.get("materials_detected", []) +
                hybrid_result.get("packaging_signals", []) +
                hybrid_result.get("durability_signals", []) +
                hybrid_result.get("certifications_detected", []) +
                hybrid_result.get("transparency_signals", [])
            )
            positive_signals = list(set(positive_signals + all_upstream))

        # Construct exact strict dictionary
        response_model = AnalyzeResponse(
            analysis_id=str(uuid.uuid4()),
            canonical_url=canonical_url,
            product_title=extracted_data.title if extracted_data else None,
            brand=extracted_data.brand if extracted_data else None,
            product_image=extracted_data.imageUrl if extracted_data else None,
            eco_score=eco_score,
            confidence=confidence,
            score_band=score_band,
            breakdown={
                "material": breakdown.get("material"),
                "packaging": breakdown.get("packaging"),
                "durability": breakdown.get("durability"),
                "brand_record": breakdown.get("brand_record"),
                "lifecycle": breakdown.get("lifecycle")
            },
            carbon_estimate=hybrid_result.get("carbon_estimate", {"kg_co2e": None, "source": "Unknown"}),
            recyclability=hybrid_result.get("recyclability", {"percent": None, "label": "Unknown"}),
            labor_risk=hybrid_result.get("labor_risk", {"grade": "Unknown", "score": None}),
            sdg_mapping=hybrid_result.get("sdg_mapping", []),
            key_findings=hybrid_result.get("key_findings", []),
            signals=hybrid_result.get("live_signals", []), # Overwrite legacy array with purified live_signals
            positive_signals_detected=positive_signals,
            negative_signals_detected=negative_signals,
            scoring_reasoning=scoring_reasoning,
            data_quality=data_quality,
            product_category=hybrid_result.get("product_category", "unknown"),
            epeat_eligible=hybrid_result.get("epeat_eligible", False),
            live_signals=hybrid_result.get("live_signals", []),
            signals_status=hybrid_result.get("signals_status", "ok"),
            partial_analysis=partial,
            unavailable_modules=unavailable,
            created_at=datetime.now().isoformat(),
            score_version="v3_hybrid"
        )
        
        # Save to Cache 24 hours via cache_service.py
        set_cached_analysis(canonical_url, dict(response_model))
        
        return response_model
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        from app.models import CarbonEstimateResult, Recyclability, LaborRisk, Breakdown
        
        # Per user instruction, do not fabricate eco_scores on error. 
        # Return a graceful structured response indicating failure safely,
        # so the frontend renders the error bounding box rather than crashing.
        return AnalyzeResponse(
            analysis_id=str(uuid.uuid4()),
            canonical_url=request.url,
            status="error",
            error_message=f"Analysis failed: {str(e)}",
            eco_score=None,
            confidence=None,
            score_band="Error",
            breakdown=Breakdown(material=None, packaging=None, durability=None, brand_record=None, lifecycle=None),
            carbon_estimate=CarbonEstimateResult(kg_co2e=None, source=None),
            recyclability=Recyclability(percent=None, label=None),
            labor_risk=LaborRisk(grade=None, score=None),
            sdg_mapping=[],
            key_findings=[],
            signals=[],
            created_at=datetime.now().isoformat(),
            score_version="v3_hybrid"
        )

@app.post("/ledger/events")
def create_ledger_event(request: LedgerEventRequest):
    if request.eco_score is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Cannot save ledger event without an eco_score")
        
    success, reason, event = add_ledger_event(request)
    if not success:
        return {"success": False, "created": False, "reason": reason}
    return {"success": True, "created": True, "event": event}

@app.get("/ledger/history")
def fetch_ledger_history(source: str = None):
    events = get_ledger_events()
    if source:
        events = [e for e in events if e.source == source]
    # Sort latest first (by ISO timestamp)
    events.sort(key=lambda x: x.created_at, reverse=True)
    return {"history": events}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
