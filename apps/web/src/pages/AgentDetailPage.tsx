// AgentDetailPage — standalone, no react-router-dom dependency
import type { Page } from '../App'

interface Props {
  onNavigate: (page: Page) => void
}

export default function AgentDetailPage({ onNavigate }: Props) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 0' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Agent Detail</h1>
          <p style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' }}>View and manage a specific agent</p>
        </div>
        <button
          onClick={() => onNavigate('agents')}
          style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}
        >
          ← Back to Agents
        </button>
      </div>
      <div style={{ marginTop: '16px', backgroundColor: '#111111', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', color: '#aaa', fontFamily: 'Inter', fontSize: '13px' }}>
        Select an agent from the Agents page to view details.
      </div>
    </div>
  )
}
