import asyncio
from openai import AsyncOpenAI
from app.config import get_settings

async def test_key():
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Hi"}],
        )
        print("Success:", resp.choices[0].message.content)
    except Exception as e:
        print("EXACT ERROR TYPE:", type(e))
        print("EXACT ERROR MESSAGE:", str(e))

if __name__ == "__main__":
    asyncio.run(test_key())
