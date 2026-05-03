import { useState, useEffect, useRef } from 'react'
import Logo from './Logo.jsx'

export default function PinGate({ onSuccess }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [focusIdx, setFocusIdx] = useState(0)
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)
  const refs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => { refs[0].current?.focus() }, [])

  function handleKey(i, e) {
    if (e.key === 'Backspace') {
      const next = [...digits]
      if (next[i]) { next[i] = ''; setDigits(next) }
      else if (i > 0) {
        next[i - 1] = ''; setDigits(next)
        setFocusIdx(i - 1); refs[i - 1].current?.focus()
      }
      return
    }
    if (!/^\d$/.test(e.key)) return
    const next = [...digits]
    next[i] = e.key
    setDigits(next)
    if (i < 3) { setFocusIdx(i + 1); refs[i + 1].current?.focus() }
    else {
      const pin = next.join('')
      setSuccess(true)
      setTimeout(() => onSuccess(pin), 400)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: 20,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--line-1) 1px, transparent 1px), linear-gradient(90deg, var(--line-1) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, width: 340,
      }}>
        <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Logo size="lg" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx-4)', letterSpacing: '0.1em' }}>
            MARKET INTELLIGENCE
          </span>
        </div>

        <div style={{
          background: 'var(--bg-1)',
          border: `1px solid ${shake ? 'rgba(248,113,113,0.4)' : 'var(--line-1)'}`,
          borderRadius: 10,
          padding: '32px 28px',
          transition: 'border-color 0.2s',
          animation: shake ? 'shake 0.5s' : success ? 'fadeUp 0.4s ease' : 'none',
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx-1)', marginBottom: 4 }}>Access PIN</div>
            <div style={{ fontSize: 13, color: 'var(--tx-3)' }}>Enter your 4-digit access code</div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={() => {}}
                onKeyDown={e => handleKey(i, e)}
                onFocus={() => setFocusIdx(i)}
                style={{
                  width: 56, height: 60,
                  background: 'var(--bg-2)',
                  border: `1.5px solid ${focusIdx === i ? 'var(--cyan)' : 'var(--line-2)'}`,
                  borderRadius: 7,
                  textAlign: 'center',
                  fontSize: 22,
                  color: 'var(--tx-1)',
                  fontFamily: 'var(--mono)',
                  outline: 'none',
                  boxShadow: focusIdx === i ? '0 0 0 3px var(--cyan-dim)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  caretColor: 'transparent',
                  cursor: 'default',
                }}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx-4)' }}>
            {success ? <span style={{ color: 'var(--green)' }}>Access granted</span> : 'Secure workspace'}
          </div>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-4)' }}>
          v2.4.1 - Amazon Market Intelligence Suite
        </div>
      </div>
    </div>
  )
}
