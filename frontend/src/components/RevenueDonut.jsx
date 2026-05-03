import { useState } from 'react'

export default function RevenueDonut({ products }) {
  const [hovered, setHovered] = useState(null)
  const topProducts = products.slice(0, 5)
  const totalRevenue = products.reduce((sum, product) => sum + (product.revenue?.mid || 0), 0)
  const otherRevenue = products.slice(5).reduce((sum, product) => sum + (product.revenue?.mid || 0), 0)
  const colors = ['var(--cyan)', 'var(--violet)', 'var(--amber)', 'var(--green)', 'var(--red)', 'var(--tx-3)']
  const segments = [
    ...topProducts.map(product => ({
      label: product.brand || 'Unknown',
      value: product.revenue?.mid || 0,
    })),
    ...(otherRevenue > 0 ? [{ label: 'Others', value: otherRevenue }] : []),
  ].filter(segment => segment.value > 0)

  const outerRadius = 56
  const innerRadius = 34
  const cx = 76
  const cy = 76
  let currentAngle = -Math.PI / 2

  function arcPath(startAngle, endAngle, outer, inner) {
    const x1 = cx + outer * Math.cos(startAngle)
    const y1 = cy + outer * Math.sin(startAngle)
    const x2 = cx + outer * Math.cos(endAngle)
    const y2 = cy + outer * Math.sin(endAngle)
    const x3 = cx + inner * Math.cos(endAngle)
    const y3 = cy + inner * Math.sin(endAngle)
    const x4 = cx + inner * Math.cos(startAngle)
    const y4 = cy + inner * Math.sin(startAngle)
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  const slices = segments.map((segment, index) => {
    const angle = totalRevenue > 0 ? (segment.value / totalRevenue) * 2 * Math.PI : 0
    const startAngle = currentAngle
    currentAngle += angle
    const endAngle = currentAngle
    return {
      ...segment,
      color: colors[index % colors.length],
      pct: totalRevenue > 0 ? (segment.value / totalRevenue) * 100 : 0,
      startAngle,
      endAngle,
    }
  })

  const activeSlice = hovered !== null ? slices[hovered] : null

  return (
    <div className="card" style={{ padding: '16px 20px', height: '100%' }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--tx-1)', marginBottom: 14 }}>
        Revenue Share
      </div>

      {slices.length === 0 ? (
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--tx-3)' }}>
          No revenue share data available.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <svg width="152" height="152" viewBox="0 0 152 152" style={{ flexShrink: 0 }}>
            {slices.map((slice, index) => (
              <path
                key={`${slice.label}-${index}`}
                d={arcPath(slice.startAngle, slice.endAngle, hovered === index ? outerRadius + 4 : outerRadius, innerRadius)}
                fill={slice.color}
                opacity={hovered === null ? 0.85 : hovered === index ? 1 : 0.3}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
              />
            ))}
            <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--tx-1)" fontSize="13" fontWeight="600" fontFamily="var(--mono)">
              {activeSlice ? `${activeSlice.pct.toFixed(1)}%` : `$${(totalRevenue / 1000).toFixed(0)}K`}
            </text>
            <text x={cx} y={cy + 11} textAnchor="middle" fill="var(--tx-3)" fontSize="9" fontFamily="var(--sans)">
              {activeSlice ? activeSlice.label : 'total/mo'}
            </text>
          </svg>

          <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {slices.map((slice, index) => (
              <div
                key={`${slice.label}-${index}`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  opacity: hovered === null ? 1 : hovered === index ? 1 : 0.4,
                  transition: 'opacity 0.15s', cursor: 'pointer',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: 2, background: slice.color, flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-2)',
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {slice.label}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: slice.color }}>
                  {slice.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
