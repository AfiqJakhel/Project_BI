'use client'

import React from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { formatRupiah } from '@/lib/utils'
import { useLainLainExpenses } from '@/hooks/useLainLainExpenses'

type Expense = {
  keterangan: string
  total_amount: number
}

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'keterangan',
    header: 'Keterangan Pengeluaran',
  },
  {
    accessorKey: 'total_amount',
    header: 'Total Biaya',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total_amount'))
      return formatRupiah(amount)
    },
  },
]

interface LainLainExpensesTableProps {
  dateFrom?: string
  dateTo?: string
  period?: string
}

export function LainLainExpensesTable({ dateFrom, dateTo, period }: LainLainExpensesTableProps) {
  const { data: apiData, isLoading, error } = useLainLainExpenses(10, dateFrom, dateTo, period)
  
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
          Detail Pengeluaran Lain-Lain
        </h3>
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
