from pydantic import BaseModel


class ProductRevenue(BaseModel):
    monthly_units_low: int
    monthly_units_mid: int
    monthly_units_high: int
    monthly_revenue_low: int
    monthly_revenue_mid: int
    monthly_revenue_high: int


class CompetitorSummary(BaseModel):
    rank: int
    asin: str
    title: str
    brand: str | None
    price: float | None
    rating: float
    review_count: int
    bsr: int | None
    bsr_category: str | None
    image_url: str | None
    product_url: str
    is_sponsored: bool
    is_prime: bool
    revenue: ProductRevenue | None = None


class ScoreDetail(BaseModel):
    score: int
    label: str
    factors: dict[str, float]
    unknown_brand_warning: bool = False


class MarketTotals(BaseModel):
    total_revenue_low: int
    total_revenue_mid: int
    total_revenue_high: int


class DistributionBucket(BaseModel):
    range: str
    count: int


class Distributions(BaseModel):
    price_buckets: list[DistributionBucket]
    rating_buckets: list[DistributionBucket]
    review_buckets: list[DistributionBucket]


class TopBrand(BaseModel):
    brand: str
    product_count: int
    avg_rating: float


class AIInsights(BaseModel):
    market_summary: str
    opportunity_analysis: str
    recommendations: list[str]
    risk_flags: list[str]
    model_used: str
    generated_at: str
    error: str | None = None


class MarketAnalysis(BaseModel):
    niche: str
    avg_price: float
    avg_reviews: int
    market_totals: MarketTotals
    competitiveness: ScoreDetail
    opportunity: ScoreDetail
    distributions: Distributions
    top_brands: list[TopBrand]
    insights: AIInsights
    competitors: list[CompetitorSummary]


class AnalyzeResponse(BaseModel):
    url: str
    cached: bool
    cache_hit: bool
    analysis: MarketAnalysis
