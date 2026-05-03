export default function Logo({ size = 'md' }) {
  const sizes = { sm: { mark: 6, text: 13 }, md: { mark: 8, text: 16 }, lg: { mark: 10, text: 22 } }
  const s = sizes[size] || sizes.md
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <svg width={s.mark * 2} height={s.mark * 2} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
        <rect x="0" y="0" width="7" height="7" rx="1.5" fill="var(--cyan)" opacity="0.9" />
        <rect x="9" y="0" width="7" height="7" rx="1.5" fill="var(--cyan)" opacity="0.4" />
        <rect x="0" y="9" width="7" height="7" rx="1.5" fill="var(--cyan)" opacity="0.4" />
        <rect x="9" y="9" width="7" height="7" rx="1.5" fill="var(--cyan)" opacity="0.15" />
      </svg>
      <span style={{
        fontFamily: 'var(--sans)',
        fontWeight: 600,
        fontSize: s.text,
        color: 'var(--tx-1)',
        letterSpacing: 0,
      }}>
        NicheScope
      </span>
    </div>
  )
}
