import { useState, useEffect } from 'react'
import Logo from './Logo.jsx'

const STEPS = [
  { pct: 15, msg: 'Fetching search results...' },
  { pct: 32, msg: 'Scraping top listings...' },
  { pct: 51, msg: 'Calculating revenue estimates...' },
  { pct: 68, msg: 'Analyzing competitive landscape...' },
  { pct: 82, msg: 'Running AI market analysis...' },
  { pct: 95, msg: 'Compiling final report...' },
]

const EXAMPLES = ['bamboo cutting board', 'standing desk mat', 'air fryer accessories', 'yoga blocks']

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${Math.max(mins, 0)}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatRevenue(value) {
  const amount = Number(value) || 0
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(amount >= 10000000 ? 0 : 1)}M/mo`
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K/mo`
  return `$${Math.round(amount)}/mo`
}

function normalizeQuery(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://www.amazon.com/s?k=${encodeURIComponent(trimmed).replace(/%20/g, '+')}`
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem('nichescope_history') || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('Unable to load analysis history:', err)
    return []
  }
}

function LoadingTerminal({ step, progress }) {
  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
        paddingBottom: 16, borderBottom: '1px solid var(--line-1)',
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['var(--red)', 'var(--amber)', 'var(--green)'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.75 }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx-4)' }}>
          nichescope - analysis
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {STEPS.map((s, i) => (
          <div key={s.msg} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            opacity: i <= step ? 1 : 0.2,
            transition: 'opacity 0.3s',
          }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 11,
              color: i < step ? 'var(--green)' : i === step ? 'var(--cyan)' : 'var(--tx-4)',
              width: 14, textAlign: 'center',
            }}>
              {i < step ? '✓' : i === step ? '>' : '.'}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: i <= step ? 'var(--tx-2)' : 'var(--tx-4)' }}>
              {s.msg}
            </span>
            {i === step && (
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)' }}>
                {s.pct}%
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ height: 2, background: 'var(--line-1)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`, background: 'var(--cyan)',
          transition: 'width 0.5s ease', borderRadius: 99,
        }} />
      </div>
    </div>
  )
}

export default function UrlInput({ onAnalyze, error, onClearError }) {
  const [url, setUrl] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [localError, setLocalError] = useState(null)

  const displayError = error || localError

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    if (!loading) return
    let idx = 0
    setStep(0)
    setProgress(STEPS[0].pct)
    const interval = setInterval(() => {
      idx += 1
      if (idx < STEPS.length) {
        setStep(idx)
        setProgress(STEPS[idx].pct)
      }
    }, 900)
    return () => clearInterval(interval)
  }, [loading])

  async function handleSubmit(value) {
    const target = normalizeQuery(value || url)
    if (!target) return
    if (!target.includes('amazon.com')) {
      setLocalError('Please enter an amazon.com URL or a product keyword')
      return
    }

    setLocalError(null)
    onClearError?.()
    setUrl(value || url)
    setLoading(true)
    try {
      await onAnalyze(target)
    } catch (err) {
      setLoading(false)
      setProgress(0)
      setStep(0)
      setLocalError(err.message)
    }
  }

  function clearHistory() {
    localStorage.removeItem('nichescope_history')
    setHistory([])
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-0)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: '48px 20px',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--line-1) 1px, transparent 1px), linear-gradient(90deg, var(--line-1) 1px, transparent 1px)',
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: 'min(680px, 92vw)' }}>
        <div style={{ marginBottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Logo size="lg" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx-4)', letterSpacing: '0.1em' }}>
            MARKET INTELLIGENCE
          </span>
        </div>

        {!loading ? (
          <>
            <h1 style={{
              fontSize: 32, fontWeight: 700, color: 'var(--tx-1)',
              letterSpacing: 0, marginBottom: 8, lineHeight: 1.15,
            }}>
              Analyze any Amazon<br /><span style={{ color: 'var(--cyan)' }}>product market</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--tx-3)', marginBottom: 28, lineHeight: 1.6, maxWidth: 620 }}>
              Paste an Amazon search URL or enter a keyword to get revenue estimates, competitive scores, and AI-powered market insights.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="https://www.amazon.com/s?k=bamboo+cutting+board or just a keyword"
                style={{
                  flex: 1, minWidth: 0, height: 44, padding: '0 14px',
                  background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 7,
                  color: 'var(--tx-1)', fontSize: 13, outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--cyan)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--line-2)' }}
              />
              <button
                onClick={() => handleSubmit()}
                style={{
                  height: 44, padding: '0 20px', background: 'var(--cyan)', border: 'none',
                  borderRadius: 7, fontWeight: 600, fontSize: 13, color: '#000',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Analyze
              </button>
            </div>

            {displayError && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)', marginBottom: 12 }}>
                {displayError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx-4)' }}>examples:</span>
              {EXAMPLES.map(example => (
                <button
                  key={example}
                  onClick={() => handleSubmit(example)}
                  style={{
                    padding: '4px 10px', background: 'var(--bg-2)', border: '1px solid var(--line-2)',
                    borderRadius: 5, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx-3)',
                    cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.color = 'var(--tx-3)' }}
                >
                  {example}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="label">recent_analyses</span>
                  <button type="button" onClick={clearHistory} style={{
                    background: 'transparent', border: 0, color: 'var(--tx-4)',
                    fontFamily: 'var(--mono)', fontSize: 10, cursor: 'pointer',
                  }}>
                    clear
                  </button>
                </div>
                <div className="history-list">
                  {history.map(item => (
                    <button
                      type="button"
                      key={item.id}
                      className="history-card card"
                      onClick={() => handleSubmit(item.url)}
                      style={{
                        padding: '14px 16px', width: 280, flexShrink: 0,
                        textAlign: 'left', cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                        <span style={{
                          minWidth: 0, color: 'var(--tx-1)', fontWeight: 600, fontSize: 13,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.query}
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-4)', flexShrink: 0 }}>
                          {timeAgo(item.analyzedAt)}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)', marginBottom: 8 }}>
                        {formatRevenue(item.summary?.estMonthlyRevenue?.mid)}
                      </div>
                      <div style={{
                        fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-4)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.url}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <LoadingTerminal step={step} progress={progress} />
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 20, left: 24, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-4)' }}>
        estimates based on review velocity model - +-40% confidence
      </div>
    </div>
  )
}
