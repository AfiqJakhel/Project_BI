'use client'

import React from 'react'
import { KPICard } from '@/components/ui/KPICard'
import { KPICardDark } from '@/components/ui/KPICardDark'
import { RevenueLineChart } from '@/components/charts/RevenueLineChart'
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart'
import { formatRupiah, formatNumber } from '@/lib/utils'
import { useOverviewKPIs } from '@/hooks/useOverviewKPIs'
import { useDateFilter } from '@/components/providers/DateFilterProvider'

export function OverviewGrid() {
  const { dateRange, year } = useDateFilter()
  
  const formatDate = (date?: Date) => 
    date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : undefined
  
  const dateFrom = formatDate(dateRange.from)
  const dateTo = formatDate(dateRange.to)

  const { data, error, isLoading } = useOverviewKPIs(year)
  
  const revenue = data?.gross_revenue || 0
  const netProfit = data?.net_profit || 0
  const expenses = data?.expenses || 0
  
  // Calculate margin kotor di frontend
  const marginKotor = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
  
  const revenueChange = data?.comparison?.change_percent || 0
  
  return (
    <div className="flex flex-col gap-6 md:gap-12">
      {/* KPI Section */}
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <KPICardDark 
              label="Total Pendapatan (Omzet)" 
              value={isLoading ? '...' : formatRupiah(revenue)} 
              change={revenueChange} 
              changeLabel="vs bulan lalu"
            />
          </div>
          <div className="lg:col-span-2">
            <KPICardDark 
              label="Total Keuntungan Bersih" 
              value={isLoading ? '...' : formatRupiah(netProfit)} 
              change={data?.comparison?.change_percent || 0} 
              changeLabel="vs bulan lalu"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard 
            label="Total Pengeluaran Operasional" 
            value={isLoading ? '...' : formatRupiah(expenses)} 
            change={0} 
          />
          <KPICard 
            label="Persentase Keuntungan" 
            value={isLoading ? '...' : marginKotor.toFixed(1)} 
            prefix="%"
            change={0} 
          />
          <KPICard 
            label="Total Belanja Modal" 
            value={isLoading ? '...' : formatRupiah(data?.total_purchases || 0)} 
          />
        </div>
        {error && <p className="text-sm text-red-500">Gagal memuat data KPI.</p>}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RevenueLineChart dateFrom={dateFrom} dateTo={dateTo} />
        </div>
        <div className="lg:col-span-4">
          <CategoryDonutChart dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </section>

    </div>
  )
}

