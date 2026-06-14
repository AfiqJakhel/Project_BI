'use client'

import React, { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { BadgePill } from '@/components/ui/BadgePill'
import { BadgeCoral } from '@/components/ui/BadgeCoral'
import { formatRupiah } from '@/lib/utils'
import { mockTransaksi } from '@/lib/mock-data'
import { Search, Download, Calendar } from 'lucide-react'

type Transaction = {
  id: string
  waktu: string
  pelanggan: string
  produk: string
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
    accessorKey: 'waktu',
    header: 'Waktu',
    cell: ({ row }) => <span style={{ color: 'var(--color-muted)' }}>{row.getValue('waktu')}</span>
  },
  {
    accessorKey: 'pelanggan',
    header: 'Pelanggan',
  },
  {
    accessorKey: 'produk',
    header: 'Produk',
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

export default function TransaksiPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')

  const filteredData = mockTransaksi.filter(trx => {
    const matchesSearch = trx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trx.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trx.produk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || trx.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex justify-between items-center">
        <h2 
          className="text-2xl" 
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          Semua Transaksi
        </h2>
        <button 
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors"
          style={{ 
            backgroundColor: 'var(--color-surface-card)', 
            color: 'var(--color-body-strong)',
            border: '1px solid var(--color-hairline)'
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div 
        className="p-6 rounded-lg flex flex-col gap-6"
        style={{ backgroundColor: 'var(--color-surface-card)' }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID, Pelanggan, atau Produk..." 
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-transparent text-sm"
              style={{ 
                borderColor: 'var(--color-hairline)',
                color: 'var(--color-body)'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Status */}
            <select 
              className="px-4 py-2 rounded-md border bg-transparent text-sm"
              style={{ 
                borderColor: 'var(--color-hairline)',
                color: 'var(--color-body)'
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="lunas">Lunas</option>
              <option value="proses">Proses</option>
              <option value="batal">Batal</option>
            </select>

            {/* Filter Periode Dummy Button */}
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm"
              style={{ 
                borderColor: 'var(--color-hairline)',
                color: 'var(--color-body)'
              }}
            >
              <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
              Pilih Periode
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={filteredData} pageSize={10} />
      </div>
    </div>
  )
}
