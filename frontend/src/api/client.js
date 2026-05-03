import { transformApiResponse } from './transform.js'

export async function analyzeUrl(url, pin) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, pin }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }

  const data = await res.json()
  return transformApiResponse(data)
}
