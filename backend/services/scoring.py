from typing import Any

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

_LABEL_COMPETITIVENESS = [
    (75, "Very High"),
    (50, "High"),
    (25, "Medium"),
    (0,  "Low"),
]

_LABEL_OPPORTUNITY = [
    (66, "High"),
    (33, "Moderate"),
    (0,  "Low"),
]


def _label(score: int, table: list[tuple[int, str]]) -> str:
    for threshold, label in table:
        if score >= threshold:
            return label
    return table[-1][1]


def _avg_review_normalized(products: list[dict[str, Any]]) -> float:
    """Scale avg review count to 0-100 where 10 000+ reviews = 100."""
    if not products:
        return 0.0
    avg = sum(p.get("review_count") or 0 for p in products) / len(products)
    return min(100.0, avg / 100.0)


# ---------------------------------------------------------------------------
# Competitiveness score
# ---------------------------------------------------------------------------

def competitiveness_score(products: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Returns how hard it is to compete in this niche.

    Factors
    -------
    avg_review_count_normalized  (weight 50%)
        0  = nobody has any reviews
        100 = average competitor has ≥ 10 000 reviews

    top_brand_concentration  (weight 30%)
        % of the product list owned by the single most common brand × 100
        Unbranded / None products are grouped together.

    avg_rating_barrier  (weight 20%)
        How far above 3.0 the average rating is, scaled 0-100.
        (avg_rating - 3.0) / 2.0 * 100
    """
    if not products:
        return {"score": 0, "label": "Low", "factors": {}}

    # --- factor 1: review depth ---
    review_norm = _avg_review_normalized(products)

    # --- factor 2: brand concentration ---
    brand_counts: dict[str, int] = {}
    for p in products:
        brand = (p.get("brand") or "Unknown").strip() or "Unknown"
        brand_counts[brand] = brand_counts.get(brand, 0) + 1

    unknown_count = brand_counts.get("Unknown", 0)
    unknown_ratio = round(unknown_count / len(products) * 100, 1)
    unknown_brand_warning = unknown_count > len(products) * 0.5

    known_brands = {b: c for b, c in brand_counts.items() if b.lower() != "unknown"}
    if not known_brands:
        # Cannot measure concentration — use neutral default to avoid inflating score
        concentration = 50.0
    else:
        top_brand_count = max(known_brands.values())
        concentration = round(top_brand_count / len(products) * 100, 1)

    # --- factor 3: rating barrier ---
    ratings = [p["rating"] for p in products if p.get("rating") is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else 3.0
    rating_barrier = round(max(0.0, (avg_rating - 3.0) / 2.0 * 100), 1)

    # --- weighted final ---
    raw = review_norm * 0.50 + concentration * 0.30 + rating_barrier * 0.20
    score = min(100, round(raw))

    return {
        "score": score,
        "label": _label(score, _LABEL_COMPETITIVENESS),
        "unknown_brand_warning": unknown_brand_warning,
        "factors": {
            "avg_review_count_normalized": round(review_norm, 1),
            "top_brand_concentration":     concentration,
            "avg_rating_barrier":          rating_barrier,
            "unknown_brand_ratio":         unknown_ratio,
        },
    }


# ---------------------------------------------------------------------------
# Opportunity score
# ---------------------------------------------------------------------------

def opportunity_score(products: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Returns how much whitespace exists in this niche.

    Factors (equal weight, averaged)
    ----------------------------------
    review_gap  (inverse of review depth)
        100 - avg_review_count_normalized

    price_gap
        Detects whether any $10-wide price tier in the observed range
        has fewer than 2 products.
        100 if a gap exists, 0 if the range is fully covered.

    rating_gap
        % of products rated below 4.2 * 100
        High value = buyers are settling for mediocre products.
    """
    if not products:
        return {"score": 0, "label": "Low", "factors": {}}

    # --- factor 1: review gap ---
    review_norm = _avg_review_normalized(products)
    review_gap = round(100.0 - review_norm, 1)

    # --- factor 2: price gap ---
    prices = [p["price"] for p in products if p.get("price")]
    price_gap = 0.0
    if prices:
        lo, hi = min(prices), max(prices)
        tier_width = 10.0
        n_tiers = max(1, round((hi - lo) / tier_width))
        tiers = [0] * n_tiers
        for price in prices:
            idx = min(n_tiers - 1, int((price - lo) / tier_width))
            tiers[idx] += 1
        price_gap = 100.0 if any(t < 2 for t in tiers) else 0.0

    # --- factor 3: rating gap ---
    low_rating_count = sum(
        1 for p in products
        if p.get("rating") is not None and p["rating"] < 4.2
    )
    rating_gap = round(low_rating_count / len(products) * 100, 1)

    raw = (review_gap + price_gap + rating_gap) / 3.0
    score = min(100, round(raw))

    return {
        "score": score,
        "label": _label(score, _LABEL_OPPORTUNITY),
        "factors": {
            "review_gap":  review_gap,
            "price_gap":   price_gap,
            "rating_gap":  rating_gap,
        },
    }
