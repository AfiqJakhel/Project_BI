'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { formatRupiah, formatNumber } from '@/lib/utils'
import { useTopProducts } from '@/hooks/useTopProducts'

type Product = {
  id: string
  name: string
  category: string
  qty: number
  revenue: number
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Nama Produk',
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
  },
  {
    accessorKey: 'qty',
    header: 'Qty Terjual',
    cell: ({ row }) => <span className="font-medium">{formatNumber(row.getValue('qty'))}</span>
  },
  {
    accessorKey: 'revenue',
    header: 'Pendapatan',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('revenue'))
      return formatRupiah(amount)
    },
  },
]

interface TopProductsTableProps {
  dateFrom?: string
  dateTo?: string
}

export function TopProductsTable({ dateFrom, dateTo }: TopProductsTableProps) {
  const [page, setPage] = useState(1)
  const { data: apiData, isLoading, error } = useTopProducts(5, dateFrom, dateTo)
  
  useEffect(() => {
    setPage(1)
  }, [dateFrom, dateTo])

  const data = apiData?.data || []

  return (
    <div 
      className="w-full flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--rounded-lg)',
        padding: 'var(--spacing-xl)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 
          className="font-medium tracking-wide text-sm uppercase"
          style={{ color: 'var(--color-body-strong)', fontFamily: 'var(--font-body)' }}
        >
          Produk Terlaris
        </h3>
        <Link 
          href="/dashboard/produk"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Lihat Semua
        </Link>
      </div>
      
      {isLoading ? (
        <div className="w-full h-[200px] bg-gray-100 rounded animate-pulse" />
      ) : error ? (
        <div className="w-full h-[200px] flex items-center justify-center text-red-500">Gagal memuat data</div>
      ) : data.length === 0 ? (
        <div className="w-full h-[200px] flex items-center justify-center text-gray-500">Tidak ada data</div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  )
}
