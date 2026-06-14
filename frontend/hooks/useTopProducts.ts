import useSWR from 'swr'
import { fetcher } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function useTopProducts(limit: number = 10, dateFrom?: string, dateTo?: string) {
  const queryParams = new URLSearchParams()
  queryParams.append('limit', limit.toString())
  // Note: Backend /top-products doesn't fully support time_filter natively yet based on current router,
  // but we pass it anyway to keep the hook signature consistent and trigger re-fetches.
  if (dateFrom) queryParams.append('start_date', dateFrom)
  if (dateTo) queryParams.append('end_date', dateTo)
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const endpoint = `/sales/top-products`
  
  const { data, error, isLoading } = useSWR(
    [endpoint, limit, dateFrom, dateTo],
    () => fetcher(`${BASE_URL}${endpoint}${queryString}`)
  )

  return { data, isLoading, error }
}
