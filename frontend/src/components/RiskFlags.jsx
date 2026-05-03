export default function RiskFlags({ risks }) {
  return (
    <div style={{ width: 300, flexShrink: 0 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
        Risk Flags
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {risks.length === 0 ? (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '12px 16px', background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10,
          }}>
            <span style={{ color: '#22c55e', fontSize: 14 }}>✓</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22c55e' }}>No major risks identified</span>
          </div>
        ) : risks.map((risk, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '12px 16px',
            background: 'rgba(244,63,94,0.05)',
            border: '1px solid rgba(244,63,94,0.15)',
            borderRadius: 10, transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M8 1L1 14h14L8 1z" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinejoin="round" />
              <line x1="8" y1="6" x2="8" y2="10" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="12" r="0.8" fill="#f43f5e" />
            </svg>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {risk}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
