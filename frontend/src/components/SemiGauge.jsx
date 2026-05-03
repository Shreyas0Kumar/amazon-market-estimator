import { useState, useEffect } from 'react'

// Fixed semicircle gauge. The prototype had two bugs:
//   1. y-coordinate used cy + r*sin(angle) — wrong for SVG (y-axis flipped).
//      Correct: y = cy - r*sin(angle) so the arc sweeps UPWARD.
//   2. Hid the arc when animated < 0.5 — made gauge invisible at low scores.

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]
}

function getArcColor(score, type) {
  if (type === 'competition') {
    if (score < 40) return '#06b6d4'
    if (score < 65) return '#f59e0b'
    return '#f43f5e'
  }
  if (score < 35) return '#f43f5e'
  if (score < 60) return '#f59e0b'
  return '#22c55e'
}

function getLabelColor(score, type) {
  return getArcColor(score, type)
}

export default function SemiGauge({ score, label, type, factors }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    setAnimated(0)
    const t = setTimeout(() => {
      let start = null
      const step = (ts) => {
        if (!start) start = ts
        const p = Math.min((ts - start) / 1000, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setAnimated(ease * score)
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, 200)
    return () => clearTimeout(t)
  }, [score])

  const cx = 120, cy = 116, r = 82
  const pct = animated / 100

  // Arc spans from 180° (left) to 0° (right), sweeping upward through 90° (top).
  // At pct=0: end at 180° (left endpoint, arc length 0)
  // At pct=0.5: end at 90° (top)
  // At pct=1: end at 0° (right endpoint, full semicircle)
  const startDeg = 180
  const endDeg   = 180 - pct * 180   // sweeps from 180° down to 0°

  const [sx, sy] = polar(cx, cy, r, startDeg)
  const [ex, ey] = polar(cx, cy, r, endDeg)
  const largeArc  = pct > 0.5 ? 1 : 0
  const arcColor  = getArcColor(score, type)

  // Background full track: 180° → 0°
  const [bx1, by1] = polar(cx, cy, r, 180)
  const [bx2, by2] = polar(cx, cy, r, 0)

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: 24, flex: '1 1 360px', minWidth: 0,
    }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
        {type === 'competition' ? 'Market Competitiveness' : 'Entry Opportunity'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 6 }}>
        <div style={{ width: 'min(100%, 300px)', aspectRatio: '240 / 150' }}>
          <svg width="100%" height="100%" viewBox="0 0 240 150" style={{ display: 'block', overflow: 'hidden' }}>
            {/* Background track */}
            <path
              d={`M ${bx1} ${by1} A ${r} ${r} 0 0 1 ${bx2} ${by2}`}
              fill="none" stroke="var(--bg-deep)" strokeWidth={12} strokeLinecap="round"
            />
            {/* Filled arc (only draw if animated > 0) */}
            {animated > 0.2 && (
              <path
                d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
                fill="none"
                stroke={arcColor}
                strokeWidth={12}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${arcColor}88)`, transition: 'stroke 0.3s' }}
              />
            )}
            {/* Tick marks at 0, 25, 50, 75, 100 */}
            {[0, 25, 50, 75, 100].map(tick => {
              const a = 180 - tick * 1.8   // 0→180°, 100→0°
              const [ox, oy] = polar(cx, cy, r + 13, a)
              const [ix, iy] = polar(cx, cy, r + 5, a)
              return <line key={tick} x1={ix} y1={iy} x2={ox} y2={oy} stroke="var(--border)" strokeWidth={1.5} />
            })}
            {/* Labels */}
            <text x={cx - r - 8} y={cy + 16} textAnchor="middle" fill="var(--border)" fontSize={9} fontFamily="Space Mono">0</text>
            <text x={cx + r + 8} y={cy + 16} textAnchor="middle" fill="var(--border)" fontSize={9} fontFamily="Space Mono">100</text>
          </svg>
        </div>

        <div style={{ marginTop: -14, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 36, fontWeight: 700, color: 'var(--text-base)', lineHeight: 1 }}>
            {Math.round(animated)}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: getLabelColor(score, type), marginTop: 4 }}>
            {label}
          </div>
        </div>
      </div>

      {/* Factor bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {factors.map((f, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-dim)' }}>{f.name}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>{f.value}</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-deep)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${f.value}%`,
                background: arcColor, borderRadius: 99,
                transition: 'width 1s ease',
                opacity: 0.6,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
