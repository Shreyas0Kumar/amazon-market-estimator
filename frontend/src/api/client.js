import axios from 'axios'
import { transformApiResponse } from './transform.js'

function apiBaseUrl() {
  if (
    typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ) {
    return 'http://127.0.0.1:8000'
  }

  const configured = import.meta.env.VITE_API_URL
  if (configured) return configured

  return 'https://nischescope-api.fly.dev'
}

export async function analyzeUrl(url, pin) {
  try {
    const res = await axios.post(`${apiBaseUrl()}/api/analyze`, { url, pin })

    return transformApiResponse(res.data)
  } catch (err) {
    const message = err.response?.data?.message
      || err.response?.data?.error
      || err.message
      || 'Network error'
    throw new Error(message)
  }
}
