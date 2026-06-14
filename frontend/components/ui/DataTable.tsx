'use client'

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  hidePagination?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 5,
  hidePagination = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: { pageSize }
    }
  })

  return (
    <div className="w-full relative">
      <div 
        className="rounded-lg border overflow-x-auto overflow-y-hidden"
        style={{ borderColor: 'var(--color-hairline)' }}
      >
        <table className="w-full text-sm text-left">
          <thead style={{ backgroundColor: 'var(--color-surface-cream-strong)' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  const isFirst = index === 0;
                  return (
                    <th
                      key={header.id}
                      className={clsx(
                        "px-4 py-3 font-medium whitespace-nowrap cursor-pointer select-none",
                        isFirst && "sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                      )}
                      style={{ 
                        color: 'var(--color-body-strong)',
                        borderBottom: '1px solid var(--color-hairline-soft)',
                        backgroundColor: isFirst ? 'var(--color-surface-cream-strong)' : 'transparent',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: <ChevronUp size={14} />,
                          desc: <ChevronDown size={14} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody style={{ backgroundColor: 'var(--color-surface-card)' }}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-black/5 group"
                  style={{ borderBottom: '1px solid var(--color-hairline-soft)' }}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const isFirst = index === 0;
                    return (
                      <td
                        key={cell.id}
                        className={clsx(
                          "px-4 py-3 whitespace-nowrap",
                          isFirst && "sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-[#f6f3eb]"
                        )}
                        style={{ 
                          color: 'var(--color-body)',
                          backgroundColor: isFirst ? 'var(--color-surface-card)' : 'transparent',
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!hidePagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <button
            className="p-2 w-10 h-10 flex items-center justify-center rounded border disabled:opacity-50"
            style={{ 
              borderColor: 'var(--color-hairline)',
              color: 'var(--color-body)'
            }}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount() || 1}
          </span>
          <button
            className="p-2 w-10 h-10 flex items-center justify-center rounded border disabled:opacity-50"
            style={{ 
              borderColor: 'var(--color-hairline)',
              color: 'var(--color-body)'
            }}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
