import { tokens } from '../tokens'

interface Props {
  title: string
  subtitle?: string
  userEmail?: string
  onLogout?: () => void
}

export default function TopBar({ title, subtitle, userEmail, onLogout }: Props) {
  return (
    <header style={{
      position: 'fixed', top: 0, right: 0, width: 'calc(100% - 240px)',
      height: '56px', backgroundColor: `rgba(${parseInt(tokens.colors.background.slice(1,3), 16)},${parseInt(tokens.colors.background.slice(3,5), 16)},${parseInt(tokens.colors.background.slice(5,7), 16)},0.9)`, backdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${tokens.colors.border}`, zIndex: 40,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: `0 ${tokens.spacing.xl}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
        <span style={{ color: tokens.colors.text.primary, fontFamily: tokens.typography.fontFamily.body, fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.lg, letterSpacing: tokens.typography.letterSpacing.wide, textTransform: 'uppercase' }}>{title}</span>
        {subtitle && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: tokens.colors.text.primary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, letterSpacing: tokens.typography.letterSpacing.wider, textTransform: 'uppercase', fontWeight: tokens.typography.fontWeight.bold }}>{subtitle}</span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg }}>
        {userEmail && (
          <>
            <span style={{ color: '#9e8e7e', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, letterSpacing: tokens.typography.letterSpacing.wider, textTransform: 'uppercase' }}>
              {userEmail}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{ padding: `${tokens.spacing.sm} ${tokens.spacing.sm}`, backgroundColor: 'transparent', border: `1px solid rgba(255,255,255,0.2)`, color: tokens.colors.text.secondary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, letterSpacing: tokens.typography.letterSpacing.widest, textTransform: 'uppercase', cursor: 'pointer', transition: tokens.transitions.fast }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = tokens.colors.text.primary; el.style.color = tokens.colors.text.primary }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(255,255,255,0.2)'; el.style.color = tokens.colors.text.secondary }}
              >
                Logout
              </button>
            )}
          </>
        )}
      </div>
    </header>
  )
}
