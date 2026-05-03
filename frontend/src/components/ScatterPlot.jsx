import { useState } from 'react'
import { fmt } from '../utils/fmt.js'

const W = 620
const H = 300
const PAD = { top: 18, right: 22, bottom: 46, left: 48 }

export default function ScatterPlot({ products }) {
  const [tooltipIndex, setTooltipIndex] = useState(null)

  if (products.length === 0) {
    return (
      <div className="card" style={{ padding: '16px 20px', height: '100%' }}>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--tx-1)' }}>
          Price vs. Rating
        </span>
        <div style={{ marginTop: 12, fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--tx-3)' }}>
          No product pricing data available.
        </div>
      </div>
    )
  }

  const chartWidth = W - PAD.left - PAD.right
  const chartHeight = H - PAD.top - PAD.bottom
  const prices = products.map(p => p.price)
  const ratings = products.map(p => p.rating)
  const maxReviews = Math.max(...products.map(p => p.reviews), 1)
  const avgPrice = prices.reduce((sum, value) => sum + value, 0) / prices.length
  const avgRating = ratings.reduce((sum, value) => sum + value, 0) / ratings.length

  const pricePadding = Math.max((Math.max(...prices) - Math.min(...prices)) * 0.12, 3)
  const ratingPadding = Math.max((Math.max(...ratings) - Math.min(...ratings)) * 0.12, 0.15)
  const minPrice = Math.max(Math.min(...prices) - pricePadding, 0)
  const maxPrice = Math.max(...prices) + pricePadding
  const minRating = Math.max(Math.min(...ratings) - ratingPadding, 0)
  const maxRating = Math.min(Math.max(...ratings) + ratingPadding, 5)

  const scaleX = value => PAD.left + ((value - minPrice) / Math.max(maxPrice - minPrice, 1)) * chartWidth
  const scaleY = value => PAD.top + chartHeight - ((value - minRating) / Math.max(maxRating - minRating, 1)) * chartHeight
  const scaleR = value => Math.sqrt(value / maxReviews) * 18 + 5
  const hoveredProduct = tooltipIndex !== null ? products[tooltipIndex] : null

  const xTicks = [minPrice, avgPrice, maxPrice]
  const yTicks = [minRating, avgRating, maxRating]

  return (
    <div className="card" style={{ padding: '16px 20px', height: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 12, marginBottom: 4, flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--tx-1)' }}>
          Price vs. Rating
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-4)' }}>
          size = review count
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          <rect
            x={PAD.left}
            y={PAD.top}
            width={scaleX(avgPrice) - PAD.left}
            height={scaleY(avgRating) - PAD.top}
            fill="rgba(74,222,128,0.035)"
          />
          <rect
            x={scaleX(avgPrice)}
            y={PAD.top}
            width={PAD.left + chartWidth - scaleX(avgPrice)}
            height={scaleY(avgRating) - PAD.top}
            fill="rgba(34,211,238,0.04)"
          />

          <line x1={scaleX(avgPrice)} y1={PAD.top} x2={scaleX(avgPrice)} y2={PAD.top + chartHeight}
            stroke="var(--line-3)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={PAD.left} y1={scaleY(avgRating)} x2={PAD.left + chartWidth} y2={scaleY(avgRating)}
            stroke="var(--line-3)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={PAD.left} y1={PAD.top + chartHeight} x2={PAD.left + chartWidth} y2={PAD.top + chartHeight}
            stroke="var(--line-2)" strokeWidth="1" />
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartHeight}
            stroke="var(--line-2)" strokeWidth="1" />

          {xTicks.map(value => (
            <text key={`x-${value}`} x={scaleX(value)} y={H - 16} textAnchor="middle"
              fill="var(--tx-4)" fontSize="9" fontFamily="var(--mono)">
              ${Math.round(value)}
            </text>
          ))}
          {yTicks.map(value => (
            <text key={`y-${value}`} x={PAD.left - 7} y={scaleY(value) + 3} textAnchor="end"
              fill="var(--tx-4)" fontSize="9" fontFamily="var(--mono)">
              {Number(value).toFixed(1)}
            </text>
          ))}

          {products.map((product, index) => {
            const x = scaleX(product.price)
            const y = scaleY(product.rating)
            const r = scaleR(product.reviews)
            const isTop = product.rank === 1
            return (
              <g
                key={`${product.rank}-${product.name}`}
                onMouseEnter={() => setTooltipIndex(index)}
                onMouseLeave={() => setTooltipIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={x} cy={y} r={r + 5} fill="transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={isTop ? 'var(--amber)' : 'var(--cyan)'}
                  opacity={tooltipIndex === null ? 0.65 : tooltipIndex === index ? 1 : 0.28}
                  stroke={isTop ? 'var(--amber)' : 'var(--cyan)'}
                  strokeWidth={tooltipIndex === index ? 1.5 : 0}
                  style={{
                    filter: tooltipIndex === index
                      ? `drop-shadow(0 0 5px ${isTop ? 'rgba(251,191,36,0.65)' : 'rgba(34,211,238,0.65)'})`
                      : 'none',
                    transition: 'opacity 0.15s',
                  }}
                />
                {isTop && (
                  <text x={x} y={y - r - 5} textAnchor="middle"
                    fill="var(--amber)" fontSize="9" fontFamily="var(--mono)">
                    #{product.rank}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {hoveredProduct && (
          <div style={{
            position: 'absolute', top: 10, right: 0,
            background: 'var(--bg-1)', border: '1px solid var(--line-2)',
            borderRadius: 6, padding: '8px 10px', pointerEvents: 'none',
            boxShadow: '0 8px 22px rgba(0,0,0,0.16)', maxWidth: 170,
          }}>
            <div style={{
              fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600,
              color: 'var(--tx-1)', marginBottom: 5, lineHeight: 1.3,
            }}>
              {hoveredProduct.name.split(' ').slice(0, 4).join(' ')}
            </div>
            {[
              ['Price', `$${hoveredProduct.price}`, 'var(--tx-1)'],
              ['Rating', hoveredProduct.rating.toFixed(1), 'var(--amber)'],
              ['Reviews', hoveredProduct.reviews.toLocaleString(), 'var(--tx-2)'],
              ['Rev/mo', fmt(hoveredProduct.revenue?.mid || 0), 'var(--cyan)'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-4)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--tx-4)' }}>lower price</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--tx-4)' }}>higher price</span>
      </div>
    </div>
  )
}
