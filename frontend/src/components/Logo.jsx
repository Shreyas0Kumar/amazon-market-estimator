export default function Logo({ size = 'md' }) {
  const sizes = { sm: { dot: 7, text: 15 }, md: { dot: 9, text: 18 }, lg: { dot: 12, text: 24 } }
  const s = sizes[size] || sizes.md
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: s.dot, height: s.dot, borderRadius: '50%',
        background: '#06b6d4',
        boxShadow: '0 0 10px #06b6d4aa, 0 0 20px #06b6d455',
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: s.text,
        color: 'var(--text-base)',
        letterSpacing: '-0.01em',
      }}>
        NicheScope
      </span>
    </div>
  )
}
