import useSWR from 'swr'
import { fetcher } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function useRevenueTrend(dateFrom?: string, dateTo?: string, period?: string) {
  const queryParams = new URLSearchParams()
  if (dateFrom) queryParams.append('start_date', dateFrom)
  if (dateTo) queryParams.append('end_date', dateTo)
  if (period) queryParams.append('period', period.toLowerCase())
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const endpoint = `/sales/monthly`
  
  const { data, error, isLoading } = useSWR(
    [endpoint, period, dateFrom, dateTo],
    ([url]) => fetcher(`${BASE_URL}${url}${queryString}`)
  )

  return { data, isLoading, error }
}
