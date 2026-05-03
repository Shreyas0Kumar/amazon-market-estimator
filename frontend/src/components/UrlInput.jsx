import { useState, useEffect } from 'react'
import Logo from './Logo.jsx'

const LOADING_MESSAGES = [
  'Fetching top products…',
  'Calculating revenue estimates…',
  'Analyzing competitive landscape…',
  'Generating market insights…',
  'Finalizing your report…',
]

const EXAMPLE_URLS = [
  { label: 'Standing Desks', url: 'https://www.amazon.com/s?k=standing+desk' },
  { label: 'Air Fryers',     url: 'https://www.amazon.com/s?k=air+fryer' },
  { label: 'Yoga Mats',      url: 'https://www.amazon.com/s?k=yoga+mat' },
]

export default function UrlInput({ onAnalyze, error, onClearError }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const [msgVisible, setMsgVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [localError, setLocalError] = useState(null)

  const displayError = error || localError

  useEffect(() => {
    if (!loading) return
    let p = 0
    const prog = setInterval(() => {
      p += Math.random() * 3 + 1
      if (p >= 92) { clearInterval(prog); p = 92 }
      setProgress(p)
    }, 250)

    let idx = 0
    const cycle = setInterval(() => {
      setMsgVisible(false)
      setTimeout(() => { idx = (idx + 1) % LOADING_MESSAGES.length; setMsgIdx(idx); setMsgVisible(true) }, 300)
    }, 2200)

    return () => { clearInterval(prog); clearInterval(cycle) }
  }, [loading])

  async function handleSubmit(submitUrl) {
    const target = (submitUrl || url).trim()
    if (!target) return
    if (!target.includes('amazon.com')) {
      setLocalError('Please enter a valid amazon.com URL')
      return
    }
    setLocalError(null)
    onClearError?.()
    setUrl(target)
    setLoading(true)
    setMsgIdx(0)
    setMsgVisible(true)
    setProgress(0)
    try {
      await onAnalyze(target)
    } catch (err) {
      setLoading(false)
      setProgress(0)
      setLocalError(err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '35%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 500,
        background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 40, maxWidth: 640, width: '90%', padding: '0 20px',
      }}>
        <Logo size="md" />

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700,
            color: '#f1f5f9', margin: 0, lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            What market are you<br />
            <span style={{ color: '#06b6d4' }}>entering?</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#64748b', marginTop: 12 }}>
            Paste any Amazon search, category, or Best Sellers URL
          </p>
        </div>

        <div style={{ width: '100%' }}>
          {loading ? (
            <div style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 16, padding: '24px 28px',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{ height: 3, background: '#1e293b', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'linear-gradient(90deg, #06b6d4, #818cf8)',
                  borderRadius: 99, transition: 'width 0.3s ease',
                  boxShadow: '0 0 8px rgba(6,182,212,0.6)',
                }} />
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#94a3b8',
                textAlign: 'center', opacity: msgVisible ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}>
                {LOADING_MESSAGES[msgIdx]}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="https://www.amazon.com/s?k=bamboo+cutting+board"
                  style={{
                    flex: 1, background: '#0f172a',
                    border: '1px solid #1e293b', borderRadius: 12,
                    padding: '15px 20px',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#f1f5f9',
                    outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#06b6d4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#1e293b'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  onClick={() => handleSubmit()}
                  style={{
                    background: '#06b6d4', border: 'none', borderRadius: 12,
                    padding: '15px 24px',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
                    color: '#0a0f1e', cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'background 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#22d3ee' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#06b6d4' }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  Analyze Market →
                </button>
              </div>
              {displayError && (
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: '#f43f5e',
                }}>
                  {displayError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#475569' }}>Try:</span>
                {EXAMPLE_URLS.map(({ label, url: u }) => (
                  <button key={label} onClick={() => handleSubmit(u)} style={{
                    background: 'transparent', border: '1px solid #1e293b',
                    borderRadius: 99, padding: '4px 12px',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#64748b',
                    cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
