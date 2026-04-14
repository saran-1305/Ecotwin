import json
import logging
from transformers import pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hybrid_engine")

# Load TinyBERT NLP classifier globally (only downloads once on startup)
# We use a lightweight zero-shot or sentiment classifier for sustainability intent.
# A small, fast distilbert model mapped for positive/negative/neutral text matching.
try:
    logger.info("Loading TinyBERT Local Model...")
    # 'distilbert-base-uncased-finetuned-sst-2-english' is extremely small and fast.
    # We will use it to gauge if product text sounds universally "positive/sustainable"
    # or "negative/generic" as a fallback heuristic.
    nlp_classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    logger.info("TinyBERT Loaded Successfully.")
except Exception as e:
    logger.error(f"Failed to load TinyBERT: {e}")
    nlp_classifier = None

from typing import Dict, Any

from app.services.finnhub_service import get_esg_data
from app.services.climatiq_service import estimate_carbon
from app.models import ExtractedData

async def analyze_product_hybrid(url: str, extracted_data: Any) -> Dict[str, Any]:
    """
    Given the scraped product data, running it through the deterministic hybrid pipeline:
    1. Text Signal Extraction (Regex/Heuristic)
    2. Local NLP NLP validation
    3. External APIs (Carbon, Finnhub) fallbacks
    """
    
    # 1. Flatten all available text for signal parsing
    text_corpus = ""
    title = ""
    brand = "Unknown"
    category = "Unknown"
    
    if extracted_data:
        title = getattr(extracted_data, 'title', "") or ""
        brand = getattr(extracted_data, 'brand', "") or "Unknown"
        # If extracted_data is a dictionary (from manual POST input) vs an object
        if isinstance(extracted_data, dict):
            text_corpus = f"{extracted_data.get('title', '')} {extracted_data.get('description', '')} {' '.join(extracted_data.get('bullets', []))} {extracted_data.get('materials', '')}".lower()
            title = extracted_data.get('title', '')
            brand = extracted_data.get('brand', 'Unknown')
        else:
            bullets = getattr(extracted_data, 'bullets', []) or []
            desc = getattr(extracted_data, 'description', "") or ""
            mats = getattr(extracted_data, 'materials', "") or ""
            text_corpus = f"{title} {desc} {' '.join(bullets)} {mats}".lower()

    # 2. Category-Aware Product Classification
    product_category = "unknown"
    cat_mapping = {
        "electronics": ["electronic", "computer", "laptop", "notebook", "ultrabook", "chromebook", "pc", "desktop", "monitor", "tv", "television", "smartphone", "phone", "android", "ios", "mobile", "handset", "tablet", "ipad", "tab", "printer", "inkjet", "laserjet", "scanner", "display", "screen", "device", "audio", "video", "appliance", "charger", "adapter", "power bank", "earphones", "headphones", "bluetooth", "keyboard", "mouse", "router"],
        "home_kitchen": ["kitchen", "home", "furniture", "plate", "bowl", "cup", "mug", "dinnerware", "cutlery", "utensil", "cookware", "pan", "pot", "decor", "bedding", "towel", "blanket"],
        "apparel": ["clothing", "apparel", "shirt", "t-shirt", "pants", "jeans", "dress", "shoes", "sneakers", "socks", "underwear", "jacket", "coat", "sweater", "hoodie", "garment"],
        "personal_care": ["beauty", "skincare", "cosmetics", "makeup", "lotion", "cream", "shampoo", "conditioner", "soap", "body wash", "toothpaste", "toothbrush", "deodorant", "perfume", "serum"],
        "grocery": ["food", "beverage", "snack", "drink", "grocery", "coffee", "tea", "cereal", "sauce", "spice", "produce", "meat", "dairy", "vegan", "gluten-free"],
        "toys": ["toy", "game", "puzzle", "action figure", "doll", "lego", "board game", "plush"]
    }
    
    import re
    
    # Check category strictly against title/desc to avoid Amazon footer boilerplate false positives
    cat_corpus = f"{title} {desc}".lower()
    for cat, keywords in cat_mapping.items():
        if any(re.search(r'\b' + re.escape(kw) + r'\b', cat_corpus) for kw in keywords):
            product_category = cat
            break

    # 3. Rule-Based Categorical Signal Extraction
    materials_detected = []
    packaging_signals = []
    durability_signals = []
    certifications_detected = []
    transparency_signals = []
    negative_signals = []
    
    # Priority Material Matching (multi-word first to prevent subset false positives)
    if re.search(r'\b(organic cotton)\b', text_corpus): materials_detected.append("organic cotton")
    elif re.search(r'\b(recycled cotton)\b', text_corpus): materials_detected.append("recycled cotton")
    elif re.search(r'\bcotton\b', text_corpus): materials_detected.append("cotton")
    
    if re.search(r'\b(recycled\s*plastic|recycled\s*content|pcr|post-consumer)\b', text_corpus): materials_detected.append("recycled content")
    if re.search(r'\b(biodegradable|compostable)\b', text_corpus): materials_detected.append("biodegradable")
    
    # Bamboo / Fiberglass / Glass conflict resolution
    has_bamboo_fiber = re.search(r'\bbamboo\s+(fiber|fibre|composite)\b', text_corpus)
    has_bamboo = re.search(r'\bbamboo\b', text_corpus)
    has_fiberglass = re.search(r'\bfiberglass\b', text_corpus) or re.search(r'\bfiber\s+glass\b', text_corpus)
    has_glass = re.search(r'\b(glass|tempered glass|borosilicate glass)\b', text_corpus)
    has_wheat_straw = re.search(r'\bwheat\s+straw\b', text_corpus)
    
    if has_wheat_straw: materials_detected.append("wheat straw")
    if has_bamboo_fiber or has_bamboo: materials_detected.append("bamboo")
    if has_fiberglass: materials_detected.append("fiberglass")
    if has_glass and not has_fiberglass and not has_bamboo_fiber: materials_detected.append("glass")

    if re.search(r'\b(stainless steel)\b', text_corpus): materials_detected.append("stainless steel")
    elif re.search(r'\bsteel\b', text_corpus): materials_detected.append("steel")
    if re.search(r'\baluminum\b', text_corpus): materials_detected.append("aluminum")
    if re.search(r'\bjute\b', text_corpus): materials_detected.append("jute")
    if re.search(r'\bhemp\b', text_corpus): materials_detected.append("hemp")
    if re.search(r'\blinen\b', text_corpus): materials_detected.append("linen")
    if re.search(r'\b(natural fiber|natural fibre)\b', text_corpus): materials_detected.append("natural fiber")
    if re.search(r'\b(coir|coconut fiber|coconut fibre)\b', text_corpus): materials_detected.append("coir")
    
    # Packaging
    if "recyclable" in text_corpus and "packaging" in text_corpus: packaging_signals.append("recyclable packaging")
    if "paper" in text_corpus and ("packaging" in text_corpus or "bag" in text_corpus or "box" in text_corpus): packaging_signals.append("paper packaging")
    if re.search(r'\b(plastic-free|plastic free|minimal packaging)\b', text_corpus): packaging_signals.append("plastic-free packaging")
    if "fsc" in text_corpus and "packaging" in text_corpus: packaging_signals.append("fsc packaging")
    
    # Durability & Maintenance
    if re.search(r'\b(reusable|washable)\b', text_corpus): durability_signals.append("reusable")
    if "refillable" in text_corpus: durability_signals.append("refillable")
    if re.search(r'\b(durable|long-lasting|lifetime warranty|durable stitching)\b', text_corpus): durability_signals.append("durable")
    if re.search(r'\b(non-toxic|chemical-free|azo-free dyes)\b', text_corpus): transparency_signals.append("chemical-free")
    
    # Certifications
    certs = ["fairtrade", "climate pledge", "b corp", "sedex", "iso 14001", "fsc"]
    for c in certs:
        if re.search(r'\b' + re.escape(c) + r'\b', text_corpus):
            certifications_detected.append(c)
            
    # Strict GOTS
    if re.search(r'\b(gots|global organic textile standard)\b', text_corpus):
        certifications_detected.append("gots")
        
    # Strict OEKO-TEX
    if re.search(r'\b(oeko|oeko-tex|standard 100)\b', text_corpus):
        certifications_detected.append("oeko-tex")
        
    # Electronics Restricted Certifications
    epeat_eligible = (product_category == "electronics")
    if epeat_eligible:
        if re.search(r'\b(energy star)\b', text_corpus): certifications_detected.append("energy star")
        if re.search(r'\b(rohs)\b', text_corpus): certifications_detected.append("rohs")
        if re.search(r'\b(weee)\b', text_corpus): certifications_detected.append("weee")
        if re.search(r'\b(green electronics)\b', text_corpus): certifications_detected.append("green electronics")
        
        # EPEAT explicit check
        epeat_evidence = ["epeat gold", "epeat silver", "epeat bronze", "registered with epeat", "epeat certified"]
        found_epeat = False
        for ev in epeat_evidence:
            if ev in text_corpus:
                found_epeat = True
                break
                
        # Handle bare 'epeat' strictly with word boundaries to prevent matching 'repeat'
        if not found_epeat and re.search(r'\bepeat\b', text_corpus):
            found_epeat = True
        
        if found_epeat:
            certifications_detected.append("epeat")
        else:
            transparency_signals.append("electronics checked for epeat")
            
    # Transparency
    if "sustainability report" in text_corpus: transparency_signals.append("sustainability report")
    if "traceability" in text_corpus: transparency_signals.append("traceability")
    if re.search(r'\b(composition|material disclosure|materials?:)\b', text_corpus): transparency_signals.append("material disclosure")

    # Negative Signals
    if re.search(r'\b(single-use|disposable)\b', text_corpus): negative_signals.append("single-use")
    if re.search(r'\bpvc\b', text_corpus): negative_signals.append("pvc")
    if "virgin plastic" in text_corpus: negative_signals.append("virgin plastic")
    if "greenwashing" in text_corpus: negative_signals.append("greenwashing")

    # 3. TinyBERT Local NLP Analysis
    nlp_score = 50
    if nlp_classifier and text_corpus:
        try:
            chunk = text_corpus[:512]
            res = nlp_classifier(chunk)[0]
            if res['label'] == 'POSITIVE':
                nlp_score = 50 + int(res['score'] * 30)
            else:
                nlp_score = 50 - int(res['score'] * 20)
        except Exception as e:
            logger.warning(f"TinyBERT inference failed: {e}")

    # 4. External APIs Integration (Finnhub + Climatiq)
    esg_data = await get_esg_data(brand)
    
    ext_obj = extracted_data if isinstance(extracted_data, ExtractedData) else ExtractedData(
        title=title, brand=brand, description=text_corpus, url=url
    )
    climatiq_result = await estimate_carbon(ext_obj, text_corpus)

    # 5. Build Result (Scoring Engine will handle all logic and math)
    data_quality = "low"
    confidence = 30.0
    
    total_signals = len(materials_detected) + len(packaging_signals) + len(durability_signals) + len(certifications_detected) + len(transparency_signals)
    if total_signals > 2:
        data_quality = "medium"
        confidence = 65.0
    if total_signals >= 4 or certifications_detected or esg_data:
        data_quality = "high"
        confidence = 85.0
        
    breakdown = {
        "material": None, # Will be explicitly parsed in scoring.py
        "packaging": None,
        "durability": None,
        "brand_record": None,
        "lifecycle": None
    }
    
    if esg_data and "totalESGScore" in esg_data:
        breakdown["brand_record"] = int(esg_data.get("totalESGScore") or 50)
        certifications_detected.append("finnhub esg verified")
        
    # Recalibrate Labor Dynamic Score
    labor_risk = {"grade": "Unknown", "score": None}
    if esg_data and "socialScore" in esg_data and esg_data.get("socialScore"):
        soc_score = esg_data.get("socialScore")
        labor_risk = {"grade": "A" if soc_score > 70 else "B" if soc_score > 50 else "C", "score": int(soc_score)}
    elif "fairtrade" in text_corpus or "sedex" in text_corpus or "sa8000" in text_corpus:
        labor_risk = {"grade": "A", "score": 90}
    elif data_quality == "high" and len(negative_signals) == 0:
        labor_risk = {"grade": "B", "score": 75}
        
    # Recalibrate Recycle Dynamic Score
    recycle = {"percent": None, "label": "Unknown"}
    if "recyclable" in text_corpus or "recycled" in text_corpus:
        recycle = {"percent": 80, "label": "Highly Recyclable"}
    elif "glass" in text_corpus or "stainless steel" in text_corpus or "aluminum" in text_corpus:
        recycle = {"percent": 95, "label": "Endlessly Recyclable"}
    elif "single-use" in text_corpus or "mix" in text_corpus:
        recycle = {"percent": 5, "label": "Poor"}

    # Dynamic Carbon Output
    carbon_estimate = {"kg_co2e": None, "source": "Hybrid Estimate"}
    
    if climatiq_result and climatiq_result.kg_co2e is not None:
        carbon_estimate["kg_co2e"] = climatiq_result.kg_co2e
        carbon_estimate["source"] = "Climatiq API Engine"
    else:
        # Fallbacks:
        if "t-shirt" in title.lower() or "cotton" in text_corpus:
            carbon_estimate["kg_co2e"] = 4.5
        elif "bottle" in title.lower() or "stainless steel" in text_corpus:
            carbon_estimate["kg_co2e"] = 1.2
        elif "plastic" in text_corpus:
            carbon_estimate["kg_co2e"] = 8.5
        else:
            carbon_estimate["source"] = "Insufficient Evidence"

    key_findings = [f"Detected materials: {', '.join(materials_detected) if materials_detected else 'Unknown'}"]
    if negative_signals:
         key_findings.append(f"Warning: Contains {', '.join(negative_signals)}")
    key_findings.append(f"NLP Sentiment Confidence: {nlp_score}/100")

    # 4. Relevance-First Live Eco Signals Array
    raw_signals = materials_detected + durability_signals + packaging_signals + certifications_detected + [t for t in transparency_signals if t in ["chemical-free", "non-toxic"]]
    
    # Deduplicate while preserving roughly this mapped order of priority
    seen = set()
    live_signals = []
    
    # Merge similar tags if needed to save space
    if "organic cotton" in materials_detected and "cotton" in raw_signals:
        raw_signals.remove("cotton")
        
    for sig in raw_signals:
        if sig not in seen and sig not in negative_signals:
            live_signals.append(sig)
            seen.add(sig)
            
    # Cap to top 6 relevant signals
    live_signals = live_signals[:6]
    signals_status = "ok" if live_signals else "no_verified_signals"

    return {
        "status": "success",
        "materials_detected": materials_detected,
        "packaging_signals": packaging_signals,
        "durability_signals": durability_signals,
        "certifications_detected": certifications_detected,
        "transparency_signals": transparency_signals,
        "negative_signals_detected": negative_signals,
        "live_signals": live_signals,
        "signals_status": signals_status,
        "breakdown": breakdown,
        "confidence": confidence,
        "data_quality": data_quality,
        "product_category": product_category,
        "epeat_eligible": epeat_eligible,
        "labor_risk": labor_risk,
        "recyclability": recycle,
        "carbon_estimate": carbon_estimate,
        "key_findings": key_findings,
        "nlp_score": nlp_score
    }
