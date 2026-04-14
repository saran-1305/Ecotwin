
import requests
from bs4 import BeautifulSoup
from app.models import ExtractedData
from app.utils.text_clean import clean_text, truncate_text

def scrape_product_page(url: str) -> ExtractedData:
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.extract()
            
        # Extract title
        title = soup.title.string if soup.title else ""
        og_title = soup.find("meta", property="og:title")
        if og_title:
            title = og_title["content"]
        h1 = soup.find("h1")
        if h1:
            title = h1.get_text()
            
        # Extract description
        description = ""
        og_desc = soup.find("meta", property="og:description")
        if og_desc:
            description = og_desc["content"]
        if not description:
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc:
                description = meta_desc["content"]
        if not description:
            # Fallback: grab first few paragraphs
            paragraphs = soup.find_all('p')
            description = " ".join([p.get_text() for p in paragraphs[:3]])
            
        # Extract price (simple heuristic)
        price_text = None
        price_meta = soup.find("meta", property="product:price:amount")
        if price_meta:
            price_text = price_meta["content"]
        
        if not price_text:
            # Try finding common price classes
            price_element = soup.select_one(".price, .product-price, .a-price-whole")
            if price_element:
                price_text = price_element.get_text(strip=True)

        # Extract image URL
        image_url = None
        
        # Priority 1: Amazon specific
        img_tag = soup.select_one("#landingImage, #imgBlkFront, .a-dynamic-image, #main-image")
        if img_tag:
            # Try specific attributes used by Amazon
            if img_tag.get("data-old-hires"):
                image_url = img_tag["data-old-hires"]
            elif img_tag.get("data-a-dynamic-image"):
                # This attribute contains a JSON dict of images, pick the largest (last key usually)
                try:
                    import json
                    data = json.loads(img_tag["data-a-dynamic-image"])
                    if data:
                        image_url = list(data.keys())[-1]
                except:
                    pass
            if not image_url and img_tag.get("src"):
                image_url = img_tag["src"]
        
        # Priority 2: Flipkart specific
        if not image_url:
            flipkart_img = soup.select_one("img._396cs4, img._2r_T1I, img._2N8cXb, img.v2k6zs, img.DByuf4")
            if flipkart_img and flipkart_img.get("src"):
                image_url = flipkart_img["src"]

        # Priority 3: Common e-commerce selectors
        if not image_url:
            for selector in [".product-image-photo", ".gallery-image", ".main-image", "img[itemprop='image']"]:
                img = soup.select_one(selector)
                if img and img.get("src"):
                    image_url = img["src"]
                    break
                    
        # Priority 4: Open Graph Image (Fallback because Amazon/Flipkart often put their logo here)
        if not image_url:
            og_image = soup.find("meta", property="og:image")
            if og_image:
                image_url = og_image["content"]

        return ExtractedData(
            title=clean_text(title),
            description=truncate_text(clean_text(description), 1000),
            priceText=price_text,
            materials=[], 
            imageUrl=image_url
        )

    except Exception as e:
        print(f"Scraping Error for {url}: {e}")
        # Return minimal data if scraping fails
        return ExtractedData(
            title="Unable to extract title",
            description="Scraping failed, please rely on manual input or extension data."
        )
