'use client'

import React from 'react'
import { useInventoriKPI } from '@/lib/api'

export function InventoriKPICards() {
  const { data, isLoading, error } = useInventoriKPI()

  if (error) return <div className="text-red-500 text-sm">Gagal memuat KPI inventori.</div>

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse h-24 rounded" style={{ backgroundColor: 'var(--color-surface-dim)' }}></div>
        ))}
      </div>
    )
  }

  const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  return (
    <div className="grid grid-cols-4 gap-3">
      <Card title="Total Jenis Barang" value={data.total_sku_aktif} badgeColor="var(--color-success)" />
      <Card title="Total Nilai Modal" value={formatRp(data.total_nilai_inventori)} badgeColor="var(--color-accent-teal)" />
      <Card title="Stok Menipis" value={data.produk_hampir_habis} badgeColor="var(--color-warning)" />
      <Card title="Stok Habis" value={data.produk_out_of_stock} badgeColor="var(--color-error)" />
    </div>
  )
}

function Card({ title, value, badgeColor }: { title: string, value: string | number, badgeColor: string }) {
  return (
    <div className="p-8 rounded-[12px] shadow-sm border border-[var(--color-hairline)] flex flex-col justify-between" style={{ backgroundColor: 'var(--color-surface-card)' }}>
      <div className="text-[14px] font-medium opacity-80 mb-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)' }}>{title}</div>
      <div className="text-[28px] flex items-center justify-between" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
        <span>{value}</span>
      </div>
    </div>
  )
}
