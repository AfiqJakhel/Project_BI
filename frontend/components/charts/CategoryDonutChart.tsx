'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useCategoryExpenses } from '@/hooks/useCategoryExpenses'

interface CategoryDonutChartProps {
  dateFrom?: string
  dateTo?: string
  period?: string
}

const DEFAULT_COLORS = [
  'var(--color-primary)', 
  'var(--color-accent-teal)', 
  'var(--color-accent-amber)', 
  'var(--color-success)', 
  'var(--color-body-strong)'
]

export function CategoryDonutChart({ dateFrom, dateTo, period }: CategoryDonutChartProps) {
  const { data: apiData, isLoading, error } = useCategoryExpenses(dateFrom, dateTo, period)

  const chartData = (apiData?.data || []).map((d: any) => ({
    name: d.category_name,
    value: d.total_amount
  }))

  return (
    <div 
      className="w-full h-[400px] flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--rounded-lg)',
        padding: 'var(--spacing-xl)'
      }}
    >
      <h3 
        className="mb-2 font-medium tracking-wide text-sm uppercase"
        style={{ color: 'var(--color-body-strong)', fontFamily: 'var(--font-body)' }}
      >
        Pengeluaran by Kategori
      </h3>
      <div className="flex-1 w-full">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded animate-pulse" />
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-red-500">Gagal memuat data</div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">Tidak ada data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                labelLine={true}
                label={({ cx, cy, midAngle = 0, innerRadius, outerRadius, value, name, percent = 0 }: any) => {
                  const radius = outerRadius + 25;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  
                  return (
                    <text x={x} y={y} fill="var(--color-body-strong)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: 12, fontFamily: 'var(--font-body)' }}>
                      {`${name}: ${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-canvas)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--rounded-md)',
                  color: 'var(--color-body-strong)'
                }}
                itemStyle={{ color: 'var(--color-body)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span style={{ color: 'var(--color-body)', fontSize: '13px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
