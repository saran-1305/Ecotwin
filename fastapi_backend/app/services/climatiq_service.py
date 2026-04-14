
import httpx
from app.config import get_settings
from app.models import ExtractedData, CarbonEstimateResult
import json

settings = get_settings()

CLIMATIQ_API_URL = "https://api.climatiq.io/data/v1/estimate"

# Simple mapping for category inference
CATEGORY_KEYWORDS = {
    "electronics": ["laptop", "phone", "tv", "monitor", "electronics", "headphone", "earbud", "charger"],
    "clothing": ["shirt", "pant", "dress", "shoe", "sneaker", "coat", "jacket", "cotton", "wool", "clothing"],
    "consumer_goods": ["bottle", "cup", "mug", "toy", "bag", "backpack", "pen", "pencil"],
    "household": ["cleaner", "soap", "detergent", "shampoo", "lotion", "household"],
}

# Proxy emission factors (fallback generic IDs if we can't find exact matches)
# These are examples; in a real app, you'd search the Climatiq Data Explorer for robust IDs.
PROXY_FACTORS = {
    "electronics": {"activity_id": "electrical_equipment-type_consumer_electronics", "unit": "number", "region": "Global"},
    "clothing": {"activity_id": "textiles-type_clothing", "unit": "consumer_item", "region": "Global"},
    "consumer_goods": {"activity_id": "consumer_goods-type_miscellaneous", "unit": "consumer_item", "region": "Global"},
    "household": {"activity_id": "consumer_goods-type_soaps_detergents", "unit": "consumer_item", "region": "Global"},
}
DEFAULT_FACTOR = {"activity_id": "consumer_goods-type_miscellaneous", "unit": "consumer_item", "region": "Global"}

async def estimate_carbon(extracted: ExtractedData, text_corpus: str = "") -> CarbonEstimateResult:
    """
    Estimate carbon emissions using Climatiq API.
    Uses simple keyword matching to find a proxy category.
    """
    if not settings.CLIMATIQ_API_KEY:
        return CarbonEstimateResult(
            kg_co2e=None,
            method="fallback",
            confidence=0.0,
            estimation_notes="Climatiq API key missing."
        )

    # 1. Infer Category
    text_to_search = (extracted.title + " " + (extracted.description or "")).lower()
    category = "consumer_goods" # Default
    
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(k in text_to_search for k in keywords):
            category = cat
            break
            
    # 2. Prepare Parameters
    factor = PROXY_FACTORS.get(category, DEFAULT_FACTOR)
    
    # We create a dummy estimation request. 
    # Since we often lack weight, we assume "1 unit" for item-based factors.
    # For weight-based factors, we'd need to extract weight from text (complex).
    # We'll stick to unit-based estimation where possible or default to 1 generic unit.
    
    payload = {
        "emission_factor": {
            "activity_id": factor["activity_id"],
            "region": factor["region"]
        },
        "parameters": {
            "money": 100, # Fallback: spend-based estimation if we switched to spend-based factors
            "number": 1   # Unit-based estimation
        }
    }
    
    # Correction: The `estimate` endpoint requires selection of parameters matching the factor's unit_type.
    # The PROXY_FACTORS above assume `number` (consumer_item) or `money` (spend).
    # Let's verify the unit in PROXY_FACTORS.
    # Ideally, we would use the `search` endpoint to find the factor first, but that adds latency.
    # We will assume these IDs exist. If not, Climatiq returns 400.
    
    # Simplified payload for "number" based estimation (per item)
    payload = {
        "emission_factor": {
            "activity_id": factor["activity_id"],
            "data_version": "^10" # Use latest version 10+
        },
        "parameters": {
            "number": 1
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                CLIMATIQ_API_URL,
                json=payload,
                headers={"Authorization": f"Bearer {settings.CLIMATIQ_API_KEY}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return CarbonEstimateResult(
                    kg_co2e=data.get("co2e"),
                    method="climatiq_estimate",
                    confidence=0.7, # Moderate confidence for proxy
                    estimation_notes=f"Estimated based on category proxy: {category}"
                )
            else:
                # If ID is invalid or other error
                print(f"Climatiq API Error {response.status_code}: {response.text}")
                return CarbonEstimateResult(
                    kg_co2e=None,
                    method="fallback",
                    confidence=0.0,
                    estimation_notes=f"API Error: {response.status_code}"
                )
                
    except Exception as e:
        print(f"Climatiq Exception: {e}")
        return CarbonEstimateResult(
            kg_co2e=None,
            method="fallback",
            confidence=0.0,
            estimation_notes=f"Connection failed: {str(e)}"
        )
