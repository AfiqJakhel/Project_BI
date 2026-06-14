'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTopProducts } from '@/lib/api'

const KATEGORI_COLORS: Record<string, string> = {
  'Kaca Film':  '#cc785c',  // coral
  'Perawatan':  '#5db8a6',  // teal accent
  'Elektronik': '#e8a55a',  // amber accent
  'Interior':   '#888780',  // muted gray
  'Audio':      '#7f77dd',  // purple
  'Eksterior':  '#5db872',  // green
}

const CHART_HEIGHT = 480
const BAR_SIZE = 28
const MARGIN = { top: 20, right: 80, left: 180, bottom: 20 }

const CustomYTick = ({ x, y, payload }: any) => (
  <text
    x={x - 8}
    y={y}
    textAnchor="end"
    dominantBaseline="central"
    style={{
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fill: 'var(--color-body)',
    }}
  >
    {payload.value.length > 22
      ? payload.value.slice(0, 22) + '…'
      : payload.value}
  </text>
)

const CustomBarLabel = ({ x, y, width, value }: any) => (
  <text
    x={x + width + 8}
    y={y + BAR_SIZE / 2}
    dominantBaseline="central"
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fill: 'var(--color-muted)',
    }}
  >
    {value} unit
  </text>
)

export function ProductBarChart() {
  const { data: apiData, isLoading } = useTopProducts(10)
  
  const chartData = (apiData?.data || []).map((d: any) => ({
    id: d.id,
    nama: d.name,
    kategori: d.category,
    qty_sold: d.qty
  }))

  return (
    <div 
      className="w-full flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--rounded-lg)',
        padding: 'var(--spacing-xl)',
        height: CHART_HEIGHT + 100 // add extra height for header and legend
      }}
    >
      <h3 
        className="mb-4 font-medium tracking-wide text-sm uppercase"
        style={{ color: 'var(--color-body-strong)', fontFamily: 'var(--font-body)' }}
      >
        Top 10 Produk Terlaris
      </h3>
      <div className="flex-1 w-full relative">
        <div className="w-full h-full overflow-x-auto no-scrollbar pb-2">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={600} minHeight={1}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={MARGIN}
            >
              <XAxis
                type="number"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--color-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v} unit`}
              />
              <YAxis
                type="category"
                dataKey="nama"
                tick={<CustomYTick />}
                width={175}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: any, name: any) => [`${value} unit`, 'Qty Terjual']}
                contentStyle={{
                  background: 'var(--color-surface-dark)',
                  border: 'none',
                  borderRadius: 'var(--rounded-md)',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-on-dark)',
                }}
              />
              <Bar
                dataKey="qty_sold"
                barSize={BAR_SIZE}
                radius={[0, 4, 4, 0]}
                label={<CustomBarLabel />}
              >
                {chartData.map((entry: any) => (
                  <Cell
                    key={entry.id}
                    fill={KATEGORI_COLORS[entry.kategori] ?? 'var(--color-muted)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Mobile scroll indicator */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none md:hidden"
          style={{
            background: 'linear-gradient(to right, transparent, var(--color-surface-card))'
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-4 items-center justify-center text-xs" style={{ color: 'var(--color-body)' }}>
        {Object.entries(KATEGORI_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
