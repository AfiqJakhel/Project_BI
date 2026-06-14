'use client'

import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type LowStockItem = {
  nama_barang: string
  supplier_name: string
  qty_sisa: number
}

interface Props {
  data: LowStockItem[]
}

const CustomYTick = ({ x, y, payload }: any) => (
  <text
    x={x - 8}
    y={y}
    textAnchor="end"
    dominantBaseline="central"
    style={{
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fill: 'var(--color-body)',
    }}
  >
    {payload.value.length > 20
      ? payload.value.slice(0, 20) + '…'
      : payload.value}
  </text>
)

const CustomBarLabel = ({ x, y, width, value }: any) => (
  <text
    x={x + width + 8}
    y={y + 14} // half of bar size 28
    dominantBaseline="central"
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fill: 'var(--color-muted)',
    }}
  >
    {value}
  </text>
)

export function LowStockChart({ data }: Props) {
  const [currentPage, setCurrentPage] = useState(1)

  // Membagi data menjadi 2 halaman saja
  const itemsPerPage = Math.ceil(data.length / 2) || 1
  const totalPages = Math.ceil(data.length / itemsPerPage)
  
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const currentData = data.slice(startIndex, endIndex)
  
  // Recharts draws from bottom up, so we reverse the sliced data 
  // so the most critical items in the current page appear at the top
  const chartData = [...currentData].reverse()

  const height = Math.max(300, currentData.length * 40 + 60)

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full relative overflow-x-auto no-scrollbar pb-2">
        <ResponsiveContainer width="100%" height={height} minWidth={500} minHeight={1}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 40, left: 160, bottom: 10 }}
          >
            <XAxis
              type="number"
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--color-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="nama_barang"
              tick={<CustomYTick />}
              width={150}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any) => [`${value} unit`, 'Sisa Stok']}
              contentStyle={{
                background: 'var(--color-surface-dark)',
                border: 'none',
                borderRadius: 'var(--rounded-md)',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-on-dark)',
              }}
            />
            <Bar
              dataKey="qty_sisa"
              barSize={28}
              radius={[0, 4, 4, 0]}
              label={<CustomBarLabel />}
            >
              {chartData.map((entry, index) => {
                // Color mapping based on urgency
                let color = '#ef4444' // red for 0
                if (entry.qty_sisa > 10) color = '#10b981' // green for > 10
                else if (entry.qty_sisa > 0) color = '#f59e0b' // amber for <= 10
                
                return <Cell key={`cell-${index}`} fill={color} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Menampilkan {startIndex + 1}-{Math.min(endIndex, data.length)} dari {data.length} produk
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 rounded text-sm transition-colors border"
              style={{ 
                backgroundColor: currentPage === 1 ? 'var(--color-surface-dim)' : 'transparent',
                borderColor: 'var(--color-surface-dark)',
                color: currentPage === 1 ? 'var(--color-muted)' : 'var(--color-ink)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Sebelumnya
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-1.5 rounded text-sm transition-colors border"
              style={{ 
                backgroundColor: currentPage === totalPages ? 'var(--color-surface-dim)' : 'transparent',
                borderColor: 'var(--color-surface-dark)',
                color: currentPage === totalPages ? 'var(--color-muted)' : 'var(--color-ink)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
