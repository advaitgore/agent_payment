interface Props {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: Props) {
  return (
    <header style={{
      position: 'fixed', top: 0, right: 0, width: 'calc(100% - 240px)',
      height: '56px', backgroundColor: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 40,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</span>
        {subtitle && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: '#fff', fontFamily: 'Space Grotesk', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>{subtitle}</span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#737373' }}>search</span>
          <input
            placeholder="SEARCH..."
            style={{
              backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e5e2e1', fontSize: '10px', fontFamily: 'Space Grotesk',
              padding: '6px 12px 6px 28px', width: '200px', outline: 'none',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#C08532' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
        </div>
        {/* Icons */}
        {['notifications', 'history', 'help_outline'].map(icon => (
          <span key={icon} className="material-symbols-outlined" style={{ fontSize: '20px', color: '#737373', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#737373' }}
          >{icon}</span>
        ))}
        {/* Avatar */}
        <div style={{ width: '32px', height: '32px', borderRadius: '2px', backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#737373' }}>account_circle</span>
        </div>
      </div>
    </header>
  )
}
 
