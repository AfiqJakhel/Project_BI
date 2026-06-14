import React from 'react'

export interface KPICardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  prefix?: string
}

export function KPICard({ label, value, change, changeLabel, icon, prefix }: KPICardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div 
      className="flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--rounded-lg)',
        padding: 'var(--spacing-xl)',
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 
          className="uppercase font-medium"
          style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: '12px', 
            color: 'var(--color-muted)', 
            letterSpacing: '1.5px' 
          }}
        >
          {label}
        </h3>
        {icon && <div style={{ color: 'var(--color-muted-soft)' }}>{icon}</div>}
      </div>

      <div className="flex items-end gap-3">
        <div 
          style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '36px', 
            color: 'var(--color-ink)', 
            letterSpacing: '-0.5px',
            lineHeight: 1
          }}
        >
          {prefix && <span className="text-2xl mr-1">{prefix}</span>}
          {value}
        </div>
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span 
            className="px-2 py-0.5 text-xs font-medium inline-flex items-center"
            style={{
              backgroundColor: isPositive ? 'rgba(93, 184, 114, 0.15)' : isNegative ? 'rgba(198, 69, 69, 0.15)' : 'var(--color-surface-soft)',
              color: isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-error)' : 'var(--color-muted)',
              borderRadius: 'var(--rounded-pill)'
            }}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
          {changeLabel && (
            <span className="text-xs" style={{ color: 'var(--color-muted-soft)' }}>
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
