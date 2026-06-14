'use client'

import React, { useState, useEffect } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { useOperationalRatio } from '@/lib/api'

interface OperationalRatioChartProps {
  period?: string
}

export function OperationalRatioChart({ period = '' }: OperationalRatioChartProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { data: apiData, isLoading } = useOperationalRatio(period)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const chartData = (apiData?.data || []).map((d: any) => ({
    displayLabel: d.period,
    'Pendapatan Kotor': d.bruto,
    'Biaya Operasional': d.operational_cost,
    'Persentase Biaya': d.ratio,
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
        Biaya Operasional vs Omzet
      </h3>
      <div className="h-[300px] w-full">
        {(!isMounted || isLoading) ? (
           <div className="h-full w-full flex items-center justify-center text-sm" style={{ color: 'var(--color-on-dark-soft)' }}>Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <ComposedChart
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
                yAxisId="left"
                stroke="var(--color-on-dark-soft)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => formatRupiah(value)}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="var(--color-on-dark-soft)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
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
                formatter={(value: any, name: any) => [
                  name === 'Persentase Biaya' ? `${value}%` : formatRupiah(Number(value) || 0), 
                  name
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="Pendapatan Kotor" fill="var(--color-surface-dark-elevated)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="Biaya Operasional" fill="var(--color-accent-teal)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="Persentase Biaya" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
