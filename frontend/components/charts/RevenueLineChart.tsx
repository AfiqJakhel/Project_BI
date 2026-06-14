'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { useRevenueTrend } from '@/hooks/useRevenueTrend'

interface RevenueLineChartProps {
  dateFrom?: string
  dateTo?: string
  period?: string
}

export function RevenueLineChart({ dateFrom, dateTo, period = '' }: RevenueLineChartProps) {
  const { data: apiData, isLoading, error } = useRevenueTrend(dateFrom, dateTo, period)

  const isTahunan = period === 'tahunan'

  const dataKey = isTahunan ? 'net_profit' : 'gross_revenue'
  const chartData = (apiData?.data || []).map((d: any) => ({
    displayLabel: d.month_name,
    value: d[dataKey],
  }))

  const metricName = isTahunan ? 'Keuntungan Bersih' : 'Pendapatan Kotor'
  const chartTitle = isTahunan ? 'Trend Keuntungan Bersih' : 'Trend Pendapatan'

  return (
    <div 
      className="w-full h-[400px]"
      style={{
        backgroundColor: 'var(--color-surface-dark)',
        borderRadius: 'var(--rounded-lg)',
        padding: 'var(--spacing-xl)'
      }}
    >
      <h3 
        className="mb-6 font-medium tracking-wide text-sm uppercase"
        style={{ color: 'var(--color-on-dark)', fontFamily: 'var(--font-body)' }}
      >
        {chartTitle}
      </h3>
      <div className="h-[300px] w-full">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-800/50 rounded animate-pulse" />
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-red-400">Gagal memuat data</div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data</div>
        ) : (
          <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-dark-elevated)" vertical={false} />
              <XAxis 
                dataKey="displayLabel" 
                stroke="var(--color-on-dark-soft)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <YAxis 
                stroke="var(--color-on-dark-soft)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => formatRupiah(value)}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface-dark-elevated)',
                  border: 'none',
                  borderRadius: 'var(--rounded-md)',
                  color: 'var(--color-on-dark)'
                }}
                itemStyle={{ color: 'var(--color-on-dark)' }}
                formatter={(value: any) => [formatRupiah(Number(value) || 0), metricName]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={metricName}
                stroke="var(--color-primary)" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--color-surface-dark)', stroke: 'var(--color-primary)', strokeWidth: 2 }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
