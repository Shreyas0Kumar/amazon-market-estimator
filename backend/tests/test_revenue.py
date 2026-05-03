import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from services.revenue import estimate_market_totals, estimate_product_revenue


def assert_within_10_percent(actual: int, expected: int) -> None:
    tolerance = expected * 0.10
    assert expected - tolerance <= actual <= expected + tolerance


def assert_revenue_range(result: dict[str, int], expected: dict[str, int]) -> None:
    for key, expected_value in expected.items():
        assert_within_10_percent(result[key], expected_value)


def expected_revenue(price: float, review_count: int, multiplier: float) -> dict[str, int]:
    units_low = review_count * 0.03 * multiplier
    units_mid = review_count * 0.05 * multiplier
    units_high = review_count * 0.08 * multiplier

    return {
        "monthly_units_low": round(units_low),
        "monthly_units_mid": round(units_mid),
        "monthly_units_high": round(units_high),
        "monthly_revenue_low": round(units_low * price),
        "monthly_revenue_mid": round(units_mid * price),
        "monthly_revenue_high": round(units_high * price),
    }


def test_estimate_product_revenue_with_reviews_and_price_no_bsr() -> None:
    result = estimate_product_revenue(price=20.0, review_count=1000, bsr=None)

    assert_revenue_range(
        result,
        expected_revenue(price=20.0, review_count=1000, multiplier=1.0),
    )


@pytest.mark.parametrize(
    ("bsr", "multiplier"),
    [
        (100, 1.5),
        (500, 1.2),
        (2000, 1.0),
        (2001, 0.8),
    ],
)
def test_estimate_product_revenue_with_bsr_tiers(
    bsr: int,
    multiplier: float,
) -> None:
    result = estimate_product_revenue(price=25.0, review_count=1000, bsr=bsr)

    assert_revenue_range(
        result,
        expected_revenue(price=25.0, review_count=1000, multiplier=multiplier),
    )


def test_estimate_product_revenue_with_zero_reviews() -> None:
    result = estimate_product_revenue(price=20.0, review_count=0, bsr=100)

    assert_revenue_range(
        result,
        expected_revenue(price=20.0, review_count=0, multiplier=1.5),
    )


def test_estimate_product_revenue_with_zero_price() -> None:
    result = estimate_product_revenue(price=0.0, review_count=1000, bsr=100)

    assert_revenue_range(
        result,
        expected_revenue(price=0.0, review_count=1000, multiplier=1.5),
    )


def test_estimate_market_totals_with_three_products() -> None:
    products = [
        {
            "revenue": estimate_product_revenue(
                price=10.0,
                review_count=1000,
                bsr=100,
            ),
        },
        {
            "revenue": estimate_product_revenue(
                price=20.0,
                review_count=500,
                bsr=500,
            ),
        },
        {
            "revenue": estimate_product_revenue(
                price=30.0,
                review_count=250,
                bsr=2001,
            ),
        },
    ]

    result = estimate_market_totals(products)
    expected = {
        "total_revenue_low": 450 + 360 + 180,
        "total_revenue_mid": 750 + 600 + 300,
        "total_revenue_high": 1200 + 960 + 480,
    }

    assert_revenue_range(result, expected)
