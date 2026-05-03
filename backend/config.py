from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    RAINFOREST_API_KEY: str = ""
    SCRAPINGDOG_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    APP_PIN: str = ""
    CACHE_TTL_SECONDS: int = 3600

    class Config:
        env_file = ".env"


settings = Settings()
