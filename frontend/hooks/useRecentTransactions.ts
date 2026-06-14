import useSWR from 'swr'
import { fetcher } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function useRecentTransactions(limit: number = 10, dateFrom?: string, dateTo?: string) {
  const queryParams = new URLSearchParams()
  queryParams.append('limit', limit.toString())
  if (dateFrom) queryParams.append('start_date', dateFrom)
  if (dateTo) queryParams.append('end_date', dateTo)
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const endpoint = `/sales/recent`
  
  const { data, error, isLoading } = useSWR(
    [endpoint, limit, dateFrom, dateTo],
    () => fetcher(`${BASE_URL}${endpoint}${queryString}`)
  )

  return { data, isLoading, error }
}
