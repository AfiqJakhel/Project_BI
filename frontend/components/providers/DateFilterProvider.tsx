'use client'

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'

export type DateRange = {
  from?: Date
  to?: Date
}

type DateFilterContextType = {
  year: string
  month: string
  setYear: (y: string) => void
  setMonth: (m: string) => void
  dateRange: DateRange
  dateParams: string // For easy appending to API endpoints: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState<string>('')
  const [month, setMonth] = useState<string>('')

  const dateRange = useMemo<DateRange>(() => {
    if (!year) return {}
    const y = parseInt(year)
    if (!month) {
      return {
        from: new Date(y, 0, 1),
        to: new Date(y, 11, 31)
      }
    }
    const m = parseInt(month) - 1 // JS months are 0-11
    return {
      from: new Date(y, m, 1),
      to: new Date(y, m + 1, 0) // last day of the month
    }
  }, [year, month])

  // Format date correctly to local YYYY-MM-DD to avoid timezone shift
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  let dateParams = ''
  if (dateRange.from && dateRange.to) {
    dateParams = `?start_date=${formatDate(dateRange.from)}&end_date=${formatDate(dateRange.to)}`
  } else if (dateRange.from) {
    dateParams = `?start_date=${formatDate(dateRange.from)}`
  } else if (dateRange.to) {
    dateParams = `?end_date=${formatDate(dateRange.to)}`
  }

  return (
    <DateFilterContext.Provider value={{ year, month, setYear, setMonth, dateRange, dateParams }}>
      {children}
    </DateFilterContext.Provider>
  )
}

export function useDateFilter() {
  const context = useContext(DateFilterContext)
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider')
  }
  return context
}
