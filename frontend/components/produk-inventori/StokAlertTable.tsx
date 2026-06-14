'use client'

import React, { useState } from 'react'
import { useStokAlert } from '@/lib/api'

export function StokAlertTable() {
  const { data: response, isLoading, error } = useStokAlert(100)
  const [isExpanded, setIsExpanded] = useState(false)

  if (error) return <div className="text-red-500 text-sm">Gagal memuat Alert Stok.</div>

  if (isLoading || !response) {
    return <div className="animate-pulse h-[250px] rounded w-full" style={{ backgroundColor: 'var(--color-surface-dim)' }}></div>
  }

  const data = response.data || []
  
  // Urutkan out_of_stock dulu, lalu hampir_habis
  const sortedData = [...data].sort((a, b) => {
    if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return -1
    if (b.status === 'out_of_stock' && a.status !== 'out_of_stock') return 1
    return a.stok_tersedia - b.stok_tersedia
  })

  if (data.length === 0) {
    return (
      <div className="p-8 rounded-[12px] border border-[var(--color-hairline)]" style={{ backgroundColor: 'var(--color-surface-card)' }}>
        <h3 className="text-[18px] font-medium mb-6" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>Daftar Barang Segera Habis</h3>
        <div className="text-[var(--color-success)] text-[14px] p-4 text-center">Semua produk dalam kondisi stok aman ✓</div>
      </div>
    )
  }

  const displayedData = isExpanded ? sortedData : sortedData.slice(0, 5)
  const remainingCount = sortedData.length - 5

  return (
    <div className="p-8 rounded-[12px] border border-[var(--color-hairline)]" style={{ backgroundColor: 'var(--color-surface-card)' }}>
      <h3 className="text-[18px] font-medium mb-6" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>Daftar Barang Segera Habis</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-body)' }}>
          <thead>
            <tr className="border-b border-[var(--color-hairline)] text-[var(--color-muted)]">
              <th className="py-3 px-2 font-medium">Status</th>
              <th className="py-3 px-2 font-medium">Nama Produk</th>
              <th className="py-3 px-2 font-medium">Kategori</th>
              <th className="py-3 px-2 font-medium">Sisa Stok</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, idx) => {
              const isOOS = item.status === 'out_of_stock'
              const badgeClass = isOOS ? 'bg-[var(--color-error)] text-[var(--color-on-primary)]' : 'bg-[var(--color-warning)] text-[var(--color-on-primary)]'
              const badgeText = isOOS ? 'Stok Habis' : 'Stok Menipis'

              return (
                <tr key={`${item.id}-${idx}`} className="border-b border-[var(--color-hairline)] last:border-0">
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-[9999px] text-[12px] font-medium ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-medium" style={{ color: 'var(--color-ink)' }}>{item.nama_produk}</td>
                  <td className="py-3 px-2 text-[var(--color-muted)]">{item.kategori}</td>
                  <td className="py-3 px-2">{item.stok_tersedia}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {remainingCount > 0 && (
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[14px] font-medium hover:underline" 
            style={{ color: 'var(--color-primary)' }}
          >
            {isExpanded ? 'Tutup' : `Tampilkan ${remainingCount} lainnya ↓`}
          </button>
        </div>
      )}
    </div>
  )
}
