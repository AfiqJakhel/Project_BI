'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { User, Menu } from 'lucide-react'
import 'react-day-picker/dist/style.css'
import '@/app/date-picker.css'
import { useDateFilter } from '@/components/providers/DateFilterProvider'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/penjualan': 'Penjualan',
  '/dashboard/produk': 'Produk',
  '/dashboard/supplier': 'Supplier & Pengeluaran',
  '/dashboard/pengaturan': 'Pengaturan',
}

export function TopBar({ setMobileMenuOpen }: { setMobileMenuOpen: (val: boolean) => void }) {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/penjualan/transaksi')) return 'Transaksi'
    return pageTitles[pathname] ?? 'Dashboard'
  }

  const { year, month, setYear, setMonth } = useDateFilter()

  const isOverview = pathname === '/dashboard'

  return (
    <header 
      className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 w-full"
      style={{ 
        backgroundColor: 'var(--color-canvas)',
        borderBottom: '1px solid var(--color-hairline)'
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden flex items-center justify-center w-11 h-11 shrink-0 rounded hover:bg-black/5 transition-colors"
          style={{ color: 'var(--color-ink)' }}
        >
          <Menu size={24} />
        </button>
        <h1 
          className="text-xl md:text-2xl font-normal tracking-tight truncate pl-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', letterSpacing: '-0.3px' }}
        >
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 relative">
        {/* Global Year and Month Filter */}
        <div className="flex items-center gap-2">
          <select 
            value={year} 
            onChange={(e) => {
              setYear(e.target.value)
              if (!e.target.value) setMonth('')
            }}
            className="px-2 md:px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium cursor-pointer transition-colors outline-none"
            style={{ 
              backgroundColor: 'var(--color-surface-card)', 
              color: 'var(--color-body-strong)',
              border: '1px solid var(--color-hairline)',
              fontFamily: 'var(--font-body)'
            }}
          >
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          {year && (
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="px-2 md:px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium cursor-pointer transition-colors outline-none"
              style={{ 
                backgroundColor: 'var(--color-surface-card)', 
                color: 'var(--color-body-strong)',
                border: '1px solid var(--color-hairline)',
                fontFamily: 'var(--font-body)'
              }}
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m.toString()}>
                  {new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Avatar Placeholder */}
        <div 
          className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-surface-cream-strong)', color: 'var(--color-ink)' }}
        >
          <User size={18} />
        </div>
      </div>
    </header>
  )
}
