import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TABS = ['price', 'rating', 'reviews']
const TAB_LABELS = { price: 'Price', rating: 'Rating', reviews: 'Reviews' }

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-deep)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 12px',
      fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)',
    }}>
      <span style={{ color: 'var(--text-base)' }}>{payload[0]?.payload.label}: </span>
      <span style={{ fontFamily: "'Space Mono', monospace", color: '#06b6d4' }}>{payload[0]?.value} products</span>
    </div>
  )
}

export default function DistributionChart({ priceDistribution, ratingDistribution, reviewDistribution }) {
  const [active, setActive] = useState('price')

  const datasets = { price: priceDistribution, rating: ratingDistribution, reviews: reviewDistribution }
  const data = (datasets[active] || []).map(d => ({ label: d.label, count: d.count }))
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          Distributions
        </span>
        <div style={{ display: 'flex', background: 'var(--bg-deep)', borderRadius: 99, padding: 3, gap: 2 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActive(t)} style={{
              padding: '5px 14px', borderRadius: 99, border: 'none',
              background: active === t ? 'var(--border)' : 'transparent',
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: active === t ? 'var(--text-base)' : 'var(--border-mid)',
              cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
            }}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fill: 'var(--border-mid)' }}
            axisLine={false} tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-inset)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count === maxCount ? '#06b6d4' : '#818cf8'}
                fillOpacity={0.4 + (entry.count / maxCount) * 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
