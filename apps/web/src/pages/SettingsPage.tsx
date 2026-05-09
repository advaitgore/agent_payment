import type { Page } from '../App'

interface Props { onNavigate: (page: Page) => void }

export default function SettingsPage({ onNavigate }: Props) {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '8px 0' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <h1 style={{ fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff' }}>Settings</h1>
        <p style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373' }}>Organization and account settings</p>
      </div>
      <div style={{ marginTop: '16px', backgroundColor: '#111111', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#aaa' }}>Settings placeholder — organization profile, billing, and integrations.</p>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button onClick={() => onNavigate('dashboard')} style={{ padding: '8px 12px', backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>Back</button>
        </div>
      </div>
    </div>
  )
}
