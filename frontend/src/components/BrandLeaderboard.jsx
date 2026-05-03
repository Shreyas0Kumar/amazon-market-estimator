export default function BrandLeaderboard({ brands }) {
  return (
    <div className="card" style={{ padding: '16px 20px', height: '100%' }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--tx-1)', marginBottom: 14 }}>
        Brand Rankings
      </div>
      {brands.length === 0 ? (
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--tx-3)' }}>
          No brand data available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) 60px 50px',
            gap: 10, paddingBottom: 8, borderBottom: '1px solid var(--line-1)', marginBottom: 8,
          }}>
            {['#', 'Brand', 'Products', 'Avg ★'].map(label => (
              <span key={label} style={{
                fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--tx-4)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {label}
              </span>
            ))}
          </div>
          {brands.map((b, i) => (
            <div key={b.name || i} style={{
              display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) 60px 50px',
              gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line-1)', alignItems: 'center',
            }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: i === 0 ? 'var(--cyan)' : 'var(--tx-4)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--tx-1)',
                  fontWeight: i === 0 ? 600 : 400, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {b.name}
                </div>
                {i === 0 && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--cyan)', marginTop: 2 }}>
                    market leader
                  </div>
                )}
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx-3)' }}>
                {b.products}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--amber)' }}>
                  {Number(b.rating || 0).toFixed(1)}
                </span>
                <span style={{ color: 'var(--amber)', fontSize: 10 }}>★</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
