import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LineChart,
  TrendingUp,
  Package,
  Users,
  Settings,
  Menu,
  X,
  Truck
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/penjualan', label: 'Penjualan', icon: TrendingUp },
  { href: '/dashboard/produk', label: 'Produk', icon: Package },
  { href: '/dashboard/supplier', label: 'Supplier & Pengeluaran', icon: Truck },
]

export function Sidebar({ 
  collapsed, 
  setCollapsed, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: { 
  collapsed: boolean, 
  setCollapsed: (val: boolean) => void,
  mobileMenuOpen: boolean,
  setMobileMenuOpen: (val: boolean) => void
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 md:sticky top-0 h-screen flex flex-col transition-all duration-300',
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0',
          collapsed ? 'md:w-16' : 'md:w-60'
        )}
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <div className="flex items-center h-16 px-4 shrink-0 justify-between">
          <span 
            className={clsx(
              "text-2xl whitespace-nowrap transition-opacity duration-300",
              collapsed ? "md:opacity-0 md:hidden" : "opacity-100"
            )}
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-on-dark)' }}
          >
            Araw Film
          </span>
          
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-2 w-11 h-11 items-center justify-center rounded hover:bg-white/10"
            style={{ color: 'var(--color-on-dark-soft)' }}
          >
            <Menu size={20} />
          </button>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden flex p-2 w-11 h-11 items-center justify-center rounded hover:bg-white/10"
            style={{ color: 'var(--color-on-dark-soft)' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 min-h-[44px] rounded-md transition-colors',
                  isActive ? 'font-medium' : 'hover:bg-white/5'
                )}
                style={{
                  backgroundColor: isActive ? 'var(--color-surface-dark-elevated)' : 'transparent',
                  color: isActive ? 'var(--color-on-dark)' : 'var(--color-on-dark-soft)',
                  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className={isActive ? 'text-[var(--color-primary)] shrink-0' : 'shrink-0'} />
                <span className={clsx(
                  "whitespace-nowrap transition-opacity", 
                  collapsed ? "md:opacity-0 md:hidden" : "opacity-100"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 shrink-0 flex flex-col gap-4 mt-auto">
          <Link
            href="/dashboard/pengaturan"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 min-h-[44px] rounded-md hover:bg-white/5 transition-colors"
            style={{ color: 'var(--color-on-dark-soft)' }}
            title={collapsed ? 'Pengaturan' : undefined}
          >
            <Settings size={20} className="shrink-0" />
            <span className={clsx(
              "whitespace-nowrap transition-opacity", 
              collapsed ? "md:opacity-0 md:hidden" : "opacity-100"
            )}>
              Pengaturan
            </span>
          </Link>
          
          <div className={clsx(
            "text-xs transition-opacity",
            collapsed ? "md:opacity-0 md:hidden" : "opacity-100"
          )} style={{ color: 'var(--color-muted-soft)' }}>
            <p>v1.0.0-beta</p>
            <p>Afiq (Admin)</p>
          </div>
        </div>
      </div>
    </>
  )
}
