import type { CSSProperties } from 'react'
import type { Page } from '../App'

interface Props {
  onNavigate: (page: Page) => void
}

function toggleStyle(on: boolean): CSSProperties {
  return {
    width: '36px', height: '20px',
    backgroundColor: on ? '#C08532' : '#1A1A1A',
    border: `1px solid ${on ? '#C08532' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px', cursor: 'pointer',
    position: 'relative', transition: 'all 0.2s', display: 'inline-block',
  }
}

function toggleKnobStyle(on: boolean): CSSProperties {
  return {
    position: 'absolute', top: '2px',
    left: on ? '18px' : '2px',
    width: '14px', height: '14px',
    backgroundColor: '#fff', borderRadius: '50%',
    transition: 'left 0.2s',
  }
}

const S: Record<string, CSSProperties> = {
  page: { maxWidth: '860px', margin: '0 auto', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' },
  header: { borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' },
  h1: { fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' },
  sub: { fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373', letterSpacing: '0.04em', marginTop: '4px', textTransform: 'uppercase' },
  card: { backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  cardTitle: { fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: 'Space Grotesk', fontSize: '12px', color: '#e5e2e1' },
  desc: { fontFamily: 'Inter', fontSize: '11px', color: '#555', marginTop: '2px' },
  input: { width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'Space Grotesk', fontSize: '13px', padding: '9px 12px', outline: 'none' },
  btn: { padding: '8px 16px', backgroundColor: '#C08532', color: '#000', border: 'none', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' },
  btnDanger: { padding: '8px 16px', backgroundColor: 'transparent', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.3)', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' },
}

export default function SettingsPage({ onNavigate: _onNavigate }: Props) {
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
          <label style={{ ...S.label, display: 'block', marginBottom: '4px' }}>Base URL</label>
          <input
            style={S.input}
            defaultValue={import.meta.env.VITE_API_URL || 'http://localhost:8000'}
            onFocus={e => { e.currentTarget.style.borderColor = '#C08532' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          />
          <p style={{ ...S.desc, marginTop: '6px' }}>Set VITE_API_URL in your .env to change this.</p>
        </div>
        <div style={S.row}>
          <button style={S.btn}>Save</button>
        </div>
      </div>

      {/* Notifications */}
      <div style={S.card}>
        <div style={S.cardTitle}>Notifications</div>
        {[
          { label: 'Auth denied alerts', desc: 'Notify when a request is denied', on: true },
          { label: 'Daily spend summary', desc: 'Email summary of daily agent spend', on: false },
          { label: 'Key rotation reminders', desc: 'Alert 7 days before key expiry', on: true },
        ].map(item => (
          <div key={item.label} style={S.row}>
            <div>
              <div style={S.label}>{item.label}</div>
              <div style={S.desc}>{item.desc}</div>
            </div>
            <div style={toggleStyle(item.on)}>
              <div style={toggleKnobStyle(item.on)} />
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{ ...S.card, borderColor: 'rgba(255,180,171,0.15)' }}>
        <div style={{ ...S.cardTitle, color: '#ffb4ab', borderBottomColor: 'rgba(255,180,171,0.1)' }}>Danger Zone</div>
        <div style={S.row}>
          <div>
            <div style={S.label}>Reset session data</div>
            <div style={S.desc}>Clears stored org, agent, and mandate IDs from this browser session.</div>
          </div>
          <button style={S.btnDanger} onClick={() => { sessionStorage.clear(); window.location.reload() }}>Reset</button>
        </div>
      </div>
    </div>
  )
}
