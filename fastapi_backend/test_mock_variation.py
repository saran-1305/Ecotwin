
from app.services.deterministic_mock import get_deterministic_mock
from app.models import ExtractedData

def test_variation():
    # Simulate failed scraping (generic data)
    extracted_generic = ExtractedData(
        title="Unable to extract title",
        description="Scraping failed",
        materials=[]
    )
    
    url1 = "https://www.amazon.in/bottle-1"
    url2 = "https://www.amazon.in/bottle-2"
    
    print(f"Testing URL 1: {url1}")
    result1 = get_deterministic_mock(extracted_generic, url=url1)
    print(f"Score 1: {result1['overallScore']}")
    
    print(f"Testing URL 2: {url2}")
    result2 = get_deterministic_mock(extracted_generic, url=url2)
    print(f"Score 2: {result2['overallScore']}")
    
    if result1['overallScore'] != result2['overallScore']:
        print("SUCCESS: Scores are different!")
    else:
        print("WARNING: Scores are the same (low probability collision or logic error).")

if __name__ == "__main__":
    test_variation()
