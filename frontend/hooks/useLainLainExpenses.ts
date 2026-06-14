import useSWR from 'swr'
import { fetcher } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function useLainLainExpenses(limit: number = 10, dateFrom?: string, dateTo?: string, period?: string) {
  let endpoint = `/expenses/lain-lain?limit=${limit}`
  if (dateFrom) endpoint += `&start_date=${dateFrom}`
  if (dateTo) endpoint += `&end_date=${dateTo}`
  if (period) endpoint += `&period=${period.toLowerCase()}`

  const { data, error, isLoading } = useSWR(
    endpoint,
    () => fetcher(`${BASE_URL}${endpoint}`)
  )

  return {
    data,
    isLoading,
    error,
  }
}

