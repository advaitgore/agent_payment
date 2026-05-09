import { useState } from 'react'
import type { Page } from '../App'

interface Props { onNavigate?: (page: Page) => void }

export default function AgentsPage({ onNavigate: _onNavigate }: Props) {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const apiKey = 'api_key_redacted_replace_after_provisioning'

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const EVENTS = [
    { time: '14:22:01', event: 'AUTH_SUCCESS', detail: '$42.00 → STRIPE', color: '#4ae176' },
    { time: '14:18:45', event: 'AUTH_SUCCESS', detail: '$12.50 → STRIPE', color: '#4ae176' },
    { time: '13:55:12', event: 'AUTH_DENIED', detail: 'EXCEED_VOL_LIMIT', color: '#ffb4ab' },
    { time: '12:10:30', event: 'KEY_ROTATED', detail: 'USER_INITIATED', color: '#e5e2e1' },
  ]

  const HEALTH = [28, 46, 33, 72, 55]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Agent header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h1 style={{ fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>trading-bot-alpha-v2</h1>
            <span style={{ padding: '2px 8px', backgroundColor: 'rgba(0,167,75,0.1)', color: '#4ae176', fontFamily: 'Space Grotesk', fontSize: '10px', borderRadius: '2px', border: '1px solid rgba(74,225,118,0.2)' }}>ACTIVE</span>
          </div>
          <p style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            AGENT_ID: <span style={{ color: '#aaa' }}>0x7472_6164_696e_675f_626f_74</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '8px 16px', backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}>
            Deactivate
          </button>
          <button style={{ padding: '8px 16px', backgroundColor: '#C08532', color: '#000', border: 'none', fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}>
            Edit Config
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '12px' }}>
        {/* API Key Management */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>API Key Management</span>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#555' }}>CREATED: 2023.10.24 14:02 UTC</span>
          </div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>SECRET_KEY</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '12px', color: '#fff', letterSpacing: '0.15em', fontWeight: 700 }}>
                  {showKey ? apiKey : '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '}
                </span>
                <button onClick={() => setShowKey(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C08532', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Space Grotesk', fontSize: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{showKey ? 'visibility_off' : 'visibility'}</span>
                  {showKey ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <button onClick={handleCopy} style={{ padding: '10px 12px', backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#4ae176' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{copied ? 'check' : 'content_copy'}</span>
              </button>
            </div>
          </div>
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Inter', fontSize: '12px', color: '#514537', maxWidth: '280px' }}>Rotating your key will immediately invalidate the existing token. All active sessions will terminate.</p>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: 'transparent', border: '1px solid #514537', color: '#9e8e7e', fontFamily: 'Space Grotesk', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px', transition: 'all 0.15s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#fff'; el.style.color = '#fff' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#514537'; el.style.color = '#9e8e7e' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sync</span>
              Rotate Key
            </button>
          </div>
        </div>

        {/* System Health */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>System Health</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px' }}>
            {HEALTH.map((h, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: `rgba(74,225,118,${h / 100})`, height: `${h}%`, borderRadius: '1px' }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <span style={{ display: 'block', fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Latency</span>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '22px', fontWeight: 700, color: '#fff' }}>24ms</span>
            </div>
            <div>
              <span style={{ display: 'block', fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Success Rate</span>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '22px', fontWeight: 700, color: '#4ae176' }}>99.98%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandate Summary */}
      <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(26,26,26,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Mandate Summary</span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#555' }}>lock</span>
        </div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {/* Spending Limits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#C08532' }}>account_balance_wallet</span>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Spending Limits</span>
            </div>
            <div style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Monthly cap</span>
                <span style={{ fontFamily: 'Inter', fontSize: '22px', fontWeight: 600, color: '#fff' }}>$500.00</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#080808', height: '3px', borderRadius: '1px' }}>
                <div style={{ width: '35%', height: '100%', backgroundColor: '#C08532', borderRadius: '1px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373' }}>USED: $175.40</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#fff' }}>REMAINING: $324.60</span>
              </div>
            </div>
          </div>
          {/* Allowed Merchants */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#C08532' }}>verified_user</span>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Allowed Merchants</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['Stripe', 'AWS', 'GitHub'].map(m => (
                <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#737373' }}>credit_card</span>
                    </div>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: '12px', color: '#fff' }}>{m}</span>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4ae176' }}>check_circle</span>
                </div>
              ))}
              <button style={{ width: '100%', padding: '8px', border: '1px dashed rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#737373', fontFamily: 'Space Grotesk', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = '#fff'; el.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = '#737373'; el.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                + Add Merchant
              </button>
            </div>
          </div>
          {/* Active Policies */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#C08532' }}>policy</span>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Policies</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'POL_091_ENFORCE_GEO', desc: 'Transaction origin must match US-East.' },
                { id: 'POL_212_MANDATE_ID', desc: 'Include mandate hash in metadata.' },
              ].map(p => (
                <div key={p.id} style={{ padding: '10px 12px', backgroundColor: '#080808', borderLeft: '2px solid #C08532', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontFamily: 'Space Grotesk', fontSize: '10px', color: '#fff', fontWeight: 500 }}>{p.id}</span>
                  <span style={{ display: 'block', fontFamily: 'Inter', fontSize: '11px', color: '#737373', marginTop: '3px' }}>{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events + Security */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: '12px' }}>
        {/* Events */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px' }}>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '12px' }}>Recent Events</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {EVENTS.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < EVENTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontFamily: 'Space Grotesk', fontSize: '11px' }}>
                <span style={{ color: '#555', minWidth: '55px' }}>{e.time}</span>
                <span style={{ color: e.color, fontWeight: 500, minWidth: '100px' }}>{e.event}</span>
                <span style={{ color: '#737373' }}>{e.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security posture */}
        <div style={{ background: 'linear-gradient(135deg, #111111 0%, #080808 100%)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '120px', height: '120px', position: 'relative', flexShrink: 0 }}>
            <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#222" strokeWidth="1" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#C08532" strokeDasharray="85, 100" strokeWidth="1.5" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Inter', fontSize: '22px', fontWeight: 600, color: '#fff', lineHeight: 1 }}>85%</span>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '9px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Security Score</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Security Overview</span>
            <p style={{ fontFamily: 'Inter', fontSize: '12px', color: '#737373', maxWidth: '340px', lineHeight: 1.6 }}>This agent is operating under a high-security mandate with 2FA required for key rotations and strict merchant whitelisting enforced at the kernel level.</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Encrypted', 'Isolated', 'Hardened'].map(tag => (
                <span key={tag} style={{ padding: '3px 8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
