import axios from 'axios'
import { transformApiResponse } from './transform.js'

export async function analyzeUrl(url, pin) {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/analyze`, { url, pin })

    return transformApiResponse(res.data)
  } catch (err) {
    const message = err.response?.data?.message
      || err.response?.data?.error
      || err.message
      || 'Network error'
    throw new Error(message)
  }
}
