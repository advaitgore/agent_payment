import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './index.css'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import DashboardPage from './pages/DashboardPage'
import AgentsPage from './pages/AgentsPage'
import SimulatorPage from './pages/SimulatorPage'
import AuditLogPage from './pages/AuditLogPage'
import SetupPage from './pages/SetupPage'
import SettingsPage from './pages/SettingsPage'
import { getMe, login, logout, signup } from './lib/api'
import type { UserRead } from './types/api'

export type Page = 'dashboard' | 'setup' | 'simulator' | 'agents' | 'audit' | 'settings'

type AuthMode = 'login' | 'signup'
type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [user, setUser] = useState<UserRead | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getMe()
      .then((me) => {
        setUser(me)
        setAuthState('authenticated')
      })
      .catch(() => {
        setAuthState('unauthenticated')
      })
  }, [])

  const pageMap: Record<Page, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Authorization Console', subtitle: 'Overview' },
    setup: { title: 'Authorization Console', subtitle: 'Setup' },
    simulator: { title: 'Authorization Console', subtitle: 'Simulator' },
    agents: { title: 'Authorization Console', subtitle: 'Agents' },
    audit: { title: 'Authorization Console', subtitle: 'Audit Log' },
    settings: { title: 'Authorization Console', subtitle: 'Settings' },
  }

  const nav = (page: Page) => setCurrentPage(page)

  const handleAuthSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setAuthError('Email and password are required.')
      return
    }
    setSubmitting(true)
    setAuthError(null)
    try {
      const session = authMode === 'signup'
        ? await signup({ email: normalizedEmail, password })
        : await login({ email: normalizedEmail, password })
      setUser(session.user)
      setAuthState('authenticated')
      setPassword('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout().catch(() => undefined)
    setUser(null)
    setAuthState('unauthenticated')
    setPassword('')
  }

  if (authState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#080808', color: '#e5e2e1', fontFamily: 'Space Grotesk' }}>
        Loading session...
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#080808', padding: '16px' }}>
        <form onSubmit={handleAuthSubmit} style={{ width: '100%', maxWidth: '380px', backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1 style={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            AgentPay access
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{ width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'Space Grotesk', fontSize: '12px', padding: '10px 12px', outline: 'none' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'Space Grotesk', fontSize: '12px', padding: '10px 12px', outline: 'none' }}
          />
          {authError && (
            <div style={{ backgroundColor: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.25)', color: '#ffb4ab', padding: '10px 12px', fontFamily: 'Space Grotesk', fontSize: '11px' }}>
              {authError}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '9px 16px', backgroundColor: submitting ? '#1A1A1A' : '#C08532', color: submitting ? '#555' : '#000', border: 'none', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Please wait...' : authMode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: '#C08532', fontFamily: 'Space Grotesk', fontSize: '11px', cursor: 'pointer', padding: 0 }}
          >
            {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080808' }}>
      <Sidebar currentPage={currentPage} onNavigate={nav} />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={pageMap[currentPage].title} subtitle={pageMap[currentPage].subtitle} />
        <div style={{ position: 'fixed', top: '14px', right: '24px', zIndex: 60, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#9e8e7e', fontFamily: 'Space Grotesk', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{ padding: '6px 10px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#e5e2e1', fontFamily: 'Space Grotesk', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
        <main style={{ marginTop: '56px', padding: '12px', minHeight: 'calc(100vh - 56px)' }}>
          {currentPage === 'dashboard' && <DashboardPage onNavigate={nav} />}
          {currentPage === 'setup' && <SetupPage onNavigate={nav} />}
          {currentPage === 'simulator' && <SimulatorPage onNavigate={nav} />}
          {currentPage === 'agents' && <AgentsPage onNavigate={nav} />}
          {currentPage === 'audit' && <AuditLogPage onNavigate={nav} />}
          {currentPage === 'settings' && <SettingsPage onNavigate={nav} />}
        </main>
      </div>
    </div>
  )
}
