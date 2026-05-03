export function transformApiResponse(apiData) {
  try {
    const a = apiData?.analysis

    if (!a) throw new Error('No analysis field in response')

    const competitors = a.competitors ?? []
    const avgRating = competitors.length
      ? competitors.reduce((sum, p) => sum + (p.rating ?? 0), 0) / competitors.length
      : 0
    const reviewsAnalyzed = competitors.reduce((sum, p) => sum + (p.review_count ?? 0), 0)

    return {
      query: a.niche ?? 'Unknown',
      summary: {
        estMonthlyRevenue: {
          mid: a.market_totals?.total_revenue_mid ?? 0,
          low: a.market_totals?.total_revenue_low ?? 0,
          high: a.market_totals?.total_revenue_high ?? 0,
        },
        avgPrice: a.avg_price ?? 0,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewsAnalyzed,
        productsAnalyzed: competitors.length,
      },
      scores: {
        competitiveness: {
          score: a.competitiveness?.score ?? 0,
          label: a.competitiveness?.label ?? 'Unknown',
          factors: [
            { name: 'Review Depth', value: a.competitiveness?.factors?.avg_review_count_normalized ?? 0 },
            { name: 'Brand Concentration', value: a.competitiveness?.factors?.top_brand_concentration ?? 0 },
            { name: 'Rating Barrier', value: a.competitiveness?.factors?.avg_rating_barrier ?? 0 },
          ],
        },
        opportunity: {
          score: a.opportunity?.score ?? 0,
          label: a.opportunity?.label ?? 'Unknown',
          factors: [
            { name: 'Review Gap', value: a.opportunity?.factors?.review_gap ?? 0 },
            { name: 'Price Gap', value: a.opportunity?.factors?.price_gap ?? 0 },
            { name: 'Rating Gap', value: a.opportunity?.factors?.rating_gap ?? 0 },
          ],
        },
      },
      products: competitors.map(p => ({
        rank: p.rank ?? 0,
        name: p.title ?? '',
        brand: p.brand ?? 'Unknown',
        price: p.price ?? 0,
        rating: p.rating ?? 0,
        reviews: p.review_count ?? 0,
        revenue: {
          low: p.revenue?.monthly_revenue_low ?? 0,
          mid: p.revenue?.monthly_revenue_mid ?? 0,
          high: p.revenue?.monthly_revenue_high ?? 0,
        },
        sponsored: p.is_sponsored ?? false,
        image: p.image_url ?? null,
      })),
      brands: (a.top_brands ?? []).map(b => ({
        name: b.brand ?? 'Unknown',
        products: b.product_count ?? 0,
        rating: b.avg_rating ?? 0,
      })),
      aiInsights: {
        summary: a.insights?.market_summary ?? '',
        opportunity: a.insights?.opportunity_analysis ?? '',
      },
      recommendations: a.insights?.recommendations ?? [],
      risks: a.insights?.risk_flags ?? [],
    }
  } catch (err) {
    console.error('Transform failed:', err)
    throw err
  }
}
