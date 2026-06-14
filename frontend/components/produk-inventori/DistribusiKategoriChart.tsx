'use client'

import React from 'react'
import { useInventoriKategori } from '@/lib/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['var(--color-primary)', 'var(--color-accent-teal)', 'var(--color-accent-amber)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-error)', 'var(--color-muted)']

export function DistribusiKategoriChart() {
  const { data: response, isLoading, error } = useInventoriKategori()

  if (error) return <div className="text-red-500 text-sm">Gagal memuat Distribusi Kategori.</div>

  if (isLoading || !response) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="animate-pulse h-[250px] rounded" style={{ backgroundColor: 'var(--color-surface-dim)' }}></div>
        <div className="animate-pulse h-[250px] rounded" style={{ backgroundColor: 'var(--color-surface-dim)' }}></div>
      </div>
    )
  }

  const data = response.data
  const barData = [...data].sort((a, b) => b.nilai_inventori - a.nilai_inventori)

  const formatRpPendek = (val: number) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)} Jt`
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`
    return `Rp ${val}`
  }

  const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Pie Chart Panel */}
      <div className="p-8 rounded-[12px] border border-[var(--color-hairline)]" style={{ backgroundColor: 'var(--color-surface-card)' }}>
        <h3 className="text-[18px] font-medium mb-6" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>Total SKU per Kategori</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="jumlah_sku"
                nameKey="kategori"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => {
                const total = data.reduce((sum: number, d: any) => sum + d.jumlah_sku, 0)
                const percent = ((Number(value) / total) * 100).toFixed(1)
                return [`${value} SKU (${percent}%)`, name]
              }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Panel */}
      <div className="p-8 rounded-[12px] border border-[var(--color-hairline)]" style={{ backgroundColor: 'var(--color-surface-card)' }}>
        <h3 className="text-[18px] font-medium mb-6" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>Nilai Inventori per Kategori</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-hairline)" opacity={0.5} />
              <XAxis type="number" tickFormatter={formatRpPendek} fontSize={11} tick={{ fill: 'var(--color-body)' }} />
              <YAxis dataKey="kategori" type="category" width={90} fontSize={11} tick={{ fill: 'var(--color-body)' }} />
              <Tooltip formatter={(value: number) => formatRp(value)} />
              <Bar dataKey="nilai_inventori" radius={[0, 4, 4, 0]}>
                {barData.map((entry: any, index: number) => {
                  const originalIndex = data.findIndex((d: any) => d.kategori === entry.kategori)
                  return <Cell key={`cell-${index}`} fill={COLORS[originalIndex % COLORS.length]} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
