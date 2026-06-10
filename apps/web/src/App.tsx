import React, { useState } from 'react'
import type { FormEvent, CSSProperties } from 'react'
import './index.css'
import { signupAndProvision, login } from './lib/api'
import type { AgentRead } from './types/api'
import { tokens } from './tokens'

type AppState = 'auth' | 'key_revealed'
type AuthMode = 'signup' | 'login'
type ClientTab = 'hermes' | 'openclaw' | 'claude' | 'custom'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const MCP_URL = 'https://agentpayment-production.up.railway.app/mcp'

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
  const [clientTab, setClientTab] = useState<ClientTab>('hermes')

  const apiKey = agents[0]?.api_key ?? null

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode)
    setError(null)
    setHint(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) { setError('Email and password are required.'); return }
    setSubmitting(true); setError(null); setHint(null)
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
      } else {
        const session = await login({ email: normalizedEmail, password })
        const agentList = await fetchMyAgents(session.access_token)
        setAgents(agentList)
      }
      setAppState('key_revealed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Something went wrong.')
      const isDuplicate = /already exists|duplicate|conflict|registered/i.test(msg) || msg.includes('409')
      if (authMode === 'signup' && isDuplicate) {
        setError('An account with that email already exists.')
        setHint('Switch to Sign In to continue.')
      } else { setError(msg) }
    } finally { setSubmitting(false) }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing.md,
    fontFamily: tokens.typography.fontFamily.body,
  }

  const cardStyle: CSSProperties = {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: tokens.colors.surface,
    border: `1px solid ${tokens.colors.border}`,
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  }

  const labelStyle: CSSProperties = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary,
    letterSpacing: tokens.typography.letterSpacing.widest,
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
    display: 'block',
  }

  const inputStyle: CSSProperties = {
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

  const btnPrimaryStyle: CSSProperties = {
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

  const monoBoxStyle: CSSProperties = {
    backgroundColor: tokens.colors.background,
    border: `1px solid ${tokens.colors.border}`,
    padding: '10px 12px',
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.accent,
    overflowX: 'auto',
    whiteSpace: 'pre',
    flex: 1,
    minWidth: 0,
    lineHeight: 1.6,
  }

  const copyBtnStyle = (key: string): CSSProperties => ({
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

  const tabStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    padding: '8px 0',
    background: 'none',
    border: 'none',
    borderBottom: active ? `2px solid ${tokens.colors.accent}` : '2px solid transparent',
    color: active ? tokens.colors.accent : tokens.colors.text.muted,
    fontFamily: tokens.typography.fontFamily.body,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.bold,
    letterSpacing: tokens.typography.letterSpacing.widest,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    marginBottom: '-1px',
  })

  const installCommands: Record<ClientTab, { label: string; natural: string; cmd: string | null; cmdKey: string }> = {
    hermes: {
      label: 'Hermes',
      natural: `"Install AgentPay MCP. My API key is ${apiKey ?? 'YOUR_API_KEY'}"`,
      cmd: `hermes mcp add agentpay \\\n  --url ${MCP_URL} \\\n  --header "x-api-key: ${apiKey ?? 'YOUR_API_KEY'}"`,
      cmdKey: 'hermes-cmd',
    },
    openclaw: {
      label: 'OpenClaw',
      natural: `"Install AgentPay MCP from github.com/advaitgore/agent_payment. API key: ${apiKey ?? 'YOUR_API_KEY'}"`,
      cmd: `openclaw mcp add agentpay \\\n  --url ${MCP_URL} \\\n  --header "x-api-key: ${apiKey ?? 'YOUR_API_KEY'}"`,
      cmdKey: 'openclaw-cmd',
    },
    claude: {
      label: 'Claude / Cursor',
      natural: '',
      cmd: `npx @smithery/cli install advaitgore/payguard --client claude`,
      cmdKey: 'claude-cmd',
    },
    custom: {
      label: 'Custom agent',
      natural: '',
      cmd: `{\n  "agentpay": {\n    "type": "sse",\n    "url": "${MCP_URL}",\n    "headers": {\n      "x-api-key": "${apiKey ?? 'YOUR_API_KEY'}"\n    }\n  }\n}`,
      cmdKey: 'custom-cmd',
    },
  }

  if (appState === 'key_revealed') {
    const client = installCommands[clientTab]
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div>
            <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.title, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, margin: 0 }}>
              AgentPay
            </h1>
            <p style={{ ...labelStyle, marginTop: '6px', marginBottom: 0 }}>Ready to install</p>
          </div>

          <div>
            <span style={labelStyle}>{agents.length === 1 ? 'Your API key' : `API keys (${agents.length})`}</span>
            {agents.map((agent) => (
              <div key={agent.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: agents.length > 1 ? '10px' : 0 }}>
                {agents.length > 1 && (
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.secondary, fontWeight: tokens.typography.fontWeight.bold }}>{agent.name}</span>
                )}
                {agent.api_key ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={monoBoxStyle}>{agent.api_key}</div>
                    <button style={copyBtnStyle(agent.id)} onClick={() => copy(agent.api_key!, agent.id)}>
                      {copied === agent.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: 0 }}>Key not visible — rotate from dashboard.</p>
                )}
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${tokens.colors.border}` }} />

          <div>
            <span style={labelStyle}>Install into your agent</span>
            <div style={{ display: 'flex', borderBottom: `1px solid ${tokens.colors.border}`, marginBottom: '16px' }}>
              {(['hermes', 'openclaw', 'claude', 'custom'] as ClientTab[]).map((tab) => (
                <button key={tab} type="button" onClick={() => setClientTab(tab)} style={tabStyle(clientTab === tab)}>
                  {installCommands[tab].label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {client.natural && (
                <div>
                  <span style={{ ...labelStyle, marginBottom: '8px' }}>Option A — just tell your agent</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ ...monoBoxStyle, color: tokens.colors.text.secondary, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{client.natural}</div>
                    <button style={copyBtnStyle(`${clientTab}-natural`)} onClick={() => copy(client.natural, `${clientTab}-natural`)}>
                      {copied === `${clientTab}-natural` ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: '8px 0 0', lineHeight: 1.6 }}>
                    The agent will add AgentPay to its MCP config automatically.
                  </p>
                </div>
              )}
              {client.cmd && (
                <div>
                  {client.natural && <span style={{ ...labelStyle, marginBottom: '8px' }}>Option B — terminal</span>}
                  {clientTab === 'custom' && <span style={{ ...labelStyle, marginBottom: '8px' }}>Add to your MCP config</span>}
                  {clientTab === 'claude' && <span style={{ ...labelStyle, marginBottom: '8px' }}>Run in terminal — prompts for your API key</span>}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ ...monoBoxStyle, whiteSpace: 'pre-wrap' }}>{client.cmd}</div>
                    <button style={copyBtnStyle(client.cmdKey)} onClick={() => copy(client.cmd!, client.cmdKey)}>
                      {copied === client.cmdKey ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  {clientTab === 'hermes' && (
                    <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: '8px 0 0', lineHeight: 1.6 }}>
                      Then type <code style={{ color: tokens.colors.accent }}>/reload-mcp</code> in the Hermes chat.
                    </p>
                  )}
                </div>
              )}
              <div style={{ borderTop: `1px solid ${tokens.colors.border}`, paddingTop: '12px' }}>
                <span style={labelStyle}>Then set your mandate</span>
                <div style={{ ...monoBoxStyle, color: tokens.colors.text.secondary, whiteSpace: 'pre-wrap' }}>
                  {`"Set my spending limit to $50 per transaction.\nApproved merchants: Amazon, Vercel, GitHub."`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <div>
          <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.title, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, margin: 0 }}>
            AgentPay
          </h1>
          <p style={{ ...labelStyle, marginTop: '6px', marginBottom: 0 }}>Spending controls for AI agents</p>
        </div>

        <div style={{ display: 'flex', borderBottom: `1px solid ${tokens.colors.border}` }}>
          {(['signup', 'login'] as AuthMode[]).map((mode) => (
            <button key={mode} type="button" onClick={() => switchMode(mode)} style={{
              flex: 1, padding: `${tokens.spacing.sm} 0`, background: 'none', border: 'none',
              borderBottom: authMode === mode ? `2px solid ${tokens.colors.accent}` : '2px solid transparent',
              color: authMode === mode ? tokens.colors.accent : tokens.colors.text.muted,
              fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.widest,
              textTransform: 'uppercase' as const, cursor: 'pointer', marginBottom: '-1px',
            }}>
              {mode === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          ))}
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle} autoComplete="email" />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" style={inputStyle} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} />
        </div>

        {error && (
          <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: '10px 12px', fontSize: tokens.typography.fontSize.xs }}>
            {error}
            {hint && (
              <span onClick={() => switchMode('login')} style={{ marginLeft: '6px', color: tokens.colors.accent, cursor: 'pointer', textDecoration: 'underline' }}>
                {hint}
              </span>
            )}
          </div>
        )}

        <button type="submit" disabled={submitting} style={btnPrimaryStyle}>
          {submitting ? (authMode === 'signup' ? 'Setting up...' : 'Signing in...') : (authMode === 'signup' ? 'Get API Key' : 'Sign In')}
        </button>

        {authMode === 'signup' && (
          <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: 0, textAlign: 'center' }}>Takes 2 seconds. No credit card.</p>
        )}
      </form>
    </div>
  )
}
