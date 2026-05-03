export default function AIInsights({ insights }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flex: 1 }}>
      {/* Gradient top bar */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, #818cf8, #22d3ee)' }} />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            AI Market Analysis
          </span>
          <span style={{
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)',
            borderRadius: 99, padding: '2px 10px',
            fontFamily: "var(--sans)", fontSize: 10, color: '#818cf8',
          }}>
            GPT-4o-mini
          </span>
        </div>

        {insights.error ? (
          <div style={{
            padding: '12px 16px', background: 'rgba(244,63,94,0.06)',
            border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10,
            fontFamily: "var(--sans)", fontSize: 12, color: '#f43f5e',
          }}>
            AI insights unavailable: {insights.error}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600, color: 'var(--border-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Market Summary
              </div>
              <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                {insights.summary || '—'}
              </p>
            </div>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600, color: 'var(--border-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Opportunity Analysis
              </div>
              <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                {insights.opportunity || '—'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
