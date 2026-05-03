import { formatFactorName } from './fmt.js'

function extractQuery(url) {
  try {
    const u = new URL(url)
    return u.searchParams.get('k') || u.searchParams.get('keywords') || url
  } catch {
    return url
  }
}

export function mapApiResponse(apiData, url) {
  const a = apiData.analysis
  const competitors = a.competitors ?? []

  const avgRating = competitors.length
    ? competitors.reduce((s, p) => s + (p.rating ?? 0), 0) / competitors.length
    : 0

  // Map competitiveness factors — exclude meta flags
  const SKIP_FACTORS = new Set(['unknown_brand_ratio'])
  const compFactors = Object.entries(a.competitiveness.factors ?? {})
    .filter(([k]) => !SKIP_FACTORS.has(k))
    .map(([k, v]) => ({ name: formatFactorName(k), value: Math.round(v) }))

  const oppFactors = Object.entries(a.opportunity.factors ?? {})
    .map(([k, v]) => ({ name: formatFactorName(k), value: Math.round(v) }))

  return {
    query: extractQuery(url),
    summary: {
      estMonthlyRevenue: {
        mid:  a.market_totals.total_revenue_mid,
        low:  a.market_totals.total_revenue_low,
        high: a.market_totals.total_revenue_high,
      },
      avgPrice:          a.avg_price,
      avgRating:         Math.round(avgRating * 10) / 10,
      reviewsAnalyzed:   competitors.reduce((s, p) => s + (p.review_count ?? 0), 0),
      productsAnalyzed:  competitors.length,
    },
    scores: {
      competitiveness: {
        score:   a.competitiveness.score,
        label:   a.competitiveness.label,
        factors: compFactors,
      },
      opportunity: {
        score:   a.opportunity.score,
        label:   a.opportunity.label,
        factors: oppFactors,
      },
    },
    products: competitors.map(p => ({
      rank:     p.rank,
      name:     p.title,
      brand:    p.brand || 'Unknown',
      price:    p.price ?? 0,
      rating:   p.rating ?? 0,
      reviews:  p.review_count ?? 0,
      revenue: {
        low:  p.revenue?.monthly_revenue_low  ?? 0,
        mid:  p.revenue?.monthly_revenue_mid  ?? 0,
        high: p.revenue?.monthly_revenue_high ?? 0,
      },
      sponsored:  p.is_sponsored ?? false,
      image:      p.image_url ?? null,
      productUrl: p.product_url ?? '',
    })),
    brands: (a.top_brands ?? []).map(b => ({
      name:     b.brand,
      products: b.product_count,
      rating:   b.avg_rating,
    })),
    aiInsights: {
      summary:     a.insights?.market_summary       ?? '',
      opportunity: a.insights?.opportunity_analysis ?? '',
      error:       a.insights?.error ?? null,
    },
    recommendations:    a.insights?.recommendations ?? [],
    risks:              a.insights?.risk_flags       ?? [],
    unknownBrandWarning: a.competitiveness?.unknown_brand_warning ?? false,
  }
}
