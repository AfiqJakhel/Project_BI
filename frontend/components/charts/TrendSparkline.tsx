'use client'

import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export interface TrendSparklineProps {
  data: number[]
  color?: string
  width?: number | string
  height?: number | string
}

export function TrendSparkline({ 
  data, 
  color = 'var(--color-primary)', 
  width = '100%', 
  height = 40 
}: TrendSparklineProps) {
  const chartData = data.map((val, i) => ({ value: val, index: i }))

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
