export default function Recommendations({ items }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
        Recommendations
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map((rec, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#06b6d4',
            }}>
              {i + 1}
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {rec}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
