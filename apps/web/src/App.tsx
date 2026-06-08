import { useState } from 'react'
import type { FormEvent } from 'react'
import './index.css'
import { signupAndProvision } from './lib/api'
import { tokens } from './tokens'

type AppState = 'signup' | 'key_revealed'

const SMITHERY_CMD = 'npx @smithery/cli install advaitgore/payguard --client claude'

export default function App() {
  const [appState, setAppState] = useState<AppState>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<'key' | 'cmd' | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setError('Email and password are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const result = await signupAndProvision({ email: normalizedEmail, password })
      setApiKey(result.api_key)
      setAppState('key_revealed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const copy = (text: string, which: 'key' | 'cmd') => {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

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
    maxWidth: '420px',
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

  const copyBtnStyle = (which: 'key' | 'cmd'): React.CSSProperties => ({
    padding: '6px 14px',
    backgroundColor: copied === which ? tokens.colors.surfaceAlt : 'transparent',
    border: `1px solid ${tokens.colors.border}`,
    color: copied === which ? tokens.colors.text.secondary : tokens.colors.accent,
    fontFamily: tokens.typography.fontFamily.body,
    fontSize: tokens.typography.fontSize.xs,
    letterSpacing: tokens.typography.letterSpacing.widest,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  })

  const monoBoxStyle: React.CSSProperties = {
    backgroundColor: tokens.colors.background,
    border: `1px solid ${tokens.colors.border}`,
    padding: '10px 12px',
    fontFamily: 'monospace',
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.accent,
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  }

  if (appState === 'key_revealed') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div>
            <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.title, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, margin: 0 }}>
              AgentPay
            </h1>
            <p style={{ ...labelStyle, marginTop: '6px', marginBottom: 0 }}>You&apos;re set up</p>
          </div>

          <div>
            <span style={labelStyle}>Your API key</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={monoBoxStyle}>{apiKey}</div>
              <button style={copyBtnStyle('key')} onClick={() => copy(apiKey, 'key')}>
                {copied === 'key' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: '8px 0 0' }}>
              Keep this safe. Paste it as <code style={{ color: tokens.colors.text.secondary }}>AGENTPAY_API_KEY</code> when Smithery prompts you.
            </p>
          </div>

          <div>
            <span style={labelStyle}>Install via Smithery</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={monoBoxStyle}>{SMITHERY_CMD}</div>
              <button style={copyBtnStyle('cmd')} onClick={() => copy(SMITHERY_CMD, 'cmd')}>
                {copied === 'cmd' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: 0, lineHeight: 1.6 }}>
            After installing, ask your agent to set a mandate — e.g. <em>&ldquo;Set my spending limit to $50 per transaction, approved merchants: Amazon, Vercel.&rdquo;</em>
          </p>
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
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: '10px 12px', fontSize: tokens.typography.fontSize.xs }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} style={btnPrimaryStyle}>
          {submitting ? 'Setting up...' : 'Get API Key'}
        </button>

        <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, margin: 0, textAlign: 'center' }}>
          Takes 2 seconds. No credit card.
        </p>
      </form>
    </div>
  )
}
