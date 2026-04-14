
import requests
from bs4 import BeautifulSoup

def test_scrape_image(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    try:
        print(f"Fetching {url}...")
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Test Priority 1: OG Image
        og = soup.find("meta", property="og:image")
        print(f"OG Image: {og['content'] if og else 'Not found'}")
        
        # Test Priority 2: Amazon Dynamic
        img_dyn = soup.select_one(".a-dynamic-image")
        print(f"Dynamic Image Tag found: {bool(img_dyn)}")
        if img_dyn:
            print(f"Dynamic Image Data: {img_dyn.get('data-a-dynamic-image')[:50]}...")

        # Test Priority 3: ID selectors
        landing = soup.select_one("#landingImage")
        print(f"Landing Image found: {bool(landing)}")
        if landing:
            print(f"Landing Src: {landing.get('src')}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_scrape_image("https://www.amazon.in/Boldfit-Bottles-Stainless-Bottle-Leakproof/dp/B0DJJ") # Corrected ASIN manually to try
    test_scrape_image("https://www.amazon.in/Boldfit-Bottles-Stainless-Bottle-Leakproof/dp/BODJJ") # User's likely URL
