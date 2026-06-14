'use client'

import React from 'react'
import { useStokAnalysis } from '@/lib/api'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

const COLORS = ['var(--color-primary)', 'var(--color-accent-teal)', 'var(--color-accent-amber)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-error)', 'var(--color-muted)']

export function StokVsSalesScatter() {
  const { data: response, isLoading, error } = useStokAnalysis()

  if (error) return <div className="text-red-500 text-sm">Gagal memuat analisis stok.</div>

  if (isLoading || !response) {
    return <div className="animate-pulse h-[220px] rounded w-full" style={{ backgroundColor: 'var(--color-surface-dim)' }}></div>
  }

  const rawData = response.scatter_data || []
  const data = rawData.map((d: any) => ({
    ...d,
    laju_jual_asli: d.laju_jual,
    laju_jual: Math.min(d.laju_jual, 30),
    stok_asli: d.stok,
    stok: Math.min(d.stok, 70)
  }))
  
  if (data.length === 0) return <div className="p-8 rounded-[12px] border border-[var(--color-hairline)]" style={{ backgroundColor: 'var(--color-surface-card)' }}>Data tidak tersedia</div>

  const activeX = data.filter((d: any) => d.laju_jual > 0).map((d: any) => d.laju_jual)
  const medianX = activeX.length > 0 ? activeX.reduce((a: number, b: number) => a + b, 0) / activeX.length : 0
  
  const activeY = data.filter((d: any) => d.stok > 0).map((d: any) => d.stok)
  const medianY = activeY.length > 0 ? activeY.reduce((a: number, b: number) => a + b, 0) / activeY.length : 0

  const uniqueKategori = Array.from(new Set(data.map((d: any) => d.kategori)))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { nama, stok_asli, laju_jual_asli, kategori } = payload[0].payload
      return (
        <div className="bg-[var(--color-canvas)] border border-[var(--color-hairline)] p-4 shadow-sm rounded-[8px] text-[13px]" style={{ color: 'var(--color-ink)' }}>
          <div className="font-medium mb-1">{nama}</div>
          <div style={{ color: 'var(--color-muted)' }}>Kategori: {kategori}</div>
          <div style={{ color: 'var(--color-muted)' }}>Sisa Stok: {stok_asli}</div>
          <div style={{ color: 'var(--color-muted)' }}>Laju Jual: {laju_jual_asli}</div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-8 rounded-[12px] border border-[var(--color-hairline)] relative" style={{ backgroundColor: 'var(--color-surface-card)' }}>
      <h3 className="text-[18px] font-medium mb-6" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>Analisis Penjualan & Stok Barang</h3>
      
      <div className="absolute inset-0 pointer-events-none p-8 pt-16 text-[12px] flex flex-col justify-between" style={{ zIndex: 0, color: 'var(--color-muted-soft)', fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        <div className="flex justify-between w-full px-12">
          <span>Perlu Tambah Stok</span>
          <span>Cepat Terjual</span>
        </div>
        <div className="flex justify-between w-full px-12 mb-8">
          <span>Lama Tidak Terjual</span>
          <span>Awas Kehabisan</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 220, position: 'relative', zIndex: 1 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" opacity={0.5} />
            <XAxis 
              type="number" 
              dataKey="laju_jual" 
              name="Laju Jual" 
              tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
              label={{ value: 'Laju penjualan →', position: 'bottom', offset: 0, fontSize: 12, fill: 'var(--color-muted)' }} 
            />
            <YAxis 
              type="number" 
              dataKey="stok" 
              name="Stok" 
              tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
              label={{ value: '← Stok tersedia', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'var(--color-muted)' }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-hairline)' }} />
            
            <ReferenceLine x={medianX} stroke="var(--color-muted-soft)" strokeDasharray="3 3" />
            <ReferenceLine y={medianY} stroke="var(--color-muted-soft)" strokeDasharray="3 3" />
            
            <Scatter name="Produk" data={data}>
              {data.map((entry: any, index: number) => {
                const kIdx = uniqueKategori.indexOf(entry.kategori)
                return <Cell key={`cell-${index}`} fill={COLORS[kIdx % COLORS.length]} />
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
