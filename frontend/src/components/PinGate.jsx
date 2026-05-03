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
      minHeight: '100vh', background: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none',
      }} />
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(15,23,42,0.85)',
        border: '1px solid #1e293b',
        borderRadius: 20,
        padding: '48px 52px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.08)',
        animation: shake ? 'shake 0.5s' : success ? 'fadeUp 0.4s ease' : 'none',
      }}>
        <Logo size="md" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Amazon Market Intelligence
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#94a3b8' }}>
            Enter your access PIN
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
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
                  width: 56, height: 64,
                  background: '#0f172a',
                  border: `1px solid ${focusIdx === i ? '#06b6d4' : '#1e293b'}`,
                  borderRadius: 12,
                  textAlign: 'center',
                  fontSize: 24,
                  color: '#f1f5f9',
                  fontFamily: "'Space Mono', monospace",
                  outline: 'none',
                  boxShadow: focusIdx === i ? '0 0 0 3px rgba(6,182,212,0.15), 0 0 16px rgba(6,182,212,0.1)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  caretColor: 'transparent',
                  cursor: 'default',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
