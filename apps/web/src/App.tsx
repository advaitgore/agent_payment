import { useState } from 'react'
import './index.css'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import DashboardPage from './pages/DashboardPage'
import AgentsPage from './pages/AgentsPage'
import SimulatorPage from './pages/SimulatorPage'
import AuditLogPage from './pages/AuditLogPage'
import SetupPage from './pages/SetupPage'
import SettingsPage from './pages/SettingsPage'

export type Page = 'dashboard' | 'setup' | 'simulator' | 'agents' | 'audit' | 'settings'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const pageMap: Record<Page, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Authorization Console', subtitle: 'Overview' },
    setup: { title: 'Authorization Console', subtitle: 'Setup' },
    simulator: { title: 'Authorization Console', subtitle: 'Simulator' },
    agents: { title: 'Authorization Console', subtitle: 'Agents' },
    audit: { title: 'Authorization Console', subtitle: 'Audit Log' },
    settings: { title: 'Authorization Console', subtitle: 'Settings' },
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080808' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={pageMap[currentPage].title} subtitle={pageMap[currentPage].subtitle} />
        <main style={{ marginTop: '56px', padding: '12px', minHeight: 'calc(100vh - 56px)' }}>
          {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
          {currentPage === 'setup' && <SetupPage onNavigate={setCurrentPage} />}
          {currentPage === 'simulator' && <SimulatorPage onNavigate={setCurrentPage} />}
          {currentPage === 'agents' && <AgentsPage onNavigate={setCurrentPage} />}
          {currentPage === 'audit' && <AuditLogPage onNavigate={setCurrentPage} />}
          {currentPage === 'settings' && <SettingsPage onNavigate={setCurrentPage} />}
        </main>
      </div>
    </div>
  )
}
