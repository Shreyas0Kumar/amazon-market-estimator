import { useState } from 'react'
import { fmt } from '../utils/fmt.js'

const HUES = [200, 160, 280, 40, 320, 180, 220, 140, 260, 80]

function ProductThumb({ rank, imageUrl }) {
  const h = HUES[(rank - 1) % HUES.length]
  if (imageUrl) {
    return (
      <img src={imageUrl} alt="" style={{
        width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0,
        border: `1px solid oklch(0.35 0.05 ${h})`,
      }} onError={e => { e.currentTarget.style.display = 'none' }} />
    )
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
      background: `oklch(0.25 0.04 ${h})`,
      border: `1px solid oklch(0.35 0.05 ${h})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Space Mono', monospace", fontSize: 10,
      color: `oklch(0.6 0.1 ${h})`,
    }}>
      {rank}
    </div>
  )
}

function RevBar({ low, mid, high }) {
  const total = high * 1.1
  const lowPct  = (low  / total) * 100
  const midPct  = ((mid - low) / total) * 100
  const highPct = ((high - mid) / total) * 100
  return (
    <div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#06b6d4', marginBottom: 3 }}>
        {fmt(mid)}
      </div>
      <div style={{ display: 'flex', height: 3, borderRadius: 99, overflow: 'hidden', width: 100 }}>
        <div style={{ width: `${lowPct}%`,  background: 'var(--border)' }} />
        <div style={{ width: `${midPct}%`,  background: '#06b6d4' }} />
        <div style={{ width: `${highPct}%`, background: '#0e7490' }} />
      </div>
    </div>
  )
}

const COLS = [
  { key: 'rank',    label: '#',           w: 36  },
  { key: 'name',    label: 'Product',     w: 'auto' },
  { key: 'brand',   label: 'Brand',       w: 110 },
  { key: 'price',   label: 'Price',       w: 70  },
  { key: 'rating',  label: 'Rating',      w: 80  },
  { key: 'reviews', label: 'Reviews',     w: 85  },
  { key: 'revenue', label: 'Est. Revenue', w: 135 },
]

export default function ProductsTable({ products }) {
  const [sortKey, setSortKey] = useState('rank')
  const [sortDir, setSortDir] = useState(1)
  const [hoverRow, setHoverRow] = useState(null)

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(1) }
  }

  const sorted = [...products].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (sortKey === 'revenue') { av = a.revenue.mid; bv = b.revenue.mid }
    if (typeof av === 'string') return av.localeCompare(bv) * sortDir
    return (av - bv) * sortDir
  })

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {COLS.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)} style={{
                  padding: '10px 16px',
                  textAlign: col.key === 'rank' ? 'center' : 'left',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                  color: 'var(--border-mid)', fontWeight: 500,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: 'pointer', userSelect: 'none',
                  background: 'var(--bg-inset)', whiteSpace: 'nowrap',
                  width: col.w === 'auto' ? undefined : col.w,
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--border-mid)'}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span style={{ marginLeft: 4, color: '#06b6d4' }}>{sortDir === 1 ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr key={p.rank}
                onMouseEnter={() => setHoverRow(i)}
                onMouseLeave={() => setHoverRow(null)}
                style={{
                  borderTop: '1px solid var(--bg-deep)',
                  background: hoverRow === i ? 'var(--bg-inset)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                <td style={{ padding: '11px 16px', textAlign: 'center', position: 'relative' }}>
                  {hoverRow === i && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 2, background: '#06b6d4', boxShadow: '0 0 8px #06b6d4',
                    }} />
                  )}
                  <ProductThumb rank={p.rank} imageUrl={p.image} />
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <a href={p.productUrl} target="_blank" rel="noopener noreferrer" style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-base)',
                      maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      display: 'block', textDecoration: 'none',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-base)'}
                    >
                      {p.name}
                    </a>
                    {p.sponsored && (
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                        color: 'var(--border-mid)', background: 'var(--bg-deep)',
                        border: '1px solid var(--border)', borderRadius: 4,
                        padding: '1px 6px', flexShrink: 0,
                      }}>Sponsored</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-dim)' }}>{p.brand}</span>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'var(--text-base)' }}>
                    ${p.price.toFixed(2)}
                  </span>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#f59e0b' }}>
                      {p.rating.toFixed(1)}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 14 14">
                      <path d="M7 1l1.6 3.3 3.6.5-2.6 2.6.6 3.6L7 9.3l-3.2 1.7.6-3.6L1.8 4.8l3.6-.5z" fill="#f59e0b" />
                    </svg>
                  </div>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.reviews.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <RevBar low={p.revenue.low} mid={p.revenue.mid} high={p.revenue.high} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
