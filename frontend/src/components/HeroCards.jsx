import { useState, useEffect } from 'react'
import { fmt } from '../utils/fmt.js'

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)))
        const id = `sg-${i}-${rating}`
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <defs>
              <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
                <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
                <stop offset={`${fill * 100}%`} stopColor="var(--bg-card)" />
              </linearGradient>
            </defs>
            <path
              d="M7 1l1.6 3.3 3.6.5-2.6 2.6.6 3.6L7 9.3l-3.2 1.7.6-3.6L1.8 4.8l3.6-.5z"
              fill={fill === 1 ? '#f59e0b' : fill === 0 ? 'var(--bg-card)' : `url(#${id})`}
              stroke="#f59e0b" strokeWidth="0.5" strokeOpacity={fill > 0 ? 0.5 : 0.2}
            />
          </svg>
        )
      })}
    </div>
  )
}

export default function HeroCards({ summary }) {
  const data = summary ?? {
    estMonthlyRevenue: { mid: 0, low: 0, high: 0 },
    avgPrice: 0,
    avgRating: 0,
    reviewsAnalyzed: 0,
    productsAnalyzed: 0,
  }

  const rev     = useCountUp(data.estMonthlyRevenue.mid, 1400)
  const price   = useCountUp(Math.round(data.avgPrice * 100), 1000)
  const rating  = useCountUp(Math.round(data.avgRating * 10), 900)
  const reviews = useCountUp(data.reviewsAnalyzed, 1300)

  const cards = [
    {
      label: 'Est. Monthly Revenue',
      main: fmt(rev),
      mainColor: '#22d3ee',
      extra: (
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: 'var(--text-dim)' }}>
          {fmt(data.estMonthlyRevenue.low)} — {fmt(data.estMonthlyRevenue.high)}
        </span>
      ),
      accent: '#22d3ee',
    },
    {
      label: 'Avg. Price',
      main: (
        <span>
          <span style={{ color: '#22d3ee', fontSize: '0.6em' }}>$</span>
          {(price / 100).toFixed(2)}
        </span>
      ),
      mainColor: 'var(--text-base)',
      extra: <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: 'var(--text-dim)' }}>Across top {data.productsAnalyzed}</span>,
      accent: null,
    },
    {
      label: 'Avg. Rating',
      main: (rating / 10).toFixed(1),
      mainColor: 'var(--text-base)',
      extra: <Stars rating={data.avgRating} />,
      accent: null,
    },
    {
      label: 'Reviews Analyzed',
      main: reviews.toLocaleString(),
      mainColor: 'var(--text-base)',
      extra: <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: 'var(--text-dim)' }}>across {data.productsAnalyzed} products</span>,
      accent: '#f59e0b',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '22px 24px',
          position: 'relative', overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {card.accent && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: card.accent, boxShadow: `0 0 12px ${card.accent}88`,
            }} />
          )}
          <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: '0.02em' }}>
            {card.label}
          </div>
          <div style={{
            fontFamily: "var(--mono)",
            fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 700,
            color: card.mainColor, lineHeight: 1.1, marginBottom: 8, letterSpacing: '-0.02em',
          }}>
            {card.main}
          </div>
          {card.extra}
        </div>
      ))}
    </div>
  )
}
