import type { Page } from '../App'

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'setup', icon: 'settings', label: 'Setup' },
  { id: 'simulator', icon: 'terminal', label: 'Simulator' },
  { id: 'agents', icon: 'smart_toy', label: 'Agents' },
  { id: 'audit', icon: 'history_edu', label: 'Audit Log' },
  { id: 'settings', icon: 'tune', label: 'Settings' },
]

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function Sidebar({ currentPage, onNavigate }: Props) {
  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, width: '240px', height: '100vh',
      backgroundColor: '#080808', borderRight: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', flexDirection: 'column', paddingTop: '24px', paddingBottom: '24px',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 16px', marginBottom: '32px' }}>
        <div style={{ color: '#C08532', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em' }}>
          AI_PAY_AUTH
        </div>
        <div style={{ color: '#555', fontSize: '10px', fontFamily: 'Space Grotesk', marginTop: '2px', letterSpacing: '0.02em' }}>
          v1.0.4-stable
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(item => {
          const active = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', padding: '8px 12px',
                borderRadius: '2px', border: 'none', cursor: 'pointer',
                backgroundColor: active ? '#111111' : 'transparent',
                color: active ? '#ffffff' : '#737373',
                borderRight: active ? '2px solid #C08532' : '2px solid transparent',
                fontFamily: 'Space Grotesk', fontSize: '12px', fontWeight: 500,
                letterSpacing: '0.01em', textAlign: 'left', width: '100%',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1A1A1A'; (e.currentTarget as HTMLButtonElement).style.color = '#e5e2e1'; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#737373'; } }}
            >
              <span className="material-symbols-outlined" style={{ marginRight: '10px', fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* New Agent button */}
      <div style={{ padding: '0 16px', marginTop: 'auto' }}>
        <button
          onClick={() => onNavigate('agents')}
          style={{
            width: '100%', padding: '8px', backgroundColor: '#C08532',
            color: '#000', border: 'none', borderRadius: '2px',
            fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          + New Agent
        </button>
      </div>
    </aside>
  )
}
