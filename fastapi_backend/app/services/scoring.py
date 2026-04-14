from app.models import UserPrefs

def calculate_score(ai_result: dict, user_prefs: UserPrefs = None) -> dict:
    """
    Robust weighted scoring model with dynamic weight recalibration.
    Prevents clustering in the 45-60 band by dropping unknown variables.
    A) SCORE COMPONENTS (target weights if ALL present)
    - Material Sustainability -> 35%
    - Packaging Sustainability -> 20%
    - Durability / Reusability -> 20%
    - Brand Responsibility / ESG -> 15%
    - Lifecycle / Transparency -> 10%
    """
    materials = ai_result.get("materials_detected", [])
    packaging = ai_result.get("packaging_signals", [])
    durability = ai_result.get("durability_signals", [])
    certifications = ai_result.get("certifications_detected", [])
    transparency = ai_result.get("transparency_signals", [])
    negative_signals = ai_result.get("negative_signals_detected", [])
    
    breakdown_in = ai_result.get("breakdown", {})
    
    # Extract existing Finnhub ESG score if populated
    brand_esg = breakdown_in.get("brand_record") 
    
    material_score = None
    packaging_score = None
    durability_score = None
    brand_score = brand_esg
    lifecycle_score = None
    
    # 1. Calculate Component Base Scores (ONLY if data exists)
    
    if materials or negative_signals:
        material_score = 50 # Start neutral
        if "organic cotton" in materials or "recycled cotton" in materials: material_score += 30
        elif "cotton" in materials: material_score += 15
        if "recycled content" in materials: material_score += 15
        if "glass" in materials or "stainless steel" in materials or "bamboo" in materials: material_score += 20
        if "biodegradable" in materials: material_score += 15
        if "jute" in materials: material_score += 15
        
        # Penalities
        if "virgin plastic" in negative_signals or "pvc" in negative_signals: material_score -= 25
            
    if packaging or "single-use" in negative_signals:
        packaging_score = 50
        if "recyclable packaging" in packaging or "paper packaging" in packaging: packaging_score += 20
        if "plastic-free packaging" in packaging: packaging_score += 25
        if "single-use" in negative_signals: packaging_score -= 25
            
    if durability or "single-use" in negative_signals:
        durability_score = 50
        if "reusable" in durability or "refillable" in durability: durability_score += 30
        if "durable" in durability: durability_score += 10
        if "single-use" in negative_signals: durability_score -= 30
        
    if certifications or transparency:
        if brand_score is None: brand_score = 50
        lifecycle_score = 50
        if "sustainability report" in transparency: brand_score += 20
        if "traceability" in transparency: lifecycle_score += 20
        if "material disclosure" in transparency: lifecycle_score += 10
        if "finnhub esg verified" in certifications: brand_score += 15
        
        # Standard certifications
        brand_score += len(certifications) * 5
        lifecycle_score += len(certifications) * 5

    if "greenwashing" in negative_signals:
        if brand_score is None: brand_score = 50
        brand_score -= 25

    def clamp(val): return max(10, min(95, int(val))) if val is not None else None
    
    material_score = clamp(material_score)
    packaging_score = clamp(packaging_score)
    durability_score = clamp(durability_score)
    brand_score = clamp(brand_score)
    lifecycle_score = clamp(lifecycle_score)

    # 2. Dynamic Weight Re-Normalization
    # If a component is completely unknown (None), drop its weight and recalculate
    base_weights = {
        "material": {"score": material_score, "weight": 35},
        "packaging": {"score": packaging_score, "weight": 20},
        "durability": {"score": durability_score, "weight": 20},
        "brand": {"score": brand_score, "weight": 15},
        "lifecycle": {"score": lifecycle_score, "weight": 10}
    }
    
    total_active_weight = 0
    calculated_raw_score = 0
    
    for key, data in base_weights.items():
        if data["score"] is not None:
             total_active_weight += data["weight"]
             calculated_raw_score += (data["score"] * (data["weight"] / 100))
             
    # If we have literally 0 data from scraping, fallback to a neutral low confidence 50
    if total_active_weight == 0:
        base_eco_score = 50.0
    else:
        # Re-normalize (e.g. if we only found 60% of weights, scale the score out of 100%)
        # For instance: if score was 20 points, but max possible was 40 weight, 20/40 = 50% = 50/100
        base_eco_score = (calculated_raw_score / (total_active_weight / 100))
        
    # 3. Calibration & Spread
    lift = 0
    all_positive = materials + packaging + durability + transparency + certifications
    if len(all_positive) >= 3:
        lift += 8 # Positive evidence lift
    elif len(all_positive) in [1, 2]:
        lift += 4
    
    # Certification precise bonus
    if certifications:
        lift += min(10, len(certifications) * 5)
        
    # Heavy penalty for explicit negatives (ignores missing data)
    if negative_signals:
        lift -= min(20, len(negative_signals) * 10)
        
    final_score = base_eco_score + lift
    
    # Integrate NLP Sentiment Support
    nlp_score = ai_result.get("nlp_score", 50)
    if nlp_score > 75:
        final_score += 5
    elif nlp_score < 30:
        final_score -= 5
        
    # User Prefs Override / Adjustment
    if user_prefs:
        if user_prefs.carbonWeight > 60 and (brand_score and brand_score < 40):
            final_score -= 5
        if user_prefs.plasticAvoidanceWeight > 60 and ("virgin plastic" in negative_signals or "pvc" in negative_signals):
            final_score -= 10
            
    # Final Clamp
    final_score = int(max(15, min(96, final_score))) # Never quite 0 or 100
    
    # 4. Confidence Score (Calculated distinctly from the eco_score logic)
    # High: certs + transparent composition. Med: text signals only. Low: sparse
    confidence = ai_result.get("confidence", 30.0)
    data_quality = ai_result.get("data_quality", "low")
    
    # Overwrite based on extraction strength
    total_sig_count = len(all_positive) + len(negative_signals)
    if certifications and total_sig_count >= 4:
         confidence = max(85.0, confidence)
         data_quality = "high"
    elif total_sig_count > 1:
         confidence = max(60.0, confidence)
         data_quality = "medium"
    else:
         confidence = min(40.0, confidence)
         data_quality = "low"
         
    # Generate Output List strings
    pos_strings = all_positive
    pos_strings = list(set(pos_strings))[:5]
    neg_strings = list(set(negative_signals))[:3]
        
    reasoning = f"Base score normalized across {{int(total_active_weight)}}% verified data. "
    if lift > 0:
        reasoning += f"Boosted +{lift} points via {len(all_positive)} positive indicators and certs. "
    elif lift < 0:
        reasoning += f"Penalized {lift} points due to severe negative indicators ({', '.join(neg_strings)}). "
    else:
        reasoning += "No major calibration nudges applied beyond base materials."
        
    level = "Poor"
    if final_score >= 75: level = "Excellent"
    elif final_score >= 60: level = "Good"
    elif final_score >= 40: level = "Fair"

    return {
        "eco_score": int(final_score),
        "level": level,
        "confidence": int(confidence),
        "data_quality": data_quality,
        "scoring_reasoning": reasoning,
        "positive_signals_detected": pos_strings,
        "negative_signals_detected": neg_strings,
        "breakdown": {
            "material": material_score,
            "packaging": packaging_score,
            "durability": durability_score,
            "brand_record": brand_score,
            "lifecycle": lifecycle_score
        }
    }
