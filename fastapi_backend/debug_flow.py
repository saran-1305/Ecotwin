
import asyncio
from app.models import ExtractedData, UserPrefs, AnalyzeResponse
from app.services.openai_service import analyze_product_ai
from app.services.scoring import calculate_score
import uuid
from datetime import datetime

async def debug_run():
    print("Starting debug run...")
    
    extracted = ExtractedData(
        title="Eco-Friendly Bamboo Toothbrush",
        description="100% biodegradable handle.",
        materials=["bamboo"],
        priceText="$10"
    )
    
    source = "amazon"
    user_prefs = None # Simulating the failing request
    
    try:
        # 1. AI Analysis (should fail and return mock)
        print("Calling AI Service...")
        ai_result = await analyze_product_ai(extracted, source)
        print(f"AI Result: {ai_result}")
        
        # 2. Scoring
        print("Calling Scoring Service...")
        final_score_data = calculate_score(ai_result, user_prefs)
        print(f"Scored Data: {final_score_data}")
        
        # 3. Response Construction
        print("Constructing Response...")
        response = AnalyzeResponse(
            id=str(uuid.uuid4()),
            url="https://example.com",
            title=extracted.title,
            brand=extracted.brand,
            imageUrl=extracted.imageUrl,
            overallScore=final_score_data["overallScore"],
            breakdown=final_score_data["breakdown"], # Pydantic should handle dict -> Breakdown
            confidence=ai_result.get("confidence", 0.5),
            level=final_score_data["level"],
            rankingMock=85,
            sdgs=ai_result.get("sdgs", []),
            reasons=ai_result.get("reasons", []),
            improvements=ai_result.get("improvements", []),
            greenwashingFlags=ai_result.get("greenwashing_flags", []),
            assumptions=ai_result.get("assumptions", []),
            createdAt=datetime.now().isoformat(),
            raw=ai_result
        )
        print("Response constructed successfully!")
        print(response.model_dump_json(indent=2))

    except Exception as e:
        print(f"CRASH: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_run())
