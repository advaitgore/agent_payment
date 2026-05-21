import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './index.css'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import DashboardPage from './pages/DashboardPage'
import AgentsPage from './pages/AgentsPage'
import AuditLogPage from './pages/AuditLogPage'
import SetupPage from './pages/SetupPage'
import SettingsPage from './pages/SettingsPage'
import { getMe, login, logout, signup } from './lib/api'
import type { UserRead } from './types/api'
import { tokens } from './tokens'

export type Page = 'dashboard' | 'setup' | 'agents' | 'audit' | 'settings'

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
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: tokens.colors.background, color: tokens.colors.text.secondary, fontFamily: tokens.typography.fontFamily.body }}>
        Loading session...
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: tokens.colors.background, padding: tokens.spacing.md }}>
        <form onSubmit={handleAuthSubmit} style={{ width: '100%', maxWidth: '380px', backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.title, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, margin: 0 }}>
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: 0, letterSpacing: tokens.typography.letterSpacing.widest, textTransform: 'uppercase' }}>
            AgentPay access
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{ width: '100%', backgroundColor: tokens.colors.background, border: `1px solid rgba(255,255,255,0.15)`, color: tokens.colors.text.primary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, padding: '10px 12px', outline: 'none' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', backgroundColor: tokens.colors.background, border: `1px solid rgba(255,255,255,0.15)`, color: tokens.colors.text.primary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, padding: '10px 12px', outline: 'none' }}
          />
          {authError && (
            <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: '10px 12px', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs }}>
              {authError}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '9px 16px', backgroundColor: submitting ? tokens.colors.surfaceAlt : tokens.colors.accent, color: submitting ? '#555' : '#000', border: 'none', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.widest, textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Please wait...' : authMode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: tokens.colors.accent, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', padding: 0 }}
          >
            {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: tokens.colors.background }}>
      <Sidebar currentPage={currentPage} onNavigate={nav} />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={pageMap[currentPage].title} subtitle={pageMap[currentPage].subtitle} userEmail={user?.email} onLogout={handleLogout} />
        <main style={{ marginTop: '56px', padding: tokens.spacing.md, minHeight: 'calc(100vh - 56px)' }}>
          {currentPage === 'dashboard' && <DashboardPage onNavigate={nav} />}
          {currentPage === 'setup' && <SetupPage onNavigate={nav} />}
          {currentPage === 'agents' && <AgentsPage onNavigate={nav} />}
          {currentPage === 'audit' && <AuditLogPage onNavigate={nav} />}
          {currentPage === 'settings' && <SettingsPage onNavigate={nav} />}
        </main>
      </div>
    </div>
  )
}
