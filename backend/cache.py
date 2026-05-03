import hashlib
import pickle
import time
from typing import Any

from config import settings

try:
    import redis
    from redis.exceptions import RedisError
except ImportError:  # pragma: no cover - exercised only when dependency is missing
    redis = None

    class RedisError(Exception):
        pass


CACHE_KEY_PREFIX = "pixiii:cache:"


class TTLCache:
    def __init__(self, ttl_seconds: int = 3600):
        self._store: dict[str, tuple[Any, float]] = {}
        self._ttl = ttl_seconds

    def _key(self, key: str) -> str:
        return hashlib.md5(key.encode()).hexdigest()

    def get(self, key: str) -> Any | None:
        cache_key = self._key(key)
        entry = self._store.get(cache_key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.time() > expires_at:
            del self._store[cache_key]
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        cache_key = self._key(key)
        self._store[cache_key] = (value, time.time() + self._ttl)

    def clear(self) -> None:
        self._store.clear()


class RedisTTLCache:
    def __init__(self, redis_url: str, ttl_seconds: int = 3600):
        self._ttl = ttl_seconds
        self._fallback = TTLCache(ttl_seconds)
        self._client = None

        if redis is None:
            return

        try:
            self._client = redis.Redis.from_url(redis_url)
            self._client.ping()
        except RedisError:
            self._client = None

    def _key(self, key: str) -> str:
        digest = hashlib.md5(key.encode()).hexdigest()
        return f"{CACHE_KEY_PREFIX}{digest}"

    def _disable_redis(self) -> None:
        self._client = None

    def get(self, key: str) -> Any | None:
        if self._client is None:
            return self._fallback.get(key)

        try:
            raw = self._client.get(self._key(key))
        except RedisError:
            self._disable_redis()
            return self._fallback.get(key)

        if raw is None:
            return None

        try:
            return pickle.loads(raw)
        except (pickle.PickleError, EOFError, TypeError, ValueError):
            return None

    def set(self, key: str, value: Any) -> None:
        if self._client is None:
            self._fallback.set(key, value)
            return

        try:
            self._client.setex(self._key(key), self._ttl, pickle.dumps(value))
        except (RedisError, pickle.PickleError, TypeError, ValueError):
            self._disable_redis()
            self._fallback.set(key, value)

    def clear(self) -> None:
        self._fallback.clear()

        if self._client is None:
            return

        try:
            for key in self._client.scan_iter(f"{CACHE_KEY_PREFIX}*"):
                self._client.delete(key)
        except RedisError:
            self._disable_redis()


cache = RedisTTLCache(
    redis_url=settings.REDIS_URL,
    ttl_seconds=settings.CACHE_TTL_SECONDS,
)
