import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{
      background: 'var(--bg-deep)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px',
      fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)', maxWidth: 180,
    }}>
      <div style={{ color: 'var(--text-base)', fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
        {d.name.split(' ').slice(0, 4).join(' ')}
      </div>
      <div>Price: <span style={{ color: '#06b6d4', fontFamily: "'Space Mono', monospace" }}>${d.price}</span></div>
      <div>Rating: <span style={{ color: '#f59e0b', fontFamily: "'Space Mono', monospace" }}>{d.rating}</span></div>
      <div>Reviews: <span style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>{d.reviews.toLocaleString()}</span></div>
    </div>
  )
}

export default function ScatterPlot({ products }) {
  const data = products.map(p => ({
    price:   p.price,
    rating:  p.rating,
    reviews: p.reviews,
    name:    p.name,
    rank:    p.rank,
  }))

  const avgPrice  = data.reduce((s, d) => s + d.price, 0)  / data.length
  const avgRating = data.reduce((s, d) => s + d.rating, 0) / data.length

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', flex: 1 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
        Price vs. Rating
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-faint)', marginBottom: 16 }}>
        Dot size = review count
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <XAxis
            type="number" dataKey="price" name="Price"
            domain={['auto', 'auto']}
            tick={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fill: 'var(--border-mid)' }}
            axisLine={{ stroke: 'var(--border)' }} tickLine={false}
            tickFormatter={v => `$${v}`}
          />
          <YAxis
            type="number" dataKey="rating" name="Rating"
            domain={['auto', 'auto']}
            tick={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fill: 'var(--border-mid)' }}
            axisLine={{ stroke: 'var(--border)' }} tickLine={false}
            width={30}
          />
          <ZAxis type="number" dataKey="reviews" range={[40, 400]} />
          <ReferenceLine x={avgPrice}  stroke="var(--border-mid)" strokeDasharray="4 3" label={{ value: 'avg $', position: 'insideTopRight', fontSize: 9, fill: 'var(--border-mid)', fontFamily: "'DM Sans'" }} />
          <ReferenceLine y={avgRating} stroke="var(--border-mid)" strokeDasharray="4 3" label={{ value: 'avg ★', position: 'insideTopRight', fontSize: 9, fill: 'var(--border-mid)', fontFamily: "'DM Sans'" }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)' }} />
          <Scatter data={data} shape={(props) => {
            const { cx, cy, payload } = props
            const isTop = payload.rank === 1
            const r = Math.sqrt(props.zAxis?.range ? 1 : 1) // Recharts handles size via ZAxis
            return (
              <circle
                cx={cx} cy={cy} r={props.node?.r ?? 8}
                fill={isTop ? '#f59e0b' : 'rgba(6,182,212,0.7)'}
                stroke={isTop ? '#f59e0baa' : 'rgba(6,182,212,0.3)'}
                strokeWidth={isTop ? 2 : 1}
                style={{ filter: isTop ? 'drop-shadow(0 0 6px #f59e0b88)' : 'none' }}
              />
            )
          }} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
