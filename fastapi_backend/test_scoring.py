import asyncio
from app.services.scoring import calculate_score

# Mock scenarios to prove the score spread
scenarios = [
    {
        "name": "Organic cotton t-shirt + recyclable packaging + brand sustainability claims",
        "expected": "75+",
        "data": {
            "breakdown": {"material": 80, "packaging": 80, "durability": 80, "brand_record": 90, "lifecycle": 85},
            # simulate text corpus keywords
            "signals": ["organic cotton", "gots", "recyclable packaging", "certified sustainability report"],
        }
    },
    {
        "name": "Stainless steel reusable bottle + no brand info",
        "expected": "~65–80",
        "data": {
            "breakdown": {"material": 90, "packaging": 50, "durability": 95, "brand_record": 30, "lifecycle": 60},
            "signals": ["stainless steel", "reusable", "durable"]
        }
    },
    {
        "name": "Mixed plastic disposable product + no transparency",
        "expected": "~20–45",
        "data": {
            "breakdown": {"material": 10, "packaging": 10, "durability": 10, "brand_record": 10, "lifecycle": 10},
            "signals": ["single-use", "disposable", "virgin plastic", "pvc", "throwaway"]
        }
    },
    {
        "name": "Sparse unknown product data",
        "expected": "~45–60",
        "data": {
            "breakdown": {"material": 50, "packaging": 50, "durability": 50, "brand_record": 50, "lifecycle": 50},
            "signals": []
        }
    },
    {
        "name": "Recycled/biodegradable garbage bags with recyclable claims",
        "expected": "High",
        "data": {
            "breakdown": {"material": 85, "packaging": 80, "durability": 20, "brand_record": 60, "lifecycle": 90},
            "signals": ["recycled content", "biodegradable", "compostable", "recyclable packaging"]
        }
    },
    {
        "name": "Plain cotton (not organic) + plastic packaging",
        "expected": "Lower/Mediocre",
        "data": {
            "breakdown": {"material": 60, "packaging": 30, "durability": 50, "brand_record": 40, "lifecycle": 40},
            "signals": ["cotton", "plastic packaging"]
        }
    }
]

def run_tests():
    print("--------------------------------------------------")
    print("Testing Robust Eco-Score Calibration Model")
    print("--------------------------------------------------")
    for s in scenarios:
        # Simulate str cast in calculate_score by flattening signals
        data_to_pass = s['data'].copy()
        data_to_pass['raw_text_for_test'] = " ".join(s['data']['signals']).lower()
        
        # We need to monkeypath the str(ai_result) in calculate_score just for this test, 
        # but actually calculate_score just does str(ai_result).lower() which works on the dict.
        data_to_pass['signals'] = " ".join(s['data']['signals']).lower()
        
        result = calculate_score(data_to_pass)
        
        print(f"SCENARIO: {s['name']}")
        print(f"EXPECTED: {s['expected']}")
        print(f"SCORE   : {result['eco_score']} ({result['level']})")
        print(f"CONFID  : {result['confidence']} ({result['data_quality']})")
        print(f"REASON  : {result['scoring_reasoning']}")
        print(f"POS SIG : {result['positive_signals_detected']}")
        print(f"NEG SIG : {result['negative_signals_detected']}")
        print("--------------------------------------------------")

if __name__ == "__main__":
    run_tests()
