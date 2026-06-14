import { DashboardShell } from '@/components/layout/DashboardShell'
import { DateFilterProvider } from '@/components/providers/DateFilterProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DateFilterProvider>
      <DashboardShell>{children}</DashboardShell>
    </DateFilterProvider>
  )
}
