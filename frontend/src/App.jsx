import { useState, useEffect } from 'react'
import PinGate from './components/PinGate.jsx'
import UrlInput from './components/UrlInput.jsx'
import Dashboard from './components/Dashboard.jsx'
import { analyzeUrl } from './api/client.js'

function saveToHistory(url, data) {
  try {
    const item = {
      id: Date.now(),
      query: data.query,
      url: url,
      analyzedAt: new Date().toISOString(),
      summary: {
        estMonthlyRevenue: data.summary.estMonthlyRevenue,
        avgPrice: data.summary.avgPrice,
        avgRating: data.summary.avgRating,
        competitivenessScore: data.scores.competitiveness.score,
        competitivenessLabel: data.scores.competitiveness.label,
        opportunityScore: data.scores.opportunity.score,
        opportunityLabel: data.scores.opportunity.label,
        productsAnalyzed: data.summary.productsAnalyzed,
      },
    }
    const existing = JSON.parse(localStorage.getItem('nichescope_history') || '[]')
    const deduped = Array.isArray(existing) ? existing.filter(h => h.url !== url) : []
    const updated = [item, ...deduped].slice(0, 5)
    localStorage.setItem('nichescope_history', JSON.stringify(updated))
  } catch (err) {
    console.warn('Unable to save analysis history:', err)
  }
}

export default function App() {
  const [screen, setScreen] = useState('pin')   // pin | input | dashboard
  const [pin, setPin] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  async function handleAnalyze(url) {
    setError(null)
    const result = await analyzeUrl(url, pin)
    console.log('TRANSFORMED:', JSON.stringify(result?.summary))
    setData(result)
    saveToHistory(url, result)
    setScreen('dashboard')
  }

  return (
    <>
      {screen === 'pin' && (
        <PinGate onSuccess={(p) => { setPin(p); setScreen('input') }} />
      )}
      {screen === 'input' && (
        <UrlInput
          onAnalyze={handleAnalyze}
          error={error}
          onClearError={() => setError(null)}
          darkMode={darkMode}
        />
      )}
      {screen === 'dashboard' && data && (
        <Dashboard
          data={data}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          onNewAnalysis={() => { setData(null); setError(null); setScreen('input') }}
        />
      )}
    </>
  )
}
