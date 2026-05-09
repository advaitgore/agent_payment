import type { ReactNode } from 'react'

// Legacy shell — kept as a passthrough so old imports don't break.
export default function AppShell({ children }: { children?: ReactNode }) {
  return <>{children}</>
}
