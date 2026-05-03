import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fmt } from '../utils/fmt.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-deep)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px',
      fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: 'var(--text-base)', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: 'var(--text-dim)', textTransform: 'capitalize' }}>{p.dataKey}</span>
          <span style={{ fontFamily: "'Space Mono', monospace", color: '#06b6d4' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ products }) {
  const top5 = products.slice(0, 5).map(p => ({
    name: p.name.split(' ').slice(0, 3).join(' '),
    low:  p.revenue.low,
    mid:  p.revenue.mid,
    high: p.revenue.high,
  }))

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', flex: 1 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
        Revenue by Product
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-faint)', marginBottom: 16 }}>
        Top 5 competitors — low / mid / high estimate
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={top5} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="name" width={120}
            tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: 'var(--text-dim)' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-inset)' }} />
          <Bar dataKey="low"  stackId="a" fill="var(--border)"  radius={0} />
          <Bar dataKey="mid"  stackId="a" fill="#0891b2"         radius={0} />
          <Bar dataKey="high" stackId="a" fill="#164e63"         radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {[['var(--border)', 'Low'], ['#0891b2', 'Mid'], ['#164e63', 'High']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'var(--border-mid)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
