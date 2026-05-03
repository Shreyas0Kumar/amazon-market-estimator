export default function BrandLeaderboard({ brands }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16 }}>
        Top Brands
      </div>
      {brands.length === 0 ? (
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-dim)' }}>
          No brand data available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {brands.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? 'rgba(6,182,212,0.15)' : 'var(--bg-deep)',
                border: `1px solid ${i === 0 ? '#06b6d4' : 'var(--bg-card)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                color: i === 0 ? '#06b6d4' : 'var(--border-mid)',
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-base)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.name}
                </div>
              </div>
              <div style={{
                background: 'var(--bg-deep)', border: '1px solid var(--border)',
                borderRadius: 99, padding: '2px 8px', flexShrink: 0,
                fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'var(--border-mid)',
              }}>
                {b.products} {b.products === 1 ? 'product' : 'products'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 14 14">
                  <path d="M7 1l1.6 3.3 3.6.5-2.6 2.6.6 3.6L7 9.3l-3.2 1.7.6-3.6L1.8 4.8l3.6-.5z" fill="#f59e0b" />
                </svg>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#f59e0b' }}>
                  {b.rating.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
