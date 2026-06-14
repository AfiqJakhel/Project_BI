'use client'

import React, { useMemo } from 'react'
import { useStokAnalysis } from '@/lib/api'

const salesBins = [
  { id: 's0', label: '0', min: 0, max: 0 },
  { id: 's1', label: '1-10', min: 1, max: 10 },
  { id: 's2', label: '11-50', min: 11, max: 50 },
  { id: 's3', label: '>50', min: 51, max: Infinity }
]

const stockBins = [
  { id: 'k4', label: '>100', min: 101, max: Infinity },
  { id: 'k3', label: '51-100', min: 51, max: 100 },
  { id: 'k2', label: '11-50', min: 11, max: 50 },
  { id: 'k1', label: '1-10', min: 1, max: 10 },
  { id: 'k0', label: '0', min: 0, max: 0 }
]

type ZoneInfo = { color: string, label: string }

const getZone = (rIdx: number, cIdx: number): ZoneInfo => {
  // rIdx: 0(>100), 1(51-100), 2(11-50), 3(1-10), 4(0)
  // cIdx: 0(0), 1(1-10), 2(11-50), 3(>50)
  
  if (rIdx === 4 && cIdx === 0) return { color: 'var(--color-muted-soft)', label: 'Kosong' } // 0 stock, 0 sales
  
  if (rIdx <= 2 && cIdx === 0) return { color: 'var(--color-error)', label: 'Stok Mati' } // High stock, 0 sales
  if (rIdx <= 1 && cIdx === 1) return { color: 'var(--color-error)', label: 'Stok Lambat' } // High stock, very low sales
  
  if (rIdx === 2 && cIdx === 1) return { color: 'var(--color-warning)', label: 'Normal Lambat' }
  if (rIdx === 3 && cIdx <= 1) return { color: 'var(--color-warning)', label: 'Pantau' }
  if (rIdx === 0 && cIdx === 2) return { color: 'var(--color-warning)', label: 'Pantau Overstock' }

  if (rIdx <= 2 && cIdx >= 2) return { color: 'var(--color-success)', label: 'Produk Sehat' } // Good stock, good sales
  
  return { color: 'var(--color-accent-teal)', label: 'Prioritas Restock' } // Low stock, any sales > 0 OR 0 stock, high sales
}

export function SalesStockHeatmap() {
  const { data: response, isLoading, error } = useStokAnalysis()

  const rawData = response?.scatter_data || []

  const heatmapData = useMemo(() => {
    // Initialize 2D array [stockIndex][salesIndex]
    const grid: { count: number, items: any[] }[][] = stockBins.map(() => 
      salesBins.map(() => ({ count: 0, items: [] }))
    )

    let maxCount = 0

    rawData.forEach((item: any) => {
      const sale = item.laju_jual || 0
      const stock = item.stok || 0

      const sIndex = salesBins.findIndex(b => sale >= b.min && sale <= b.max)
      const kIndex = stockBins.findIndex(b => stock >= b.min && stock <= b.max)

      if (sIndex !== -1 && kIndex !== -1) {
        grid[kIndex][sIndex].count += 1
        grid[kIndex][sIndex].items.push(item)
        if (grid[kIndex][sIndex].count > maxCount) {
          maxCount = grid[kIndex][sIndex].count
        }
      }
    })

    const allCells: any[] = []
    grid.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        allCells.push({
          ...cell,
          rIdx,
          cIdx,
          zone: getZone(rIdx, cIdx),
          stockLabel: stockBins[rIdx].label,
          salesLabel: salesBins[cIdx].label
        })
      })
    })

    return { grid, maxCount, sortedCells: allCells.sort((a, b) => b.count - a.count) }
  }, [rawData])

  if (error) return <div className="text-red-500 text-sm">Gagal memuat analisis stok.</div>

  if (isLoading || !response) {
    return <div className="animate-pulse h-[260px] rounded w-full" style={{ backgroundColor: 'var(--color-surface-dim)' }}></div>
  }
  
  if (rawData.length === 0) return <div className="p-8 rounded-[12px] border border-[var(--color-hairline)]" style={{ backgroundColor: 'var(--color-surface-card)' }}>Data tidak tersedia</div>

  const { grid, maxCount, sortedCells } = heatmapData

  // Identify top insights
  const insights = sortedCells.filter(c => c.count > 0).slice(0, 3)

  return (
    <div className="p-6 md:p-8 rounded-[12px] border border-[var(--color-hairline)] flex flex-col" style={{ backgroundColor: 'var(--color-surface-card)' }}>
      <h3 className="text-[18px] font-medium mb-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>Peta Pergerakan Stok Barang</h3>
      
      {/* Insights Panel */}
      <div className="mb-6 flex flex-col gap-1 text-sm">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: insight.zone.color }}></span>
            <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{insight.count} barang</span>
            <span style={{ color: 'var(--color-muted)' }}>stok {insight.stockLabel} dengan penjualan {insight.salesLabel} ({insight.zone.label})</span>
          </div>
        ))}
      </div>
      
      <div className="flex-1 w-full min-h-[260px] flex">
        {/* Y-axis Labels */}
        <div className="flex flex-col justify-around pr-4 text-xs font-medium text-right shrink-0" style={{ color: 'var(--color-muted-soft)' }}>
          {stockBins.map(b => (
            <div key={b.id} className="flex items-center justify-end h-full">
              {b.label}
            </div>
          ))}
          <div className="h-6" /> {/* Spacer for X-axis */}
        </div>

        <div className="flex-1 flex flex-col">
          {/* Grid */}
          <div className="flex-1 grid grid-cols-4 grid-rows-5 gap-1 md:gap-2">
            {grid.map((row, rIdx) => 
              row.map((cell, cIdx) => {
                const zone = getZone(rIdx, cIdx)
                const isBright = zone.color === 'var(--color-warning)' || zone.color === 'transparent' || cell.count === 0
                return (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    className="rounded flex flex-col items-center justify-center text-sm transition-all hover:ring-2 ring-black/20 cursor-pointer group relative overflow-hidden"
                    style={{ 
                      backgroundColor: cell.count > 0 ? zone.color : 'transparent',
                      border: cell.count === 0 ? '1px dashed var(--color-hairline)' : 'none',
                      color: isBright ? 'var(--color-ink)' : 'white'
                    }}
                  >
                    {cell.count > 0 && (
                      <>
                        <span className="font-semibold text-lg">{cell.count}</span>
                        <span className="text-[10px] leading-tight text-center px-1 opacity-90 hidden md:block">{zone.label}</span>
                      </>
                    )}
                  
                  {/* Tooltip */}
                  {cell.count > 0 && (
                    <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[var(--color-surface-dark)] text-white p-3 rounded shadow-lg transition-opacity">
                      <div className="text-xs mb-1 text-[var(--color-on-dark-soft)]">Stok: {stockBins[rIdx].label} | Jual: {salesBins[cIdx].label}</div>
                      <div className="font-medium mb-1" style={{ color: zone.color }}>{zone.label}</div>
                      <div className="font-medium text-sm mb-2">{cell.count} Produk</div>
                      <div className="text-xs flex flex-col gap-1 max-h-32 overflow-hidden">
                        {cell.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="truncate">{item.nama}</div>
                        ))}
                        {cell.items.length > 3 && <div className="text-[var(--color-on-dark-soft)]">+{cell.items.length - 3} lainnya</div>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>
          
          {/* X-axis Labels */}
          <div className="grid grid-cols-4 gap-1 md:gap-2 pt-3 text-xs font-medium text-center" style={{ color: 'var(--color-muted-soft)' }}>
            {salesBins.map(b => (
              <div key={b.id}>{b.label}</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend / Axis Titles */}
      <div className="mt-4 flex justify-between items-center text-xs" style={{ color: 'var(--color-muted)' }}>
        <div>Sumbu Y: Stok Tersisa</div>
        <div>Sumbu X: Laju Penjualan</div>
      </div>
    </div>
  )
}
