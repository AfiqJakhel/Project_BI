'use client'

import React from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { formatRupiah, formatNumber } from '@/lib/utils'
import { useTopSuppliers } from '@/hooks/useTopSuppliers'

type Supplier = {
  nama_supplier: string
  jumlah_transaksi: number
  total_qty: number
  total_nilai_pembelian: number
}

const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'nama_supplier',
    header: 'Nama Supplier',
  },
  {
    accessorKey: 'jumlah_transaksi',
    header: 'Total Transaksi',
    cell: ({ row }) => <span className="font-medium">{formatNumber(row.getValue('jumlah_transaksi'))}</span>
  },
  {
    accessorKey: 'total_qty',
    header: 'Total Qty Dibeli',
    cell: ({ row }) => <span className="font-medium">{formatNumber(row.getValue('total_qty'))}</span>
  },
  {
    accessorKey: 'total_nilai_pembelian',
    header: 'Total Nilai Pembelian',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total_nilai_pembelian'))
      return formatRupiah(amount)
    },
  },
]

interface TopSuppliersTableProps {
  dateFrom?: string
  dateTo?: string
  period?: string
}

export function TopSuppliersTable({ dateFrom, dateTo, period }: TopSuppliersTableProps) {
  const { data: apiData, isLoading, error } = useTopSuppliers(dateFrom, dateTo, period)
  
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
          Top Suppliers
        </h3>
      </div>
      
      {isLoading ? (
        <div className="w-full h-[200px] bg-gray-100 rounded animate-pulse" />
      ) : error ? (
        <div className="w-full h-[200px] flex items-center justify-center text-red-500">Gagal memuat data</div>
      ) : data.length === 0 ? (
        <div className="w-full h-[200px] flex items-center justify-center text-gray-500">Tidak ada data</div>
      ) : (
        <DataTable columns={columns} data={data} hidePagination={true} pageSize={data.length || 10} />
      )}
    </div>
  )
}
