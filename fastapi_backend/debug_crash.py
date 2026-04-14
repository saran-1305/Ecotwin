import traceback
import asyncio
from app.main import analyze_product_endpoint
from app.models import AnalyzeRequest

async def run():
    try:
        req = AnalyzeRequest(url="https://www.amazon.com/dp/B0DJJ9Z3XZ", source="extension_quick_scan")
        result = await analyze_product_endpoint(req)
        print("Success!", result)
    except Exception as e:
        print("EXCEPTION CAUGHT:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run())
