'use client'

import React from 'react'
import { ProductBarChart } from '@/components/charts/ProductBarChart'

import { formatRupiah, formatNumber } from '@/lib/utils'
import { useStockSummary } from '@/lib/api'
import { InventoriKPICards } from '@/components/produk-inventori/InventoriKPICards'
import { StokAlertTable } from '@/components/produk-inventori/StokAlertTable'
import { StokVsSalesScatter } from '@/components/produk-inventori/StokVsSalesScatter'

export default function ProdukPage() {
  const { data: stockSummary, isLoading: isLoadingSummary } = useStockSummary()

  return (
    <div className="flex flex-col gap-6 md:gap-12">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 
            className="text-2xl" 
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
          >
            Produk & Inventori
          </h2>
        </div>
        
        {isLoadingSummary ? (
          <div className="animate-pulse h-6 rounded w-64 mt-2" style={{ backgroundColor: 'var(--color-surface-dim)' }}></div>
        ) : stockSummary ? (
          <div className="text-sm flex gap-4 mt-2" style={{ color: 'var(--color-body)' }}>
            <div>Total Stok: <strong style={{ color: 'var(--color-ink)' }}>{formatNumber(stockSummary.total_qty_sisa)}</strong></div>
            <div>Nilai Modal: <strong style={{ color: 'var(--color-ink)' }}>{formatRupiah(stockSummary.total_nilai_modal_sisa)}</strong></div>
          </div>
        ) : null}
      </div>

      <InventoriKPICards />
      <StokAlertTable />
      <div className="w-full">
        <StokVsSalesScatter />
      </div>

      <ProductBarChart />

    </div>
  )
}
