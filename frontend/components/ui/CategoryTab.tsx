import React from 'react'

export interface CategoryTabProps {
  tabs: string[]
  activeTab: string
  onChange: (tab: string) => void
}

export function CategoryTab({ tabs, activeTab, onChange }: CategoryTabProps) {
  return (
    <div 
      className="inline-flex items-center p-1 rounded-md"
      style={{ 
        backgroundColor: 'var(--color-surface-soft)',
        border: '1px solid var(--color-hairline-soft)'
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className="px-4 py-1.5 text-sm font-medium rounded transition-all"
            style={{
              backgroundColor: isActive ? 'var(--color-canvas)' : 'transparent',
              color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
              boxShadow: isActive ? '0 1px 3px rgba(20,20,19,0.08)' : 'none'
            }}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
