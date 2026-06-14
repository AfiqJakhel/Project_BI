import React from 'react'

export function BadgeCoral({ children, title }: { children: React.ReactNode, title?: string }) {
  return (
    <span 
      title={title}
      className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: 'rgba(204, 120, 92, 0.15)', // primary with opacity
        color: 'var(--color-primary)',
        borderRadius: 'var(--rounded-pill)',
        cursor: title ? 'help' : 'default'
      }}
    >
      {children}
    </span>
  )
}
