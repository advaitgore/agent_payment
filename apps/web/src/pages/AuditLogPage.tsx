import type { Page } from '../App'

interface Props { onNavigate: (page: Page) => void }

const SAMPLE = [
  { time: '2023-10-24T14:22:01Z', actor: 'agent:trading-bot', action: 'authorize', result: 'approved', detail: '$42.00 → STRIPE' },
  { time: '2023-10-24T13:55:12Z', actor: 'agent:trading-bot', action: 'authorize', result: 'denied', detail: 'EXCEED_VOL_LIMIT' },
]

export default function AuditLogPage({ onNavigate }: Props) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 0' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <h1 style={{ fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff' }}>Audit Log</h1>
        <p style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373' }}>Immutable events and decisions</p>
      </div>
      <div style={{ marginTop: '16px', backgroundColor: '#111111', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SAMPLE.map((s, i) => (
            <div key={i} style={{ padding: '10px', backgroundColor: '#0b0b0b', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#fff', fontWeight: 600 }}>{s.action} · {s.result}</div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#737373' }}>{s.detail} — {s.actor} · {s.time}</div>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate('dashboard')} style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}>Back</button>
      </div>
    </div>
  )
}
