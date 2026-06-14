'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { useCashRatio } from '@/lib/api'

interface CashVsNonCashChartProps {
  period?: string
}

export function CashVsNonCashChart({ period = '' }: CashVsNonCashChartProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { data: apiData, isLoading } = useCashRatio(period)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const chartData = (apiData?.data || []).map((d: any) => ({
    displayLabel: d.period,
    Tunai: d.tunai,
    'Non Tunai': d.non_tunai,
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
        Rasio Kas Tunai vs Non-Tunai
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
                formatter={(value: any) => [formatRupiah(Number(value) || 0), undefined]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Tunai" stackId="a" fill="var(--color-primary)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Non Tunai" stackId="a" fill="var(--color-accent-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
