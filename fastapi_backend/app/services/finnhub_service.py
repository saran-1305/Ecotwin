import finnhub
from app.config import get_settings
from typing import Dict, Any, Optional

settings = get_settings()

if settings.FINNHUB_API_KEY:
    finnhub_client = finnhub.Client(api_key=settings.FINNHUB_API_KEY)
else:
    finnhub_client = None

# A basic map of consumer brand names to public ticker symbols for the ESG API
BRAND_TO_TICKER = {
    "apple": "AAPL",
    "amazon": "AMZN",
    "basics": "AMZN",
    "amazonbasics": "AMZN",
    "microsoft": "MSFT",
    "sony": "SONY",
    "nike": "NKE",
    "adidas": "ADDYY",
    "patagonia": None, # private, fallback to text
    "nestle": "NSRGY",
    "unilever": "UL",
    "coca-cola": "KO",
    "pepsi": "PEP",
    "procter": "PG",
    "pg": "PG",
    "samsung": "SSNLF"
}

async def get_esg_data(brand_name: str) -> Optional[Dict[str, Any]]:
    if not finnhub_client or not brand_name:
        return None
        
    lower_brand = brand_name.lower().strip()
    ticker = None
    
    # Try direct mapping first
    for key, val in BRAND_TO_TICKER.items():
        if key in lower_brand:
            ticker = val
            break
            
    if not ticker:
        return None
        
    try:
        # Running sync client in an async wrapper is naive, but works for low traffic here.
        # Alternatively use httpx to fetch Finnhub ESG.
        # Finnhub ESG API endpoint is /esg
        # Note: the python client doesn't strictly have a dedicated esg function in free tier sometimes,
        # but we'll try to fetch basic company profile or ESG if available.
        # According to docs: finnhub_client.company_esg_score(ticker)
        res = finnhub_client.company_esg_score(ticker)
        if res and isinstance(res, dict) and "totalESGScore" in res:
             return {
                 "ticker": ticker,
                 "totalESGScore": res.get("totalESGScore"),
                 "environmentScore": res.get("environmentScore"),
                 "socialScore": res.get("socialScore"),
                 "governanceScore": res.get("governanceScore")
             }
        return None
    except Exception as e:
        print(f"Finnhub API Error: {e}")
        return None
