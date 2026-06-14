'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { BadgePill } from '@/components/ui/BadgePill'
import { BadgeCoral } from '@/components/ui/BadgeCoral'
import { formatRupiah } from '@/lib/utils'

import { useRecentTransactions } from '@/hooks/useRecentTransactions'

type Transaction = {
  id: string
  date: string
  customer: string
  items: string
  total: number
  status: string
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.getValue('id')}</span>
  },
  {
    accessorKey: 'date',
    header: 'Waktu',
    cell: ({ row }) => <span style={{ color: 'var(--color-muted)' }}>{row.getValue('date')}</span>
  },
  {
    accessorKey: 'customer',
    header: 'Pelanggan',
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total'))
      return <span className="font-medium">{formatRupiah(amount)}</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      if (status === 'lunas') return <BadgeCoral>Lunas</BadgeCoral>
      if (status === 'proses') return <BadgePill type="warning">Proses</BadgePill>
      if (status === 'batal') return <BadgePill type="error">Batal</BadgePill>
      return <BadgePill>{status}</BadgePill>
    }
  },
]

interface RecentTransactionsProps {
  dateFrom?: string
  dateTo?: string
}

export function RecentTransactions({ dateFrom, dateTo }: RecentTransactionsProps) {
  const [page, setPage] = useState(1)
  const { data: apiData, isLoading, error } = useRecentTransactions(10, dateFrom, dateTo)
  
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
          Transaksi Terbaru
        </h3>
        <Link 
          href="/dashboard/penjualan/transaksi"
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
