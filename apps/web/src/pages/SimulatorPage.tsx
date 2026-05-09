import type { Page } from '../App'

interface Props {
  onNavigate: (page: Page) => void
}

export default function SimulatorPage({ onNavigate }: Props) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 0' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <h1 style={{ fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff' }}>Simulator</h1>
        <p style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373' }}>
          Run authorization scenarios against your mandates
        </p>
      </div>
      <div style={{ marginTop: '16px', backgroundColor: '#111111', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#aaa' }}>
          Simulator UI placeholder - configure test payloads and run quick simulations.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#C08532', border: 'none', color: '#000', cursor: 'pointer' }}
        >
          Back
        </button>
      </div>
    </div>
  )
}
