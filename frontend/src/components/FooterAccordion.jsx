import { useState } from 'react'

export default function FooterAccordion() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--border-mid)',
        padding: 0, transition: 'color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-dim)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--border-mid)'}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        How estimates are calculated
      </button>
      {open && (
        <div style={{
          marginTop: 12, padding: '16px 20px',
          background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 10,
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'var(--border-mid)', lineHeight: 2 }}>
            <span style={{ color: 'var(--text-dim)' }}>Review Count</span>
            <span style={{ color: 'var(--border)' }}> × 0.05 = </span>
            <span style={{ color: 'var(--text-dim)' }}>Est. Units/mo</span>
            <span style={{ color: 'var(--border)' }}> → </span>
            <span style={{ color: 'var(--text-dim)' }}>× Price</span>
            <span style={{ color: 'var(--border)' }}> = </span>
            <span style={{ color: '#06b6d4' }}>Est. Revenue</span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--border)', margin: '10px 0 0', lineHeight: 1.7 }}>
            Estimates use the review velocity multiplier method. Actual sales may vary significantly based on seasonality, ad spend, and pricing.
            Low/High ranges represent ±40% confidence intervals. Do not use as financial projections.
          </p>
        </div>
      )}
    </div>
  )
}
