import { useState } from 'react'

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Bir hata oluştu')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    fetchApi,
  }
}