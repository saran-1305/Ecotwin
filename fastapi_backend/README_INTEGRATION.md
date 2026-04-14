# EcoImpactAI Backend Integration Guide

This guide details how to run the FastAPI backend with Real OpenAI and Climatiq analysis.

## 1. Environment Setup

Create or update your `.env` file in `fastapi_backend/`:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
CLIMATIQ_API_KEY=climatiqu - JERV05RG8N5535EK5Z4GZ8CS78
DEBUG=true
```
*(Note: Remove "climatiqu - " prefix from the key if it was just a label, passing strictly the key `JERV05RG8N5535EK5Z4GZ8CS78`)*

## 2. Install Dependencies

Ensure you have the required packages:

```bash
pip install -r requirements.txt
```

*Repositories needed:* `fastapi`, `uvicorn`, `pydantic-settings`, `openai`, `httpx`

## 3. Run the Server

```bash
# From the fastapi_backend directory
uvicorn app.main:app --reload --port 8000
```

## 4. Sample Request

**POST** `http://localhost:8000/analyze`

```json
{
  "url": "https://example.com/product",
  "source": "manual",
  "extracted": {
    "title": "Eco-Friendly Bamboo Toothbrush",
    "description": "100% biodegradable bamboo handle, charcoal infused bristles.",
    "brand": "NatureSmile",
    "materials": ["Bamboo", "Nylon-4"],
    "bullets": ["Plastic-free packaging", "Vegan"],
    "certifications": ["FSC"]
  }
}
```

## 5. Sample Response Snapshot

```json
{
  "overallScore": 85,
  "breakdown": { "carbonImpact": 80, "circularity": 90, "ethics": 85 },
  "carbonEstimate": {
    "co2e_kg": 0.05,
    "unit": "kg",
    "method": "climatiq_estimate",
    "confidence": 0.7,
    "notes": "Estimated based on category proxy: consumer_goods"
  }
}
```
