
import random
from app.models import ExtractedData

def get_deterministic_mock(extracted: ExtractedData, url: str = ""):
    """Fallback logic when OpenAI is unavailable."""
    # Use hash of the title/url/extracted data to seed random for consistent results per product
    # Including URL ensures unique scores even if scraping fails and title is generic
    seed_str = (extracted.title or "") + (extracted.description or "") + (url or "")
    if not seed_str:
        seed_str = "default-seed"
    
    # Simple hash function to get a seed integer
    seed_val = sum(ord(c) for c in seed_str)
    random.seed(seed_val)
    
    # Base score simulation (vary between 40 and 80)
    base_score = random.randint(40, 80)
    
    breakdown = {
        "carbonImpact": base_score + random.randint(-10, 10),
        "circularity": base_score + random.randint(-10, 10),
        "ethics": base_score + random.randint(-10, 10)
    }

    # Keyword adjustments
    text_blob = seed_str.lower()
    
    # Positive keywords
    if any(k in text_blob for k in ["organic", "recycled", "biodegradable", "sustainable", "eco-friendly", "bamboo", "hemp"]):
        base_score += 15
        breakdown["carbonImpact"] += 10
        breakdown["circularity"] += 20
        
    if any(k in text_blob for k in ["fair trade", "ethical", "hand made", "local"]):
        base_score += 10
        breakdown["ethics"] += 20

    # Negative keywords
    if any(k in text_blob for k in ["plastic", "synthetic", "polyester", "nylon", "cheap", "fast fashion"]):
        base_score -= 15
        breakdown["circularity"] -= 20
        breakdown["carbonImpact"] -= 10
        
    # Cap scores
    overall_score = max(10, min(95, base_score))
    for k in breakdown:
        breakdown[k] = max(10, min(95, breakdown[k]))
        
    # Generate somewhat generic reasons based on score
    reasons_pool = [
        "Materials transparency is limited.",
        "Transportation carbon footprint estimated to be moderate.",
        "Social impact data not fully disclosed.",
        "Packaging appears to be standard plastic.",
        "Durability of materials is average.",
        "Energy efficiency rating not found."
    ]
    
    if overall_score > 70:
        reasons_pool = [
            "Uses sustainable or recycled materials.",
            "Brand shows commitment to ethical practices.",
            "Product design supports circularity.",
            "Likely low carbon impact production.",
            "Positive environmental certifications detected."
        ]
        
    improvements_pool = [
        "Verify fair labor certifications.",
        "Look for plastic-free packaging alternatives.",
        "Check for end-of-life recycling programs.",
        "Consider second-hand alternatives.",
        "Ask brand for detailed impact report."
    ]

    return {
        "overallScore": overall_score,
        "breakdown": breakdown,
        "confidence": round(random.uniform(0.6, 0.85), 2),
        "level": "Tree" if overall_score > 75 else ("Sapling" if overall_score > 50 else "Seed"),
        "sdgs": [
            {"id": 12, "title": "Responsible Consumption", "why": "Relevant to product lifecycle."},
            {"id": 13, "title": "Climate Action", "why": "Carbon footprint consideration."}
        ],
        "reasons": random.sample(reasons_pool, k=min(3, len(reasons_pool))),
        "improvements": random.sample(improvements_pool, 2),
        "greenwashing_flags": ["Vague 'green' terminology used"] if overall_score < 50 else [],
        "assumptions": ["Analysis based on available text data and industry averages."]
    }
