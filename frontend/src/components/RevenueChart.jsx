import { useState } from 'react'
import { fmt } from '../utils/fmt.js'

export default function RevenueChart({ products }) {
  const [hovered, setHovered] = useState(null)
  const topProducts = products.slice(0, 7)
  const maxRevenue = Math.max(...topProducts.map(p => p.revenue?.high || p.revenue?.mid || 0), 1)

  return (
    <div className="card" style={{ padding: '16px 20px', height: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 16, marginBottom: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--tx-1)' }}>
          Revenue by Product
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            ['var(--bg-4)', 'Low'],
            ['var(--cyan)', 'Mid'],
            ['rgba(34,211,238,0.25)', 'High'],
          ].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 3, borderRadius: 99, background: color }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-4)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {topProducts.length === 0 ? (
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--tx-3)' }}>
          No product revenue data available.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {topProducts.map((product, index) => {
            const lowWidth = ((product.revenue?.low || 0) / maxRevenue) * 100
            const midWidth = ((product.revenue?.mid || 0) / maxRevenue) * 100
            const highWidth = ((product.revenue?.high || 0) / maxRevenue) * 100
            const label = product.name.split(' ').slice(0, 4).join(' ')

            return (
              <div
                key={`${product.rank}-${product.name}`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10,
                    color: hovered === index ? 'var(--tx-1)' : 'var(--tx-3)',
                    maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    transition: 'color 0.15s',
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 11,
                    color: hovered === index ? 'var(--cyan)' : 'var(--tx-3)',
                    transition: 'color 0.15s',
                  }}>
                    {fmt(product.revenue?.mid || 0)}
                  </span>
                </div>
                <div style={{ position: 'relative', height: 18, background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0, right: 'auto',
                    width: `${highWidth}%`, background: 'rgba(34,211,238,0.15)',
                    transition: 'width 0.4s',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0, right: 'auto',
                    width: `${midWidth}%`,
                    background: hovered === index ? 'var(--cyan)' : 'rgba(34,211,238,0.7)',
                    transition: 'width 0.4s, background 0.15s',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0, right: 'auto',
                    width: `${lowWidth}%`, background: 'var(--bg-4)',
                    transition: 'width 0.4s',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
