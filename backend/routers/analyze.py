import asyncio

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from cache import cache
from config import settings
from models.request import AnalyzeRequest
from models.response import (
    AIInsights,
    AnalyzeResponse,
    CompetitorSummary,
    Distributions,
    DistributionBucket,
    MarketAnalysis,
    MarketTotals,
    ProductRevenue,
    TopBrand,
)
from services.openai_service import (
    build_distributions,
    build_top_brands,
    generate_market_insights,
)
from services.revenue import (
    average_price,
    average_reviews,
    estimate_market_totals,
    estimate_product_revenue,
)
from services.scoring import competitiveness_score, opportunity_score
from services.scraper import ScraperException, scrape_competitors

router = APIRouter()
pending_requests: dict[str, asyncio.Task[AnalyzeResponse | JSONResponse]] = {}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse | JSONResponse:
    if request.pin != settings.APP_PIN:
        return JSONResponse(
            status_code=401,
            content={"error": "invalid_pin", "message": "Invalid PIN"},
        )

    if "amazon.com" not in request.url:
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_url", "message": "URL must be an amazon.com link"},
        )

    if request.url in pending_requests:
        return await pending_requests[request.url]

    task = asyncio.create_task(_run_analysis(request.url))
    pending_requests[request.url] = task
    try:
        return await task
    finally:
        pending_requests.pop(request.url, None)


async def _run_analysis(url: str) -> AnalyzeResponse | JSONResponse:
    try:
        cached = cache.get(url)
        if cached is not None:
            return AnalyzeResponse(
                url=url,
                cached=True,
                cache_hit=True,
                analysis=cached,
            )

        raw_products = await scrape_competitors(url)

        # Per-product revenue
        products_with_revenue = []
        for p in raw_products:
            revenue_estimate = estimate_product_revenue(
                price=p.get("price") or 0.0,
                review_count=p.get("review_count") or 0,
                bsr=p.get("bsr"),
            )
            products_with_revenue.append({
                **p,
                "revenue": revenue_estimate,
                "revenue_estimate": revenue_estimate,
            })

        # Market-level numbers
        market_totals = estimate_market_totals(products_with_revenue)
        comp_score = competitiveness_score(products_with_revenue)
        opp_score = opportunity_score(products_with_revenue)

        avg_p = average_price(raw_products)
        avg_r = average_reviews(raw_products)
        prices = [p["price"] for p in raw_products if p.get("price")]

        market_summary = {
            "total_estimated_monthly_revenue_mid": market_totals["total_revenue_mid"],
            "average_price": avg_p,
            "average_rating": round(
                sum(p.get("rating") or 0 for p in raw_products) / max(len(raw_products), 1), 2
            ),
            "total_reviews": sum(p.get("review_count") or 0 for p in raw_products),
            "price_range": {
                "min": min(prices) if prices else 0,
                "max": max(prices) if prices else 0,
            },
        }

        scoring_summary = {
            "competitiveness_score": comp_score["score"],
            "competitiveness_label": comp_score["label"],
            "opportunity_score": opp_score["score"],
            "opportunity_label": opp_score["label"],
            "unknown_brand_warning": comp_score.get("unknown_brand_warning", False),
        }

        # Analytics helpers
        raw_distributions = build_distributions(products_with_revenue)
        top_brands_raw = build_top_brands(products_with_revenue)

        # OpenAI insights
        insights_raw = await generate_market_insights(
            products_with_revenue, market_summary, scoring_summary
        )

        # Build response objects
        competitors = [
            CompetitorSummary(
                **{
                    k: v
                    for k, v in p.items()
                    if k not in {"revenue", "revenue_estimate"}
                },
                revenue=ProductRevenue(**p["revenue_estimate"]),
            )
            for p in products_with_revenue
        ]

        distributions = Distributions(
            price_buckets=[DistributionBucket(**b) for b in raw_distributions["price_buckets"]],
            rating_buckets=[DistributionBucket(**b) for b in raw_distributions["rating_buckets"]],
            review_buckets=[DistributionBucket(**b) for b in raw_distributions["review_buckets"]],
        )

        analysis = MarketAnalysis(
            niche=_detect_niche(raw_products),
            avg_price=avg_p,
            avg_reviews=avg_r,
            market_totals=MarketTotals(**market_totals),
            competitiveness=comp_score,
            opportunity=opp_score,
            distributions=distributions,
            top_brands=[TopBrand(**b) for b in top_brands_raw],
            insights=AIInsights(**insights_raw),
            competitors=competitors,
        )

        cache.set(url, analysis)
        return AnalyzeResponse(
            url=url,
            cached=False,
            cache_hit=False,
            analysis=analysis,
        )
    except ScraperException as exc:
        return JSONResponse(
            status_code=422,
            content={"error": "scrape_failed", "message": str(exc)},
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": "internal_error", "message": str(exc)},
        )


def _detect_niche(products: list[dict]) -> str:
    if products:
        words = products[0].get("title", "").split()
        return " ".join(words[:4]) if words else "Unknown"
    return "Unknown"
