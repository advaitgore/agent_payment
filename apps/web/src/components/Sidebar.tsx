import type { Page } from '../App'
import { tokens } from '../tokens'

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'setup', icon: 'settings', label: 'Setup' },
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
      backgroundColor: tokens.colors.background, borderRight: `1px solid ${tokens.colors.border}`,
      display: 'flex', flexDirection: 'column', paddingTop: tokens.spacing.xl, paddingBottom: tokens.spacing.xl,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: `0 ${tokens.spacing.lg}`, marginBottom: tokens.spacing.xxl }}>
        <div style={{ color: tokens.colors.accent, fontFamily: tokens.typography.fontFamily.body, fontWeight: tokens.typography.fontWeight.bold, fontSize: tokens.typography.fontSize.xl, letterSpacing: tokens.typography.letterSpacing.tight }}>
          AI_PAY_AUTH
        </div>
        <div style={{ color: tokens.colors.text.muted, fontSize: tokens.typography.fontSize.xs, fontFamily: tokens.typography.fontFamily.body, marginTop: '2px', letterSpacing: tokens.typography.letterSpacing.normal }}>
          v1.0.4-stable
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: `0 ${tokens.spacing.sm}`, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(item => {
          const active = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                borderRadius: tokens.radius.sm, border: 'none', cursor: 'pointer',
                backgroundColor: active ? tokens.colors.surface : 'transparent',
                color: active ? tokens.colors.text.primary : tokens.colors.text.tertiary,
                borderRight: active ? `2px solid ${tokens.colors.accent}` : '2px solid transparent',
                fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium,
                letterSpacing: tokens.typography.letterSpacing.normal, textAlign: 'left', width: '100%',
                transition: tokens.transitions.fast,
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.colors.surfaceAlt; (e.currentTarget as HTMLButtonElement).style.color = tokens.colors.text.secondary; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = tokens.colors.text.tertiary; } }}
            >
              <span className="material-symbols-outlined" style={{ marginRight: tokens.spacing.lg, fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* New Agent button */}
      <div style={{ padding: `0 ${tokens.spacing.lg}`, marginTop: 'auto' }}>
        <button
          onClick={() => onNavigate('agents')}
          style={{
            width: '100%', padding: tokens.spacing.sm, backgroundColor: tokens.colors.accent,
            color: '#000', border: 'none', borderRadius: tokens.radius.sm,
            fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
            letterSpacing: tokens.typography.letterSpacing.widest, textTransform: 'uppercase', cursor: 'pointer',
            transition: tokens.transitions.fast,
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
