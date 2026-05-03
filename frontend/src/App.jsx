import { useState, useEffect } from 'react'
import PinGate from './components/PinGate.jsx'
import UrlInput from './components/UrlInput.jsx'
import Dashboard from './components/Dashboard.jsx'
import { analyzeUrl } from './api/client.js'

export default function App() {
  const [screen, setScreen] = useState('pin')   // pin | input | dashboard
  const [pin, setPin] = useState('')
  const [darkMode, setDarkMode] = useState(true)
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
