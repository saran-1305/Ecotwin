from cachetools import TTLCache
from typing import Any, Optional

# TTLCache: stores max 1000 items, TTL of 24 hours (86400 seconds) to save API quota
analysis_cache = TTLCache(maxsize=1000, ttl=86400)

def generate_cache_key(url: str) -> str:
    if not url:
        return "unknown_url"
    # Basic url normalization
    normalized = url.lower().replace("https://", "").replace("http://", "").replace("www.", "").strip("/")
    # remove tracking parameters if present e.g. ref=...
    if "?" in normalized:
        normalized = normalized.split("?")[0]
    return normalized

def get_cached_analysis(url: str) -> Optional[Any]:
    key = generate_cache_key(url)
    return analysis_cache.get(key)

def set_cached_analysis(url: str, data: Any):
    key = generate_cache_key(url)
    analysis_cache[key] = data
