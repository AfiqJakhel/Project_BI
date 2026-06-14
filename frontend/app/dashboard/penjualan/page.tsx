'use client'

import React, { useState } from 'react'
import { CategoryTab } from '@/components/ui/CategoryTab'
import { RevenueLineChart } from '@/components/charts/RevenueLineChart'
import { YearlyRevenueChart } from '@/components/charts/YearlyRevenueChart'
import { CashVsNonCashChart } from '@/components/charts/CashVsNonCashChart'
import { OperationalRatioChart } from '@/components/charts/OperationalRatioChart'
import { SalesHeatmap } from '@/components/dashboard/SalesHeatmap'
import { formatRupiah } from '@/lib/utils'
import { useRevenueTrend } from '@/hooks/useRevenueTrend'

export default function PenjualanPage() {
  const [period, setPeriod] = useState<string>('Bulanan')
  const periodKey = period.toLowerCase()

  const { data: trendData } = useRevenueTrend(undefined, undefined, periodKey)
  
  // Hitung total pendapatan dari data yang diambil
  const totalRevenue = trendData?.data?.reduce((sum: number, item: any) => {
    // Gunakan net_profit jika period === 'tahunan', selain itu gross_revenue
    const value = periodKey === 'tahunan' ? item.net_profit : item.gross_revenue
    return sum + (value || 0)
  }, 0) || 0

  return (
    <div className="flex flex-col gap-6 md:gap-12">
      <div className="flex justify-between items-center">
        <h2 
          className="text-2xl" 
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          Analisis Penjualan
        </h2>
        <CategoryTab 
          tabs={['Mingguan', 'Bulanan', 'Tahunan']} 
          activeTab={period} 
          onChange={setPeriod} 
        />
      </div>

      <div 
        className="w-full p-4 rounded-lg font-medium flex items-center justify-between"
        style={{ 
          backgroundColor: 'var(--color-primary)', 
          color: 'var(--color-on-primary)' 
        }}
      >
        <span>Total Penjualan Periode Ini</span>
        <span className="text-xl" style={{ fontFamily: 'var(--font-mono)' }}>{formatRupiah(totalRevenue)}</span>
      </div>

      <div className={`grid grid-cols-1 ${period === 'Tahunan' ? 'lg:grid-cols-2' : ''} gap-6`}>
        {period === 'Tahunan' && <YearlyRevenueChart period={periodKey} />}
        <RevenueLineChart period={periodKey} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashVsNonCashChart period={periodKey} />
        <OperationalRatioChart period={periodKey} />
      </div>

      <SalesHeatmap />
    </div>
  )
}
