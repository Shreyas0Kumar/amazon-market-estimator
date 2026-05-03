import Logo from './Logo.jsx'

export default function TopNav({ query, darkMode, onToggleDark, onNewAnalysis }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: darkMode ? 'rgba(10,15,30,0.92)' : 'rgba(248,250,252,0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: 56,
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Logo size="sm" />
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <div style={{
          background: darkMode ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.1)',
          border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: 99, padding: '4px 12px',
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#06b6d4',
          maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {query}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onNewAnalysis} style={{
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 8, padding: '7px 14px',
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)',
          cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          + New Analysis
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />

        {/* GitHub */}
        <NavIcon href="https://github.com/Shreyas0Kumar/amazon-market-estimator" title="GitHub" darkMode={darkMode}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--text-dim)">
            <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.203 22 16.447 22 12.021 22 6.484 17.522 2 12 2z"/>
          </svg>
        </NavIcon>

        {/* LinkedIn */}
        <NavIcon href="https://www.linkedin.com/in/shreyas0kumar/" title="LinkedIn" darkMode={darkMode}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-dim)">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </NavIcon>

        {/* Dark/Light toggle */}
        <button onClick={onToggleDark} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--bg-deep)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#06b6d4'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {darkMode ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

function NavIcon({ href, title, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title}
      style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--bg-deep)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textDecoration: 'none', transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {children}
    </a>
  )
}
