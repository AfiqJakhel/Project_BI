import useSWR from 'swr'
import { useDateFilter } from '@/components/providers/DateFilterProvider'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('API request failed')
  return res.json()
})

// Custom hooks with date parameters

export function useKPI() {
  const { dateParams } = useDateFilter()
  return useSWR(`${API_BASE_URL}/kpi/summary${dateParams}`, fetcher)
}

export function useMonthlySales() {
  const { dateParams } = useDateFilter()
  return useSWR(`${API_BASE_URL}/sales/monthly${dateParams}`, fetcher)
}

export function useYearlySales(period: string = '') {
  const query = period ? `?period=${period.toLowerCase()}` : ''
  return useSWR([`${API_BASE_URL}/sales/yearly`, period], ([url]) => fetcher(`${url}${query}`))
}

export function useCashRatio(period: string = '') {
  const { dateParams } = useDateFilter()
  const query = period ? (dateParams ? `${dateParams}&period=${period.toLowerCase()}` : `?period=${period.toLowerCase()}`) : dateParams
  return useSWR([`${API_BASE_URL}/sales/cash-ratio`, period], ([url]) => fetcher(`${url}${query}`))
}

export function useOperationalRatio(period: string = '') {
  const { dateParams } = useDateFilter()
  const query = period ? (dateParams ? `${dateParams}&period=${period.toLowerCase()}` : `?period=${period.toLowerCase()}`) : dateParams
  return useSWR([`${API_BASE_URL}/sales/operational-ratio`, period], ([url]) => fetcher(`${url}${query}`))
}

export function useExpenseCategories() {
  const { dateParams } = useDateFilter()
  return useSWR(`${API_BASE_URL}/expenses/categories${dateParams}`, fetcher)
}

export function useStockSummary() {
  return useSWR(`${API_BASE_URL}/stock/summary`, fetcher)
}

export function useLowStock(threshold: number = 10) {
  return useSWR(`${API_BASE_URL}/stock/low-stock?threshold=${threshold}`, fetcher)
}

export function useSalesActivity(year: number) {
  return useSWR([`${API_BASE_URL}/sales/activity`, year], ([url, y]) => fetcher(`${url}?year=${y}`))
}

export function useSalesHeatmap(year?: number | null, month?: number | null) {
  const { dateParams } = useDateFilter()
  
  let finalQuery = dateParams || ''
  
  if (year || month) {
    const params = new URLSearchParams(dateParams ? dateParams.replace('?', '') : '')
    if (year) params.set('year', year.toString())
    if (month) params.set('month', month.toString())
    finalQuery = `?${params.toString()}`
  }
  
  return useSWR([`${API_BASE_URL}/sales/heatmap`, finalQuery], ([url, query]) => fetcher(`${url}${query}`))
}

export function useRecentTransactions(limit: number = 10) {
  return useSWR(`${API_BASE_URL}/sales/recent?limit=${limit}`, fetcher)
}

export function useTopProducts(limit: number = 10) {
  return useSWR(`${API_BASE_URL}/sales/top-products?limit=${limit}`, fetcher)
}


export function useReportMetadata() {
  return useSWR(`${API_BASE_URL}/reports/metadata`, fetcher)
}

export function useInventoriKPI() {
  return useSWR(`${API_BASE_URL}/inventory/kpi`, fetcher)
}

export function useInventoriKategori() {
  return useSWR(`${API_BASE_URL}/inventory/kategori`, fetcher)
}

export function useStokAlert(limit: number = 10) {
  return useSWR(`${API_BASE_URL}/inventory/alert?limit=${limit}`, fetcher)
}

export function useStokAnalysis(period: string = 'bulanan') {
  return useSWR([`${API_BASE_URL}/inventory/analysis`, period], ([url, p]) => fetcher(`${url}?period=${p}`))
}
