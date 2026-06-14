import useSWR from 'swr'
import { fetcher } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function useCategoryExpenses(dateFrom?: string, dateTo?: string, period?: string) {
  const queryParams = new URLSearchParams()
  if (dateFrom) queryParams.append('start_date', dateFrom)
  if (dateTo) queryParams.append('end_date', dateTo)
  if (period) queryParams.append('period', period.toLowerCase())
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const endpoint = `/expenses/categories`
  
  const { data, error, isLoading } = useSWR(
    [endpoint, dateFrom, dateTo],
    () => fetcher(`${BASE_URL}${endpoint}${queryString}`)
  )

  return { data, isLoading, error }
}
