import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { analyzeUrl } from '../client.js'

vi.mock('axios')

const apiResponse = {
  analysis: {
    niche: 'Bamboo cutting board',
    avg_price: 20,
    market_totals: {
      total_revenue_low: 1000,
      total_revenue_mid: 2000,
      total_revenue_high: 3000,
    },
    competitiveness: {
      score: 40,
      label: 'Moderate',
      factors: {
        avg_review_count_normalized: 20,
        top_brand_concentration: 30,
        avg_rating_barrier: 40,
      },
    },
    opportunity: {
      score: 70,
      label: 'Strong',
      factors: {
        review_gap: 80,
        price_gap: 60,
        rating_gap: 50,
      },
    },
    competitors: [
      {
        rank: 1,
        title: 'Bamboo Board',
        brand: 'Acme',
        price: 20,
        rating: 4.5,
        review_count: 100,
        revenue: {
          monthly_revenue_low: 100,
          monthly_revenue_mid: 200,
          monthly_revenue_high: 300,
        },
        is_sponsored: false,
        image_url: 'https://example.com/image.jpg',
      },
    ],
    top_brands: [{ brand: 'Acme', product_count: 1, avg_rating: 4.5 }],
    distributions: {
      price_buckets: [{ range: '$10-$20', count: 1 }],
      rating_buckets: [{ range: '4-5', count: 1 }],
      review_buckets: [{ range: '0-100', count: 1 }],
    },
    insights: {
      market_summary: 'Stable market',
      opportunity_analysis: 'Good opening',
      recommendations: ['Differentiate clearly'],
      risk_flags: ['High review leaders'],
    },
  },
}

describe('analyzeUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns transformed data on a 200 response', async () => {
    axios.post.mockResolvedValue({ status: 200, data: apiResponse })

    const result = await analyzeUrl('https://www.amazon.com/s?k=cutting+board', '1234')

    expect(axios.post).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/api/analyze`,
      { url: 'https://www.amazon.com/s?k=cutting+board', pin: '1234' },
    )
    expect(result).toMatchObject({
      query: 'Bamboo cutting board',
      summary: {
        estMonthlyRevenue: {
          low: 1000,
          mid: 2000,
          high: 3000,
        },
        productsAnalyzed: 1,
      },
      products: [
        {
          name: 'Bamboo Board',
          brand: 'Acme',
          revenue: {
            low: 100,
            mid: 200,
            high: 300,
          },
        },
      ],
    })
  })

  it('throws an error on 401 invalid PIN response', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 401,
        data: { error: 'invalid_pin', message: 'Invalid PIN' },
      },
    })

    await expect(analyzeUrl('https://www.amazon.com/s?k=cutting+board', 'bad-pin'))
      .rejects
      .toThrow('Invalid PIN')
  })

  it('throws an error on 422 scrape failed response', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 422,
        data: { error: 'scrape_failed', message: 'Only 0 priced product(s) found' },
      },
    })

    await expect(analyzeUrl('https://www.amazon.com/s?k=cutting+board', '1234'))
      .rejects
      .toThrow('Only 0 priced product(s) found')
  })

  it('throws an error on network failure', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'))

    await expect(analyzeUrl('https://www.amazon.com/s?k=cutting+board', '1234'))
      .rejects
      .toThrow('Network Error')
  })
})
