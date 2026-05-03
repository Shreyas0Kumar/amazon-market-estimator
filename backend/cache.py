import hashlib
import time
from typing import Any


class TTLCache:
    def __init__(self, ttl_seconds: int = 3600):
        self._store: dict[str, tuple[Any, float]] = {}
        self._ttl = ttl_seconds

    def _key(self, url: str) -> str:
        return hashlib.md5(url.encode()).hexdigest()

    def get(self, url: str) -> Any | None:
        key = self._key(url)
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.time() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, url: str, value: Any) -> None:
        key = self._key(url)
        self._store[key] = (value, time.time() + self._ttl)

    def clear(self) -> None:
        self._store.clear()


cache = TTLCache()
