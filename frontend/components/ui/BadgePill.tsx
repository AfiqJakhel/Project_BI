import React from 'react'

type BadgeType = 'default' | 'success' | 'warning' | 'error'

export function BadgePill({ children, type = 'default', title }: { children: React.ReactNode, type?: BadgeType, title?: string }) {
  let bgColor = 'var(--color-surface-soft)'
  let color = 'var(--color-body)'

  if (type === 'success') {
    bgColor = 'rgba(93, 184, 114, 0.15)'
    color = 'var(--color-success)'
  } else if (type === 'warning') {
    bgColor = 'rgba(212, 160, 23, 0.15)'
    color = 'var(--color-warning)'
  } else if (type === 'error') {
    bgColor = 'rgba(198, 69, 69, 0.15)'
    color = 'var(--color-error)'
  }

  return (
    <span 
      title={title}
      className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: bgColor,
        color: color,
        borderRadius: 'var(--rounded-pill)',
        cursor: title ? 'help' : 'default'
      }}
    >
      {children}
    </span>
  )
}
