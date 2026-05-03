from __future__ import annotations

import re
from typing import Any

import httpx

from config import settings

RAINFOREST_BASE = "https://api.rainforestapi.com/request"
SCRAPINGDOG_BASE = "https://api.scrapingdog.com/amazon/"

MIN_PRODUCTS = 3
MAX_PRODUCTS = 10


class ScraperException(Exception):
    pass


# ---------------------------------------------------------------------------
# URL type detection
# ---------------------------------------------------------------------------

def _detect_url_type(url: str) -> str:
    if "/s?" in url or "?k=" in url or "&k=" in url:
        return "search"
    if "best-sellers" in url or "bestsellers" in url:
        return "bestsellers"
    if "/b?" in url or "node=" in url:
        return "category"
    # default to search so Rainforest can attempt to resolve it
    return "search"


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------

_GENERIC_TITLE_WORDS = {
    "the", "new", "best", "premium", "large", "small", "set", "pack",
    "piece", "lot", "bundle", "buy", "get", "with", "for", "and",
}

GENERIC_WORDS = {
    # product types
    "bamboo", "cutting", "board", "boards", "set", "sets", "pack", "pcs", "piece",
    "pieces", "mini", "large", "small", "medium", "extra", "heavy", "duty",
    "wooden", "plastic", "silicone", "stainless", "steel", "wood", "glass",
    # descriptors
    "premium", "professional", "commercial", "organic", "natural", "eco",
    "friendly", "safe", "dishwasher", "resistant", "proof", "grade",
    # numeric patterns
    "2pk", "3pk", "4pk", "6pk", "12pcs", "6/12pcs",
}


def extract_brand(product: dict[str, Any]) -> str:
    # 1. Direct API fields
    brand = product.get("brand") or product.get("manufacturer") or product.get("brand_name")
    if brand and brand.strip():
        return brand.strip()

    # 2. Specifications list: [{"name": "Brand", "value": "Acme"}, ...]
    for spec in product.get("specifications", []) or []:
        if isinstance(spec, dict) and spec.get("name", "").lower() == "brand":
            val = spec.get("value", "").strip()
            if val:
                return val

    # 3. Parse from title
    title: str = product.get("title", "")
    if not title:
        return "Unknown"

    tokens = title.split()
    if not tokens:
        return "Unknown"

    candidate_tokens: list[str] = []
    for token in tokens[:5]:
        clean = token.rstrip(".,:-")
        if clean.lower() in _GENERIC_TITLE_WORDS:
            # stop if we haven't collected anything yet, skip otherwise
            if not candidate_tokens:
                continue
            break
        if not candidate_tokens:
            # First token: accept if all-caps short word OR title-case
            if (clean.isupper() and 2 <= len(clean) <= 14) or clean.istitle():
                candidate_tokens.append(clean)
            else:
                break
        else:
            # Subsequent tokens: keep adding while title-case or all-caps
            if clean.istitle() or (clean.isupper() and len(clean) <= 14):
                candidate_tokens.append(clean)
                if len(candidate_tokens) >= 3:
                    break
            else:
                break

    if not candidate_tokens:
        return "Unknown"

    first_token = candidate_tokens[0]
    if re.match(r"^\d+[/\d]*", first_token) or first_token.lower() in GENERIC_WORDS:
        return "Unknown"

    brand_tokens = [first_token]
    for token in candidate_tokens[1:]:
        if token.lower() in GENERIC_WORDS and not (
            first_token.isupper() and token.isupper()
        ):
            break
        brand_tokens.append(token)

    return " ".join(brand_tokens)


def _parse_price(raw: Any) -> float | None:
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return float(raw)
    # strip currency symbols and commas → "£12,345.99" → 12345.99
    cleaned = re.sub(r"[^\d.]", "", str(raw))
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


def _parse_int(raw: Any, default: int = 0) -> int:
    if raw is None:
        return default
    if isinstance(raw, int):
        return raw
    try:
        return int(str(raw).replace(",", "").strip())
    except ValueError:
        return default


def _normalize(rank: int, item: dict[str, Any]) -> dict[str, Any] | None:
    """Return a normalized product dict or None if the product should be skipped."""
    price = _parse_price(
        item.get("price", {}).get("value") if isinstance(item.get("price"), dict)
        else item.get("price")
    )
    if price is None:
        return None  # filter out products with no price

    asin: str = item.get("asin") or item.get("id") or ""
    if not asin:
        return None

    # BSR may live at top level or inside bestsellers_rank list
    bsr: int | None = None
    bsr_category: str | None = None
    raw_bsr = item.get("bestsellers_rank") or item.get("rank")
    if isinstance(raw_bsr, list) and raw_bsr:
        bsr = _parse_int(raw_bsr[0].get("rank"), 0) or None
        bsr_category = raw_bsr[0].get("category")
    elif isinstance(raw_bsr, (int, float)):
        bsr = int(raw_bsr)

    # image
    image_url: str | None = None
    img = item.get("image") or item.get("thumbnail")
    if isinstance(img, str):
        image_url = img
    elif isinstance(img, dict):
        image_url = img.get("link") or img.get("url")

    # product URL
    link = item.get("link") or item.get("url") or (
        f"https://www.amazon.com/dp/{asin}" if asin else ""
    )

    # prime
    prime_raw = item.get("is_prime") or item.get("prime")
    is_prime = bool(prime_raw) if prime_raw is not None else False

    # sponsored
    sponsored_raw = item.get("is_sponsored") or item.get("sponsored")
    is_sponsored = bool(sponsored_raw) if sponsored_raw is not None else False

    return {
        "rank": rank,
        "asin": asin,
        "title": item.get("title", ""),
        "brand": extract_brand(item),
        "price": price,
        "rating": float(item["rating"]) if item.get("rating") is not None else 0.0,
        "review_count": _parse_int(item.get("ratings_total") or item.get("reviews_count")),
        "bsr": bsr,
        "bsr_category": bsr_category,
        "image_url": image_url,
        "product_url": link,
        "is_sponsored": is_sponsored,
        "is_prime": is_prime,
    }


def _extract_items(data: dict[str, Any], url_type: str) -> list[dict[str, Any]]:
    if url_type == "bestsellers":
        return data.get("bestsellers", [])[:MAX_PRODUCTS]
    # search and category both surface under search_results
    return data.get("search_results", [])[:MAX_PRODUCTS]


# ---------------------------------------------------------------------------
# Rainforest API
# ---------------------------------------------------------------------------

async def _call_rainforest(url: str, url_type: str, client: httpx.AsyncClient) -> list[dict]:
    # Rainforest rejects amazon_domain when url is also supplied — the domain
    # is implied by the url itself.
    params = {
        "api_key": settings.RAINFOREST_API_KEY,
        "type": url_type,
        "url": url,
    }
    resp = await client.get(RAINFOREST_BASE, params=params, timeout=30)
    if not resp.is_success:
        body = resp.json()
        msg = body.get("request_info", {}).get("message") or resp.text
        raise ScraperException(f"Rainforest API error {resp.status_code}: {msg}")
    data: dict = resp.json()

    raw_items = _extract_items(data, url_type)
    products = []
    for i, item in enumerate(raw_items, start=1):
        normalized = _normalize(i, item)
        if normalized:
            products.append(normalized)

    return products


# ---------------------------------------------------------------------------
# Scrapingdog fallback
# ---------------------------------------------------------------------------

async def _call_scrapingdog(url: str, client: httpx.AsyncClient) -> list[dict]:
    """
    Scrapingdog /amazon/search endpoint.
    Docs: https://www.scrapingdog.com/blog/scrape-amazon-search/
    """
    params = {
        "api_key": settings.SCRAPINGDOG_API_KEY,
        "domain": "com",
        "url": url,
    }
    resp = await client.get(SCRAPINGDOG_BASE, params=params, timeout=30)

    content_type = resp.headers.get("content-type", "")
    if "text/html" in content_type or not resp.text.strip().startswith(("{", "[")):
        raise ScraperException("Scrapingdog returned non-JSON response — check API key and endpoint")

    data = resp.json()
    if isinstance(data, dict) and not data.get("success", True):
        raise ScraperException(f"Scrapingdog error: {data.get('message', 'unknown')}")

    # Scrapingdog returns either a list directly or {"products": [...]}
    raw_items: list = data if isinstance(data, list) else data.get("products", [])
    raw_items = raw_items[:MAX_PRODUCTS]

    products = []
    for i, item in enumerate(raw_items, start=1):
        normalized = _normalize(i, item)
        if normalized:
            products.append(normalized)

    return products


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def scrape_competitors(url: str) -> list[dict[str, Any]]:
    """
    Scrape up to 10 competitors for the given Amazon URL.
    Tries Rainforest API first; falls back to Scrapingdog if Rainforest fails.
    Raises ScraperException if fewer than 3 priced products are found.
    """
    url_type = _detect_url_type(url)

    async with httpx.AsyncClient() as client:
        products: list[dict] = []
        rainforest_error: str | None = None

        if settings.RAINFOREST_API_KEY:
            try:
                products = await _call_rainforest(url, url_type, client)
            except Exception as exc:
                rainforest_error = str(exc)

        if len(products) < MIN_PRODUCTS and settings.SCRAPINGDOG_API_KEY:
            try:
                products = await _call_scrapingdog(url, client)
            except Exception as exc:
                if rainforest_error:
                    raise ScraperException(
                        f"Both APIs failed. Rainforest: {rainforest_error}. "
                        f"Scrapingdog: {exc}"
                    ) from exc
                raise ScraperException(f"Scrapingdog error: {exc}") from exc

        if not products and rainforest_error:
            raise ScraperException(f"Rainforest API error: {rainforest_error}")

        if len(products) < MIN_PRODUCTS:
            raise ScraperException(
                f"Only {len(products)} priced product(s) found — need at least {MIN_PRODUCTS}. "
                "The search may be too narrow or the URL type was not recognized correctly."
            )

    return products[:MAX_PRODUCTS]
