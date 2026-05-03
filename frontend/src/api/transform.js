export function transformApiResponse(apiData) {
  const marketSummary = apiData.market_summary
  const scoring = apiData.scoring
  const distributions = apiData.distributions
  const aiInsights = apiData.ai_insights

  return {
    query: apiData.query_keyword,
    summary: {
      estMonthlyRevenue: {
        mid: marketSummary.total_estimated_monthly_revenue_mid,
        low: marketSummary.total_estimated_monthly_revenue_low,
        high: marketSummary.total_estimated_monthly_revenue_high,
      },
      avgPrice: marketSummary.average_price,
      avgRating: marketSummary.average_rating,
      reviewsAnalyzed: marketSummary.total_reviews,
      productsAnalyzed: apiData.total_products_analyzed,
    },
    scores: {
      competitiveness: {
        score: scoring.competitiveness_score,
        label: scoring.competitiveness_label,
        factors: [
          { name: 'Review Depth', value: scoring.competitiveness_factors.avg_review_count_normalized },
          { name: 'Brand Concentration', value: scoring.competitiveness_factors.top_brand_concentration },
          { name: 'Rating Barrier', value: scoring.competitiveness_factors.avg_rating_barrier },
        ],
      },
      opportunity: {
        score: scoring.opportunity_score,
        label: scoring.opportunity_label,
        factors: [
          { name: 'Review Gap', value: scoring.opportunity_factors.review_gap },
          { name: 'Price Gap', value: scoring.opportunity_factors.price_gap },
          { name: 'Rating Gap', value: scoring.opportunity_factors.rating_gap },
        ],
      },
    },
    products: apiData.top_products.map(p => ({
      rank: p.rank,
      name: p.title,
      brand: p.brand,
      price: p.price,
      rating: p.rating,
      reviews: p.review_count,
      revenue: {
        low: p.revenue_estimate.monthly_revenue_low,
        mid: p.revenue_estimate.monthly_revenue_mid,
        high: p.revenue_estimate.monthly_revenue_high,
      },
      sponsored: p.is_sponsored,
      image: p.image_url || null,
    })),
    brands: apiData.top_brands.map(b => ({
      name: b.brand,
      products: b.product_count,
      rating: b.avg_rating,
    })),
    priceDistribution: distributions.price_buckets.map(b => ({ label: b.range, count: b.count })),
    ratingDistribution: distributions.rating_buckets.map(b => ({ label: b.range, count: b.count })),
    reviewDistribution: distributions.review_buckets.map(b => ({ label: b.range, count: b.count })),
    aiInsights: {
      summary: aiInsights.market_summary,
      opportunity: aiInsights.opportunity_analysis,
    },
    recommendations: aiInsights.recommendations,
    risks: aiInsights.risk_flags,
  }
}
