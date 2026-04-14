# EcoTwin FastAPI Backend

Backend service for EcoTwin/EcoImpact AI, providing sustainability analysis using OpenAI.

## Setup

1.  **Install Python 3.10+**
2.  **Create a virtual environment (optional but recommended):**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Environment Variables:**
    Create a `.env` file in this directory:
    ```
    OPENAI_API_KEY=sk-your-openai-key-here
    PORT=8000
    DEBUG=true
    ```

## Running the Server

```bash
uvicorn app.main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`.
Docs are available at `http://localhost:8000/docs`.

## API Usage

**Endpoint:** `POST /analyze`

**Sample Curl:**
```bash
curl -X POST "http://localhost:8000/analyze" \
     -H "Content-Type: application/json" \
     -d '{
           "url": "https://www.amazon.com/dp/B08J5F3G18",
           "source": "amazon",
           "extracted": {
             "title": "Eco-Friendly Bamboo Toothbrush 4-Pack",
             "description": "Biodegradable handles, charcoal infused bristles.",
             "materials": ["bamboo", "nylon"],
             "priceText": "$9.99"
           }
         }'
```
