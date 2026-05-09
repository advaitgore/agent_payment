import type { Page } from '../App'

interface Props {
  onNavigate: (page: Page) => void
}

const KPI_CARDS = [
  { label: 'TOTAL AGENTS', value: '12', sub: '+2 this week', icon: 'smart_toy', color: '#C08532' },
  { label: 'AUTH REQUESTS (24H)', value: '1,284', sub: 'UP 8.3% vs yesterday', icon: 'bolt', color: '#4ae176' },
  { label: 'APPROVAL RATE', value: '97.2%', sub: 'DOWN 0.4% vs last week', icon: 'check_circle', color: '#4ae176' },
  { label: 'TOTAL SPEND (30D)', value: '$8,402', sub: '$1,598 remaining', icon: 'account_balance_wallet', color: '#C08532' },
]

const RECENT = [
  { time: '14:22:01', event: 'AUTH_SUCCESS', detail: '$42.00 to STRIPE', color: '#4ae176' },
  { time: '14:18:45', event: 'AUTH_SUCCESS', detail: '$12.50 to STRIPE', color: '#4ae176' },
  { time: '13:55:12', event: 'AUTH_DENIED', detail: 'EXCEED_VOL_LIMIT', color: '#ffb4ab' },
  { time: '13:40:00', event: 'KEY_ROTATED', detail: 'USER_INITIATED', color: '#e5e2e1' },
  { time: '12:10:30', event: 'MANDATE_UPDATED', detail: 'LIMIT +$200', color: '#737373' },
]

const HEALTH = [32, 45, 21, 70, 58]

export default function DashboardPage({ onNavigate }: Props) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373', letterSpacing: '0.04em', marginTop: '4px', textTransform: 'uppercase' }}>
            Authorization Overview · Live
          </p>
        </div>
        <button
          onClick={() => onNavigate('simulator')}
          style={{ padding: '8px 16px', backgroundColor: '#C08532', color: '#000', border: 'none', borderRadius: '2px', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Run Simulator
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {KPI_CARDS.map((k) => (
          <div key={k.label} style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: k.color }}>{k.icon}</span>
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{k.value}</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#555' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Events</span>
            <button onClick={() => onNavigate('audit')} style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#C08532', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}>
              View all -&gt;
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {RECENT.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < RECENT.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#555', minWidth: '60px' }}>{r.time}</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: r.color, minWidth: '120px', fontWeight: 500 }}>{r.event}</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373' }}>{r.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>System Health</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px' }}>
            {HEALTH.map((h, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: `rgba(74,225,118,${h / 100})`, height: `${h}%`, borderRadius: '1px' }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[{ label: 'Latency', value: '24ms', color: '#fff' }, { label: 'Success Rate', value: '99.98%', color: '#4ae176' }].map((m) => (
              <div key={m.label}>
                <span style={{ display: 'block', fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '20px', fontWeight: 700, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => onNavigate('agents')} style={{ width: '100%', padding: '7px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px', transition: 'all 0.15s' }}>
              Manage Agents
            </button>
            <button onClick={() => onNavigate('audit')} style={{ width: '100%', padding: '7px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px', transition: 'all 0.15s' }}>
              View Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
