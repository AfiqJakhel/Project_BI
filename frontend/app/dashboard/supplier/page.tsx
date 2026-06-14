'use client'

import React from 'react'
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart'
import { TopSuppliersTable } from '@/components/dashboard/TopSuppliersTable'
import { LainLainExpensesTable } from '@/components/dashboard/LainLainExpensesTable'
import { MutasiStokChart } from '@/components/produk-inventori/MutasiStokChart'

export default function SupplierPengeluaranPage() {

  return (
    <div className="flex flex-col gap-6 md:gap-12">
      <div className="flex justify-between items-center">
        <h2 
          className="text-2xl" 
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          Supplier & Pengeluaran
        </h2>
      </div>

      <div className="w-full mb-6">
        <MutasiStokChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <CategoryDonutChart />
          <LainLainExpensesTable />
        </div>
        <div className="flex flex-col gap-6">
          <TopSuppliersTable />
        </div>
      </div>
    </div>
  )
}
