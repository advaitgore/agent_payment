import { useState } from 'react'
import type { FormEvent } from 'react'
import './index.css'
import { signupAndProvision, login } from './lib/api'
import type { AgentRead } from './types/api'
import { tokens } from './tokens'

type AppState = 'auth' | 'key_revealed'
type AuthMode = 'signup' | 'login'

export type Page = 'dashboard' | 'agents' | 'agent-detail' | 'audit-log' | 'settings' | 'setup'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const SMITHERY_CMD = 'npx @smithery/cli install advaitgore/payguard --client claude'

const NEXT_STEPS = [
  {
    step: '1',
    title: 'Install into your agent',
    detail: 'Run this in your terminal. When prompted, paste the API key above. Works with Claude, Cursor, Windsurf, and any MCP-compatible agent.',
    code: SMITHERY_CMD,
    codeKey: 'cmd' as const,
  },
  {
    step: '2',
    title: 'Give your agent a spending mandate',
    detail: 'Tell your agent: "Set my spending limit to $50 per transaction, approved merchants: Amazon, Vercel." It will call AgentPay to store the rules.',
    code: null,
    codeKey: null,
  },
  {
    step: '3',
    title: 'Let it run',
    detail: 'Your agent now evaluates every purchase attempt against the mandate in real time — no babysitting required. Anything outside the rules is blocked and logged.',
    code: null,
    codeKey: null,
  },
]

async function fetchMyAgents(token: string): Promise<AgentRead[]> {
  const resp = await fetch(`${API_BASE}/auth/me/agents`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })
  if (!resp.ok) return []
  return resp.json()
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('auth')
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agents, setAgents] = useState<AgentRead[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode)
    setError(null)
    setHint(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setError('Email and password are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    setHint(null)
    try {
      if (authMode === 'signup') {
        const result = await signupAndProvision({ email: normalizedEmail, password })
        const session = await login({ email: normalizedEmail, password })
        const agentList = await fetchMyAgents(session.access_token)
        setAgents(
          agentList.length > 0
            ? agentList
            : [{ id: result.agent_id, org_id: result.org_id, name: 'default', api_key: result.api_key, created_at: '' }]
        )
        setAppState('key_revealed')
      } else {
        const session = await login({ email: normalizedEmail, password })
        const agentList = await fetchMyAgents(session.access_token)
        setAgents(agentList)
        setAppState('key_revealed')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Something went wrong.')
      const isDuplicate = /already exists|duplicate|conflict|registered/i.test(msg) || msg.includes('409')
      if (authMode === 'signup' && isDuplicate) {
        setError('An account with that email already exists.')
        setHint('Switch to Sign In to continue.')
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // ─── Styles ───────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing.md,
    fontFamily: tokens.typography.fontFamily.body,
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: tokens.colors.surface,
    border: `1px solid ${tokens.colors.border}`,
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary,
    letterSpacing: tokens.typography.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: tokens.colors.background,
    border: `1px solid rgba(255,255,255,0.15)`,
    color: tokens.colors.text.primary,
    fontFamily: tokens.typography.fontFamily.body,
    fontSize: tokens.typography.fontSize.sm,
    padding: '10px 12px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const btnPrimaryStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 16px',
    backgroundColor: submitting ? tokens.colors.surfaceAlt : tokens.colors.accent,
    color: submitting ? '#555' : '#000',
    border: 'none',
    fontFamily: tokens.typography.fontFamily.body,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.bold,
    letterSpacing: tokens.typography.letterSpacing.widest,
    textTransform: 'uppercase' as const,
    cursor: submitting ? 'not-allowed' : 'pointer',
  }

  const monoBoxStyle: React.CSSProperties = {
    backgroundColor: tokens.colors.background,
    border: `1px solid ${tokens.colors.border}`,
    padding: '10px 12px',
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.accent,
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  }

  const copyBtnStyle = (key: string): React.CSSProperties => ({
    padding: '6px 14px',
    backgroundColor: copied === key ? tokens.colors.surfaceAlt : 'transparent',
    border: `1px solid ${tokens.colors.border}`,
    color: copied === key ? tokens.colors.text.secondary : tokens.colors.accent,
    fontFamily: tokens.typography.fontFamily.body,
    fontSize: tokens.typography.fontSize.xs,
    letterSpacing: tokens.typography.letterSpacing.widest,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  })

  // ─── Key Revealed Screen ──────────────────────────────────────────────────

  if (appState === 'key_revealed') {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, maxWidth: '520px' }}>

          {/* Header */}
          <div>
            <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.title, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, margin: 0 }}>
              AgentPay
            </h1>
            <p style={{ ...labelStyle, marginTop: '6px', marginBottom: 0 }}>Ready to install</p>
          </div>

          {/* Agent API Keys */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={labelStyle}>
              {agents.length === 1 ? 'Agent API key' : agents.length > 1 ? `Agent API keys (${agents.length})` : 'Agent API key'}
            </span>

            {agents.length === 0 && (
              <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: 0 }}>
                Signed in. Your API key was issued at signup — paste it when Smithery prompts you, or rotate it from agent settings.
              </p>
            )}

            {agents.map((agent) => (
              <div key={agent.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {agents.length > 1 && (
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.secondary, fontWeight: tokens.typography.fontWeight.bold }}>
                    {agent.name}
                  </span>
                )}
                {agent.api_key ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={monoBoxStyle}>{agent.api_key}</div>
                    <button style={copyBtnStyle(agent.id)} onClick={() => copy(agent.api_key!, agent.id)}>
                      {copied === agent.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: 0 }}>
                    Key not visible — rotate it from the dashboard.
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${tokens.colors.border}` }} />

          {/* Next Steps */}
          <div>
            <span style={labelStyle}>Set up your agent</span>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {NEXT_STEPS.map((s) => (
                <li key={s.step} style={{ display: 'flex', gap: '12px' }}>
                  <span style={{
                    flexShrink: 0,
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: '50%',
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.text.tertiary,
                    lineHeight: 1,
                    marginTop: '1px',
                  }}>
                    {s.step}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.primary, fontWeight: tokens.typography.fontWeight.bold }}>
                      {s.title}
                    </span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, lineHeight: 1.6 }}>
                      {s.detail}
                    </span>
                    {s.code && s.codeKey && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                        <div style={monoBoxStyle}>{s.code}</div>
                        <button style={copyBtnStyle(s.codeKey)} onClick={() => copy(s.code!, s.codeKey!)}>
                          {copied === s.codeKey ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    )
  }

  // ─── Auth Screen ──────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <div>
          <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.title, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, margin: 0 }}>
            AgentPay
          </h1>
          <p style={{ ...labelStyle, marginTop: '6px', marginBottom: 0 }}>Spending controls for AI agents</p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${tokens.colors.border}` }}>
          {(['signup', 'login'] as AuthMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchMode(mode)}
              style={{
                flex: 1,
                padding: `${tokens.spacing.sm} 0`,
                background: 'none',
                border: 'none',
                borderBottom: authMode === mode ? `2px solid ${tokens.colors.accent}` : '2px solid transparent',
                color: authMode === mode ? tokens.colors.accent : tokens.colors.text.muted,
                fontFamily: tokens.typography.fontFamily.body,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
                letterSpacing: tokens.typography.letterSpacing.widest,
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {mode === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          ))}
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={inputStyle}
            autoComplete="email"
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            style={inputStyle}
            autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>

        {error && (
          <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: '10px 12px', fontSize: tokens.typography.fontSize.xs }}>
            {error}
            {hint && (
              <span
                onClick={() => switchMode('login')}
                style={{ marginLeft: '6px', color: tokens.colors.accent, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {hint}
              </span>
            )}
          </div>
        )}

        <button type="submit" disabled={submitting} style={btnPrimaryStyle}>
          {submitting
            ? (authMode === 'signup' ? 'Setting up...' : 'Signing in...')
            : (authMode === 'signup' ? 'Get API Key' : 'Sign In')}
        </button>

        {authMode === 'signup' && (
          <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: 0, textAlign: 'center' }}>
            Takes 2 seconds. No credit card.
          </p>
        )}
      </form>
    </div>
  )
}
