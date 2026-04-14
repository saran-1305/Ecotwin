
import requests
from bs4 import BeautifulSoup
import time

def scrape_product_page(url: str):
    print(f"Scraping {url}...")
    start = time.time()
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Connection': 'keep-alive',
        }
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        title = soup.title.string if soup.title else "No Title"
        print(f"Title: {title}")
        print(f"Time taken: {time.time() - start:.2f}s")
        return True

    except Exception as e:
        print(f"Scraping Error: {e}")
        print(f"Time taken: {time.time() - start:.2f}s")
        return False

if __name__ == "__main__":
    url = "https://www.amazon.in/Boldfit-Bottles-Stainless-Bottle-Leakproof/dp/BODJJ"
    scrape_product_page(url)
