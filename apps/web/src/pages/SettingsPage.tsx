import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Page } from '../App'
import { clearStoredSessionData, getStoredApiBaseUrl, setStoredApiBaseUrl } from '../lib/storage'
import { tokens } from '../tokens'

interface Props {
  onNavigate: (page: Page) => void
}

const S: Record<string, CSSProperties> = {
  page: { maxWidth: '860px', margin: '0 auto', padding: `${tokens.spacing.md} 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md },
  header: { borderBottom: `1px solid ${tokens.colors.border}`, paddingBottom: tokens.spacing.lg },
  h1: { fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.display, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, letterSpacing: tokens.typography.letterSpacing.tight },
  sub: { fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.tertiary, letterSpacing: tokens.typography.letterSpacing.wide, marginTop: tokens.spacing.sm, textTransform: 'uppercase' },
  card: { backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: tokens.spacing.xl, display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg },
  cardTitle: { fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider, borderBottom: `1px solid rgba(255,255,255,0.06)`, paddingBottom: '10px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, color: tokens.colors.text.secondary },
  desc: { fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.muted, marginTop: '2px' },
  input: { width: '100%', backgroundColor: tokens.colors.background, border: `1px solid rgba(255,255,255,0.15)`, color: tokens.colors.text.primary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.lg, padding: '9px 12px', outline: 'none' },
  btn: { padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`, backgroundColor: tokens.colors.accent, color: '#000', border: 'none', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.wider, textTransform: 'uppercase', cursor: 'pointer', borderRadius: tokens.radius.sm },
  btnDanger: { padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`, backgroundColor: 'transparent', color: tokens.colors.error, border: `1px solid rgba(255,180,171,0.3)`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.wider, textTransform: 'uppercase', cursor: 'pointer', borderRadius: tokens.radius.sm },
}

export default function SettingsPage({ onNavigate: _onNavigate }: Props) {
  const [baseUrl, setBaseUrl] = useState(getStoredApiBaseUrl() ?? (import.meta.env.VITE_API_URL || 'http://localhost:8000'))
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSave = () => {
    const normalized = baseUrl.trim()
    if (!normalized) {
      setErrorMessage('Base URL cannot be empty.')
      setStatusMessage(null)
      return
    }
    setStoredApiBaseUrl(normalized)
    setStatusMessage('Settings saved.')
    setErrorMessage(null)
  }

  const handleReset = () => {
    clearStoredSessionData()
    window.location.reload()
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.h1}>Settings</h1>
        <p style={S.sub}>Global configuration · preferences</p>
      </div>

      {/* API Config */}
      <div style={S.card}>
        <div style={S.cardTitle}>API Configuration</div>
        <div>
          <label style={{ ...S.label, display: 'block', marginBottom: tokens.spacing.sm }}>Base URL</label>
          <input
            style={S.input}
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            onFocus={e => { e.currentTarget.style.borderColor = tokens.colors.accent }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          />
          <p style={{ ...S.desc, marginTop: tokens.spacing.sm }}>Set VITE_API_URL in your .env or override it here for this browser.</p>
        </div>
        <div style={S.row}>
          <button style={S.btn} onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...S.card, borderColor: 'rgba(255,180,171,0.15)' }}>
        <div style={{ ...S.cardTitle, color: tokens.colors.error, borderBottomColor: 'rgba(255,180,171,0.1)' }}>Danger Zone</div>
        <div style={S.row}>
          <div>
            <div style={S.label}>Reset session data</div>
            <div style={S.desc}>Clears stored org, agent, and mandate IDs from this browser session.</div>
          </div>
          <button style={S.btnDanger} onClick={handleReset}>Reset</button>
        </div>
      </div>
      {statusMessage && (
        <div style={{ backgroundColor: tokens.colors.successBg, border: `1px solid ${tokens.colors.successBorder}`, color: tokens.colors.success, padding: `10px ${tokens.spacing.md}`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, letterSpacing: tokens.typography.letterSpacing.wide }}>
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: `10px ${tokens.spacing.md}`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, letterSpacing: tokens.typography.letterSpacing.wide }}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}
