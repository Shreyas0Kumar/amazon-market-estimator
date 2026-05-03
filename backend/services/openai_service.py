from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import httpx
from openai import AsyncOpenAI

from config import settings

_MODEL = "gpt-4o-mini"

# ---------------------------------------------------------------------------
# Pure analytics helpers (no OpenAI)
# ---------------------------------------------------------------------------

_PRICE_BUCKETS = [
    ("$0-$15",   0,    15),
    ("$15-$30",  15,   30),
    ("$30-$60",  30,   60),
    ("$60-$100", 60,  100),
    ("$100+",   100, float("inf")),
]

_RATING_BUCKETS = [
    ("<3.5",    0.0, 3.5),
    ("3.5-4.0", 3.5, 4.0),
    ("4.0-4.5", 4.0, 4.5),
    ("4.5-5.0", 4.5, 5.01),
]

_REVIEW_BUCKETS = [
    ("<100",        0,     100),
    ("100-500",   100,     500),
    ("500-2000",  500,    2000),
    ("2000-10000", 2000, 10000),
    ("10000+",   10000, float("inf")),
]


def build_distributions(products: list[dict[str, Any]]) -> dict[str, list[dict]]:
    def _bucket(value: float | None, ranges: list[tuple]) -> str | None:
        if value is None:
            return None
        for label, lo, hi in ranges:
            if lo <= value < hi:
                return label
        return None

    price_counts: dict[str, int] = {b[0]: 0 for b in _PRICE_BUCKETS}
    rating_counts: dict[str, int] = {b[0]: 0 for b in _RATING_BUCKETS}
    review_counts: dict[str, int] = {b[0]: 0 for b in _REVIEW_BUCKETS}

    for p in products:
        pb = _bucket(p.get("price"), _PRICE_BUCKETS)
        if pb:
            price_counts[pb] += 1

        rb = _bucket(p.get("rating"), _RATING_BUCKETS)
        if rb:
            rating_counts[rb] += 1

        rvb = _bucket(float(p.get("review_count") or 0), _REVIEW_BUCKETS)
        if rvb:
            review_counts[rvb] += 1

    return {
        "price_buckets":  [{"range": r, "count": c} for r, c in price_counts.items()],
        "rating_buckets": [{"range": r, "count": c} for r, c in rating_counts.items()],
        "review_buckets": [{"range": r, "count": c} for r, c in review_counts.items()],
    }


def build_top_brands(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    aggregated: dict[str, dict[str, Any]] = {}
    for p in products:
        brand = (p.get("brand") or "").strip()
        if not brand or brand.lower() == "unknown":
            continue
        if brand not in aggregated:
            aggregated[brand] = {"product_count": 0, "ratings": []}
        aggregated[brand]["product_count"] += 1
        if p.get("rating") is not None:
            aggregated[brand]["ratings"].append(p["rating"])

    results = []
    for brand, data in aggregated.items():
        ratings = data["ratings"]
        avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
        results.append({
            "brand": brand,
            "product_count": data["product_count"],
            "avg_rating": avg_rating,
        })

    results.sort(key=lambda x: (-x["product_count"], -x["avg_rating"]))
    return results[:5]


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = (
    "You are a senior Amazon market research analyst. A user wants to know if they "
    "should enter this product niche. Respond ONLY with a valid JSON object — no "
    "markdown, no explanation, no code fences. Be direct and specific, not generic."
)

_JSON_SCHEMA = """{
  "market_summary": "2-3 sentences describing market size, who dominates, and overall health",
  "opportunity_analysis": "2-3 sentences on whether a new entrant can compete and where the gap is",
  "recommendations": [
    "Specific actionable tip 1",
    "Specific actionable tip 2",
    "Specific actionable tip 3",
    "Specific actionable tip 4"
  ],
  "risk_flags": [
    "Specific risk 1",
    "Specific risk 2"
  ]
}"""


def _build_user_prompt(
    products: list[dict[str, Any]],
    market_summary: dict[str, Any],
    scoring: dict[str, Any],
) -> str:
    mid_rev = market_summary.get("total_estimated_monthly_revenue_mid", 0)
    avg_price = market_summary.get("average_price", 0)
    avg_rating = market_summary.get("average_rating", 0)
    total_reviews = market_summary.get("total_reviews", 0)
    price_min = market_summary.get("price_range", {}).get("min", 0)
    price_max = market_summary.get("price_range", {}).get("max", 0)

    comp_score = scoring.get("competitiveness_score", 0)
    comp_label = scoring.get("competitiveness_label", "")
    opp_score = scoring.get("opportunity_score", 0)
    opp_label = scoring.get("opportunity_label", "")

    header = (
        f"Market: est. ${mid_rev:,}/month | avg price ${avg_price:.2f} "
        f"| avg rating {avg_rating:.1f} | total reviews {total_reviews:,} "
        f"| price range ${price_min:.2f}–${price_max:.2f}"
    )

    rows = ["rank | brand | price | rating | reviews | est_monthly_rev_mid"]
    rows.append("-" * 70)
    for p in products:
        rev = p.get("revenue", {})
        mid = rev.get("monthly_revenue_mid", 0)
        rows.append(
            f"{p.get('rank', '?'):>4} | "
            f"{(p.get('brand') or 'Unknown')[:22]:<22} | "
            f"${p.get('price') or 0:>6.2f} | "
            f"{p.get('rating') or 0:>6.1f} | "
            f"{p.get('review_count') or 0:>8,} | "
            f"${mid:>9,}"
        )

    scores_line = (
        f"Competitiveness: {comp_score}/100 ({comp_label}), "
        f"Opportunity: {opp_score}/100 ({opp_label})"
    )

    brand_note = ""
    if scoring.get("unknown_brand_warning"):
        brand_note = "\nNote: brand data is partially unavailable for this query."

    prompt = "\n".join([
        header,
        "",
        "\n".join(rows),
        "",
        scores_line,
        brand_note,
        "",
        f"Respond with this exact JSON shape:\n{_JSON_SCHEMA}",
    ])
    return prompt.strip()


# ---------------------------------------------------------------------------
# Main async function
# ---------------------------------------------------------------------------

async def generate_market_insights(
    products: list[dict[str, Any]],
    market_summary: dict[str, Any],
    scoring: dict[str, Any],
) -> dict[str, Any]:
    generated_at = datetime.now(timezone.utc).isoformat()
    base = {
        "model_used": _MODEL,
        "generated_at": generated_at,
    }

    try:
        user_prompt = _build_user_prompt(products, market_summary, scoring)

        async with httpx.AsyncClient(trust_env=False) as http_client:
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, http_client=http_client)
            response = await client.chat.completions.create(
                model=_MODEL,
                max_tokens=800,
                temperature=0.4,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user",   "content": user_prompt},
                ],
            )

        parsed = json.loads(response.choices[0].message.content)
        return {
            "market_summary":       parsed.get("market_summary", ""),
            "opportunity_analysis": parsed.get("opportunity_analysis", ""),
            "recommendations":      parsed.get("recommendations", []),
            "risk_flags":           parsed.get("risk_flags", []),
            **base,
        }

    except Exception as e:
        return {
            "market_summary":       "",
            "opportunity_analysis": "",
            "recommendations":      [],
            "risk_flags":           [],
            "error":                str(e),
            **base,
        }
