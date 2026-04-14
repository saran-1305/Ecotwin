import asyncio
from app.services.hybrid_engine import analyze_product_hybrid
from app.services.scoring import calculate_score
from app.models import ExtractedData

scenarios = [
    {
        "name": "1) Bamboo dinner plates (home_kitchen, no epeat, no glass unless explicit)",
        "url": "https://example.com/bamboo-plates",
        "data": ExtractedData(
            title="Premium Bamboo Fiber Dinner Plates",
            brand="EcoHome",
            description="Reusable and durable dinnerware made from natural bamboo fibre.",
            bullets=["Bamboo", "Reusable design", "Durable"],
            materials=["Bamboo Fiber"]
        ),
        "expected_range": (65, 85) # Should hit durable/reusable/bamboo
    },
    {
        "name": "2) Smartphone (electronics, epeat eligible but no mention)",
        "url": "https://example.com/smartphone",
        "data": ExtractedData(
            title="Budget Smartphone 12GB RAM",
            brand="TechCorp",
            description="A sleek new mobile device with an extended battery.",
            bullets=["Mobile phone", "High-res screen"],
            materials=[]
        ),
        "expected_range": (45, 60) # EPEAT check appended to transparency, but no bonus added
    },
    {
        "name": "3) Laptop with explicit EPEAT mention",
        "url": "https://example.com/laptop",
        "data": ExtractedData(
            title="Pro Laptop Computer",
            brand="GreenPC",
            description="This notebook is EPEAT Gold certified and highly durable.",
            bullets=["EPEAT certified", "Recycled plastic chassis"],
            materials=["Recycled Plastic"]
        ),
        "expected_range": (75, 95) # Should get EPEAT bonus and recycled content bonus
    },
    {
        "name": "4) Glass bottle product",
        "url": "https://example.com/glass-bottle",
        "data": ExtractedData(
            title="Clear Glass Water Bottle",
            brand="PureHydrate",
            description="Made of thick borosilicate glass. Reusable and dishwasher safe.",
            bullets=["Glass", "Reusable"],
            materials=[]
        ),
        "expected_range": (65, 85) # Should detect glass and reusable
    },
    {
        "name": "5) Bamboo fiber product with no glass mention",
        "url": "https://example.com/bamboo-cup",
        "data": ExtractedData(
            title="Bamboo Fiber Coffee Cup",
            brand="EcoSip",
            description="A sustainable cup made from bamboo fibre.",
            bullets=["Reusable cup"],
            materials=[]
        ),
        "expected_range": (65, 85) # Must detect bamboo, NOT glass
    }
]

async def run_tests():
    print("=== RUNNING HYBRID SCORING VALIDATION SUITE ===")
    
    for idx, s in enumerate(scenarios):
        print(f"\nScenario: {s['name']}")
        
        # 1. Run local extraction & API mapping
        hybrid_result = await analyze_product_hybrid(s['url'], s['data'])
        
        # 2. Run final mathematically bounded calibration
        final = calculate_score(hybrid_result)
        
        score = final['eco_score']
        band = final['level']
        conf = final['confidence']
        reasoning = final['scoring_reasoning']
        nlp = hybrid_result.get("nlp_score", 50)
        carbon = hybrid_result.get("carbon_estimate", {})
        
        print(f"  -> Score: {score} ({band})")
        print(f"  -> Target Range: {s['expected_range'][0]} - {s['expected_range'][1]}")
        print(f"  -> Confidence: {conf}%")
        print(f"  -> NLP Intent: {nlp}/100")
        print(f"  -> Dynamic Carbon Output: {carbon.get('kg_co2e', 'None')} kg_co2e (source: {carbon.get('source')})")
        print(f"  -> Reasoning: {reasoning}")
        print(f"  -> Pos Signals: {final.get('positive_signals_detected', [])}")
        print(f"  -> Neg Signals: {final.get('negative_signals_detected', [])}")
        print(f"  -> Breakdown: {final['breakdown']}")
        
        if s['expected_range'][0] <= score <= s['expected_range'][1]:
            print("  [PASS] Score falls within expected calibration range.")
        else:
            print(f"  [FAIL] Score {score} is OUTSIDE expected range {s['expected_range']}")

if __name__ == "__main__":
    asyncio.run(run_tests())
