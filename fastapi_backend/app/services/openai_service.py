
from openai import AsyncOpenAI
import json
from app.config import get_settings
from app.models import ExtractedData

settings = get_settings()

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

def get_strict_mock():
    # Strict mock removed per user request: no placeholder data allowed
    raise ValueError("AI Analysis Unavailable: API Key missing or quota exceeded")

def analyze_product_heuristic(extracted: ExtractedData, source: str) -> dict:
    """Fallback heuristic analyzer that performs real NLP-like scoring based on product text.
    It builds a score dynamically based on the presence of specific sustainability keywords, 
    avoiding placeholder values entirely."""
    
    # Create a lowercased text corpus from available data
    materials = extracted.materials if isinstance(extracted.materials, list) else []
    bullets = extracted.bullets if isinstance(extracted.bullets, list) else []
    certifications = extracted.certifications if isinstance(extracted.certifications, list) else []
    
    text_corpus = (
        str(extracted.title or "") + " " +
        str(extracted.description or "") + " " +
        " ".join(materials) + " " +
        " ".join(bullets) + " " +
        " ".join(certifications)
    ).lower()

    # Base scores
    material_score = 50
    packaging_score = 40
    brand_score = 50
    lifecycle_score = 50
    confidence = 0.35 # Lower confidence since it's a heuristic

    key_findings = []
    signals = []

    # Material Analysis lists
    good_materials = {"bamboo": 30, "recycled": 25, "organic": 20, "hemp": 20, "linen": 15, "cotton": 5, "glass": 10, "steel": 10, "wood": 15, "biodegradable": 30, "compostable": 30, "silicone": 10, "soy": 20, "beeswax": 20}
    bad_materials = {"plastic": -20, "synthetic": -15, "polyester": -20, "nylon": -15, "acrylic": -15, "pvc": -30, "pet": -10, "microplastic": -30}

    for word, impact in good_materials.items():
        if word in text_corpus:
            material_score += impact
            signals.append(f"{word.capitalize()} material")
            key_findings.append(f"Positive material detected: {word.capitalize()}")
            confidence += 0.05

    for word, impact in bad_materials.items():
        if word in text_corpus:
            material_score += impact
            signals.append(f"Contains {word}")
            key_findings.append(f"High-impact material detected: {word.capitalize()}")
            confidence += 0.05

    # Packaging Analysis
    if "plastic-free packaging" in text_corpus or "plastic free" in text_corpus or "recycled packaging" in text_corpus or "recyclable packaging" in text_corpus:
        packaging_score += 35
        key_findings.append("Sustainable packaging mentioned")
    elif "plastic packaging" in text_corpus:
        packaging_score -= 20
        key_findings.append("Uses plastic packaging")

    # Certifications
    cert_map = {"fsc": 30, "fair trade": 30, "gots": 30, "b corp": 40, "climate neutral": 40, "oeko-tex": 25, "energy star": 20, "usda organic": 25, "vegan": 15, "cruelty-free": 15}
    for cert, impact in cert_map.items():
        if cert in text_corpus:
            brand_score += impact
            lifecycle_score += impact * 0.5
            signals.append(f"{cert.upper()} Certified")
            key_findings.append(f"Recognized certification found: {cert.upper()}")
            confidence += 0.1

    # End of life
    if "recyclable" in text_corpus or "easy to recycle" in text_corpus or "reusable" in text_corpus:
        lifecycle_score += 20
    if "durable" in text_corpus or "lifetime guarantee" in text_corpus or "long-lasting" in text_corpus:
        lifecycle_score += 15
    if "single-use" in text_corpus or "disposable" in text_corpus:
        lifecycle_score -= 30

    # Bounded scores
    def clamp(val):
        return max(10, min(95, int(val)))

    material_score = clamp(material_score)
    packaging_score = clamp(packaging_score)
    brand_score = clamp(brand_score)
    lifecycle_score = clamp(lifecycle_score)

    eco_score = int((material_score + packaging_score + brand_score + lifecycle_score) / 4)
    if eco_score <= 40: score_band = "Poor"
    elif eco_score <= 60: score_band = "Fair"
    elif eco_score <= 80: score_band = "Good"
    else: score_band = "Excellent"

    # Filter unique lists
    key_findings = list(set(key_findings))[:4]
    signals = list(set(signals))[:3]

    if not key_findings:
        key_findings.append("Not enough specific sustainability data found in product text.")
        signals.append("Standard Product")

    return {
        "eco_score": eco_score,
        "confidence": min(0.9, confidence),
        "score_band": score_band,
        "breakdown": {
            "material": material_score,
            "packaging": packaging_score,
            "brand_record": brand_score,
            "lifecycle": lifecycle_score
        },
        "recyclability": {
            "percent": 80 if "recyclable" in text_corpus else (50 if eco_score > 60 else 20),
            "label": "High" if "recyclable" in text_corpus else "Low"
        },
        "labor_risk": {
            "grade": "B" if ("fair trade" in text_corpus or "b corp" in text_corpus) else ("D" if eco_score < 40 else "C"),
            "score": 85 if ("fair trade" in text_corpus or "b corp" in text_corpus) else (30 if eco_score < 40 else 50)
        },
        "sdg_mapping": [],
        "key_findings": key_findings,
        "signals": signals,
        "is_heuristic": True
    }

async def analyze_product_ai(extracted: ExtractedData, source: str):
    """
    Analyzes product data using OpenAI to generate sustainability insights.
    Falls back to a deterministic heuristic based on extracted data if the API fails or is missing.
    """
    if not settings.OPENAI_API_KEY:
        print("OPENAI_API_KEY missing. Falling back to heuristic text analyzer.")
        return analyze_product_heuristic(extracted, source)

    # Construct a rich prompt
    prompt = f"""
    Analyze the sustainability of this product based on the provided data.
    
    PRODUCT DATA:
    - Title: {extracted.title}
    - Brand: {extracted.brand}
    - Description: {extracted.description}
    - Materials: {extracted.materials}
    - Certifications: {extracted.certifications}
    - Key Features: {extracted.bullets}
    - URL/Source: {source}
    
    TASK: Provide a factual sustainability analysis based on the provided data. If explicit data is missing, provide a reasonable, conservative estimate based on the typical industry standard for this type of product (e.g. Silicone Gloves usually have poor recyclability but high durability). Do NOT leave all breakdown fields as `null` unless the product is completely unidentified.
    
    OUTPUT FORMAT (Strict JSON):
    {{
      "eco_score": <number 0-100 or null>,
      "confidence": <number 0.0-1.0 or null based on data availability>,
      "score_band": "<string: Poor, Fair, Good, Excellent or null>",
      "breakdown": {{
        "material": <number 0-100 or null>,
        "packaging": <number 0-100 or null>,
        "brand_record": <number 0-100 or null>,
        "lifecycle": <number 0-100 or null>
      }},
      "recyclability": {{
        "percent": <number 0-100 or null>,
        "label": "<string or null>"
      }},
      "labor_risk": {{
        "grade": "<string A-F or null>",
        "score": <number 0-100 or null>
      }},
      "sdg_mapping": [
        {{ "goal": <int 1-17>, "score": <float 0.0-1.0>, "label": "<string>" }}
      ],
      "key_findings": ["<string>", "<string>"],
      "signals": ["<string>", "<string>"]
    }}
    
    NOTE: `signals` should be 2-3 short strings like '100% Recycled Cotton' or 'Microplastic Risk' derived strictly from the text.
    
    HARD CONSTRAINT: Do NOT hallucinate certifications or materials. If the product is NOT an electronic device, you must absolutely NEVER output "EPEAT", "Energy Star", or "RoHS" under any circumstances. EPEAT is strictly for electronics only (laptops, phones, etc.) and should only be output if explicitly mentioned on the page.
    """

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert environmental analyst. You provide strict, valid JSON responses analyzing product sustainability. Do not hallucinate certifications like EPEAT or Energy Star for non-electronics."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3 # Low temperature for more deterministic/factual results
        )
        
        content = response.choices[0].message.content
        if not content:
             print("Empty response from OpenAI. Falling back to heuristic.")
             return analyze_product_heuristic(extracted, source)
            
        return json.loads(content)

    except Exception as e:
        print(f"OpenAI API Error: {e}")
        # Always fallback to real text analysis rather than crashing out or throwing random data
        print("Falling back to heuristic text analyzer due to error or quota limits.")
        return analyze_product_heuristic(extracted, source)
