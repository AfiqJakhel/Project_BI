import useSWR from 'swr'
import { fetcher } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function useOverviewKPIs(year?: string) {
  const queryParams = new URLSearchParams()
  if (year) queryParams.append('year', year)
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const endpoint = `/kpi/summary`
  
  const { data, error, isLoading } = useSWR(
    [endpoint, year],
    () => fetcher(`${BASE_URL}${endpoint}${queryString}`)
  )

  return { data, isLoading, error }
}
