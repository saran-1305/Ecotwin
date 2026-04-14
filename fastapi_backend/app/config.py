
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    CLIMATIQ_API_KEY: str = ""
    FINNHUB_API_KEY: str = ""
    PORT: int = 8000
    DEBUG: bool = True
    APP_NAME: str = "EcoTwin Backend"

@lru_cache
def get_settings():
    return Settings()
