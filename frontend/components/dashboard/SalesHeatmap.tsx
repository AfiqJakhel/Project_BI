'use client'

import React, { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import { useSalesHeatmap } from '@/lib/api'

interface HeatmapDay {
  date: string      // '2024-01-01'
  value: number     // jumlah transaksi
  revenue: number   // revenue hari itu
  dayOfWeek?: number // 0=Minggu, 1=Senin ... 6=Sabtu
  week?: number      // nomor minggu dalam range
}

function getColorForValue(value: number) {
  if (value === 0) return 'var(--color-surface-soft)' 
  if (value <= 3) return '#f5c4b3'
  if (value <= 6) return '#f0997b'
  if (value <= 10) return '#d85a30'
  return '#993c1d'
}

export function SalesHeatmap() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)

  // Pass null for month so we always get the full year's data
  const { data: apiData, isLoading } = useSalesHeatmap(selectedYear, null)
  
  const data = React.useMemo(() => {
    if (!apiData?.data || apiData.data.length === 0) return []
    
    const sortedData = [...apiData.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const earliestDate = new Date(sortedData[0].date)
    const startOffset = earliestDate.getDay() === 0 ? 6 : earliestDate.getDay() - 1
    const gridStartDate = new Date(earliestDate)
    gridStartDate.setDate(earliestDate.getDate() - startOffset)
    gridStartDate.setHours(0,0,0,0)
    
    return sortedData.map(d => {
      const dateObj = new Date(d.date)
      const dayOfWeek = dateObj.getDay()
      
      const diffTime = dateObj.getTime() - gridStartDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const week = Math.floor(diffDays / 7)
      
      return {
        ...d,
        dayOfWeek,
        week
      }
    })
  }, [apiData])

  const weeks = data.length > 0 ? Math.max(...data.map(d => d.week || 0)) + 1 : 0
  const daysMap = [1, 2, 3, 4, 5, 6, 0] // Senin (1) to Minggu (0)

  // Generate year options from 2020 to current year
  const yearOptions = []
  for (let y = 2020; y <= currentYear; y++) {
    yearOptions.push(y)
  }

  return (
    <div 
      className="w-full overflow-x-auto scrollbar-hide"
      style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--rounded-lg)',
        padding: 'var(--spacing-xl)'
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 
          className="font-medium tracking-wide text-sm uppercase"
          style={{ color: 'var(--color-body-strong)', fontFamily: 'var(--font-body)' }}
        >
          Aktivitas Penjualan ({selectedYear})
        </h3>
        
        <div className="flex gap-2 text-sm">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-[14px] outline-none cursor-pointer"
            style={{ 
              backgroundColor: 'var(--color-canvas)', 
              color: 'var(--color-ink)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--rounded-md)',
              height: '40px',
              fontFamily: 'var(--font-body)',
              fontSize: '16px'
            }}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full h-[116px] flex items-center justify-center text-sm" style={{ color: 'var(--color-muted)' }}>
          Loading aktivitas...
        </div>
      ) : data.length === 0 ? (
        <div className="w-full h-[116px] flex items-center justify-center text-sm" style={{ color: 'var(--color-muted)' }}>
          Tidak ada aktivitas pada tahun {selectedYear}.
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Y Axis labels */}
          <div className="flex flex-col justify-between pt-1" style={{ fontSize: '10px', color: 'var(--color-muted)', height: '116px', marginTop: '2px' }}>
            <span>Sen</span>
            <span>Rab</span>
            <span>Jum</span>
          </div>

          {/* Heatmap Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${weeks}, 14px)`,
              gridTemplateRows: 'repeat(7, 14px)',
              gap: '4px',
            }}
          >
            {daysMap.map((dayOfWeek) => (
              data.filter(d => d.dayOfWeek === dayOfWeek).map((day, i) => {
                const d = new Date(day.date)
                const formattedDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <div 
                    key={`${dayOfWeek}-${i}`}
                    className="w-[14px] h-[14px] rounded-[3px] relative group cursor-pointer"
                    style={{ 
                      backgroundColor: getColorForValue(day.value),
                      gridRow: daysMap.indexOf(dayOfWeek) + 1,
                      gridColumn: (day.week || 0) + 1
                    }}
                  >
                    <div 
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none px-2 py-1 text-xs whitespace-nowrap rounded"
                      style={{ backgroundColor: 'var(--color-surface-dark)', color: 'var(--color-on-dark)' }}
                    >
                      {formattedDate} — {day.value} transaksi / {formatRupiah(day.revenue)}
                    </div>
                  </div>
                )
              })
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 flex items-center justify-end gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
        <span>Sedikit</span>
        <div className="w-[14px] h-[14px] rounded-[3px]" style={{ backgroundColor: getColorForValue(0) }} />
        <div className="w-[14px] h-[14px] rounded-[3px]" style={{ backgroundColor: getColorForValue(2) }} />
        <div className="w-[14px] h-[14px] rounded-[3px]" style={{ backgroundColor: getColorForValue(5) }} />
        <div className="w-[14px] h-[14px] rounded-[3px]" style={{ backgroundColor: getColorForValue(8) }} />
        <div className="w-[14px] h-[14px] rounded-[3px]" style={{ backgroundColor: getColorForValue(12) }} />
        <span>Banyak</span>
      </div>
    </div>
  )
}
