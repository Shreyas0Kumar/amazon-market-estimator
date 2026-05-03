from typing import Any

# ---------------------------------------------------------------------------
# BSR tier multipliers
# ---------------------------------------------------------------------------

def _bsr_multiplier(bsr: int | None) -> float:
    if bsr is None:
        return 1.0
    if bsr <= 100:
        return 1.5
    if bsr <= 500:
        return 1.2
    if bsr <= 2000:
        return 1.0
    return 0.8


# ---------------------------------------------------------------------------
# Per-product revenue estimate
# ---------------------------------------------------------------------------

def estimate_product_revenue(
    price: float,
    review_count: int,
    bsr: int | None,
) -> dict[str, int]:
    multiplier = _bsr_multiplier(bsr)

    units_low  = review_count * 0.03 * multiplier
    units_mid  = review_count * 0.05 * multiplier
    units_high = review_count * 0.08 * multiplier

    return {
        "monthly_units_low":     round(units_low),
        "monthly_units_mid":     round(units_mid),
        "monthly_units_high":    round(units_high),
        "monthly_revenue_low":   round(units_low  * price),
        "monthly_revenue_mid":   round(units_mid  * price),
        "monthly_revenue_high":  round(units_high * price),
    }


# ---------------------------------------------------------------------------
# Market-level aggregates
# ---------------------------------------------------------------------------

def estimate_market_totals(products_with_revenue: list[dict[str, Any]]) -> dict[str, int]:
    totals: dict[str, int] = {
        "total_revenue_low":  0,
        "total_revenue_mid":  0,
        "total_revenue_high": 0,
    }
    for p in products_with_revenue:
        rev = p.get("revenue", {})
        totals["total_revenue_low"]  += rev.get("monthly_revenue_low",  0)
        totals["total_revenue_mid"]  += rev.get("monthly_revenue_mid",  0)
        totals["total_revenue_high"] += rev.get("monthly_revenue_high", 0)
    return totals


# ---------------------------------------------------------------------------
# Helpers kept for backward-compat with the router
# ---------------------------------------------------------------------------

def average_price(products: list[dict[str, Any]]) -> float:
    priced = [p["price"] for p in products if p.get("price")]
    if not priced:
        return 0.0
    return round(sum(priced) / len(priced), 2)


def average_reviews(products: list[dict[str, Any]]) -> int:
    if not products:
        return 0
    return round(sum(p.get("review_count") or 0 for p in products) / len(products))
