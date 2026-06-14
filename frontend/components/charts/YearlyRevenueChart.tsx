'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { useYearlySales } from '@/lib/api'

interface YearlyRevenueChartProps {
  period?: string
}

export function YearlyRevenueChart({ period = '' }: YearlyRevenueChartProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { data: apiData, isLoading } = useYearlySales(period)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const chartData = (apiData?.data || []).map((d: any) => ({
    displayLabel: d.year.toString(),
    revenue: d.gross_revenue,
  }))

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
        Tren Pendapatan Tahunan
      </h3>
      <div className="h-[300px] w-full">
        {(!isMounted || isLoading) ? (
           <div className="h-full w-full flex items-center justify-center text-sm" style={{ color: 'var(--color-on-dark-soft)' }}>Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart
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
                cursor={{ fill: 'var(--color-surface-dark-elevated)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface-dark-elevated)',
                  border: 'none',
                  borderRadius: 'var(--rounded-md)',
                  color: 'var(--color-on-dark)'
                }}
                itemStyle={{ color: 'var(--color-on-dark)' }}
                formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Bruto']}
              />
              <Bar 
                dataKey="revenue" 
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
