'use client'

import React, { useState } from 'react'
import { useStokAnalysis } from '@/lib/api'
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CategoryTab } from '@/components/ui/CategoryTab'

export function MutasiStokChart() {
  const [period, setPeriod] = useState<string>('Bulanan')
  const { data: response, isLoading, error } = useStokAnalysis(period.toLowerCase())

  if (error) return <div className="text-red-500 text-sm">Gagal memuat data mutasi stok.</div>

  if (isLoading || !response) {
    return <div className="animate-pulse h-[220px] rounded w-full" style={{ backgroundColor: 'var(--color-surface-dim)' }}></div>
  }

  const data = response.mutasi_data || []

  return (
    <div className="p-8 rounded-[12px] border border-[var(--color-hairline)]" style={{ backgroundColor: 'var(--color-surface-card)' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>Trend Barang Masuk</h3>
        <CategoryTab 
          tabs={['6 Bulan Terakhir', 'Tahunan']} 
          activeTab={period} 
          onChange={setPeriod} 
        />
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent-teal)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-accent-teal)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" opacity={0.5} />
            <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickFormatter={(val) => val.toLocaleString('id-ID')} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`} axisLine={false} tickLine={false} />
            <Tooltip 
              formatter={(value: any, name: any) => {
                const numValue = Number(value) || 0
                const mapName: any = { stok_masuk: 'Qty Barang Masuk', nilai_masuk: 'Nilai Pembelian' }
                const formattedValue = name === 'nilai_masuk' ? `Rp ${numValue.toLocaleString('id-ID')}` : numValue.toLocaleString('id-ID')
                return [formattedValue, mapName[name] || name]
              }}
              labelStyle={{ color: 'var(--color-muted)' }}
              contentStyle={{ borderRadius: '8px', fontSize: '13px', backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-hairline)', color: 'var(--color-ink)' }}
              itemStyle={{ color: 'var(--color-ink)' }}
            />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: 'var(--color-muted)' }} />
            <Area yAxisId="left" type="monotone" name="stok_masuk" dataKey="stok_masuk" stroke="var(--color-accent-teal)" fillOpacity={1} fill="url(#colorMasuk)" strokeWidth={2} />
            <Area yAxisId="right" type="monotone" name="nilai_masuk" dataKey="nilai_masuk" stroke="var(--color-primary)" fill="none" strokeWidth={2} strokeDasharray="5 5" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
