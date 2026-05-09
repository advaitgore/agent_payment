import { useEffect, useState } from 'react';
import type { Page } from '../App';

interface Props {
  onNavigate: (page: Page) => void
}

const MOCK = [
  { id: 'REQ_001', time: '2026-05-09 14:22:01', agent: 'trading-bot-alpha-v2', merchant: 'Stripe', amount: '$42.00', decision: 'APPROVED', reason: 'Within mandate limits' },
  { id: 'REQ_002', time: '2026-05-09 14:18:45', agent: 'trading-bot-alpha-v2', merchant: 'Stripe', amount: '$12.50', decision: 'APPROVED', reason: 'Within mandate limits' },
  { id: 'REQ_003', time: '2026-05-09 13:55:12', agent: 'trading-bot-alpha-v2', merchant: 'AWS', amount: '$850.00', decision: 'DENIED', reason: 'Exceeds monthly volume limit' },
  { id: 'REQ_004', time: '2026-05-09 13:40:00', agent: 'trading-bot-alpha-v2', merchant: 'GitHub', amount: '$21.00', decision: 'APPROVED', reason: 'Within mandate limits' },
  { id: 'REQ_005', time: '2026-05-09 12:10:30', agent: 'trading-bot-alpha-v2', merchant: 'AWS', amount: '$199.00', decision: 'APPROVED', reason: 'Within mandate limits' },
  { id: 'REQ_006', time: '2026-05-09 11:05:00', agent: 'trading-bot-alpha-v2', merchant: 'Stripe', amount: '$9.99', decision: 'APPROVED', reason: 'Within mandate limits' },
  { id: 'REQ_007', time: '2026-05-09 10:44:22', agent: 'trading-bot-alpha-v2', merchant: 'Unknown', amount: '$5000.00', decision: 'DENIED', reason: 'Merchant not in allowlist' },
];

export default function AuditLogPage({ onNavigate: _onNavigate }: Props) {
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'DENIED'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => { document.title = 'Audit Log – AgentPay'; }, []);

  const filtered = MOCK.filter(r => {
    if (filter !== 'ALL' && r.decision !== filter) return false;
    if (search && !JSON.stringify(r).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const S: Record<string, React.CSSProperties> = {
    page: { maxWidth: '1200px', margin: '0 auto', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' },
    header: { borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    h1: { fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' },
    sub: { fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373', letterSpacing: '0.04em', marginTop: '4px', textTransform: 'uppercase' },
    toolbar: { display: 'flex', alignItems: 'center', gap: '8px' },
    filterBtn: (active: boolean): React.CSSProperties => ({ padding: '5px 12px', backgroundColor: active ? '#C08532' : 'transparent', color: active ? '#000' : '#737373', border: `1px solid ${active ? '#C08532' : 'rgba(255,255,255,0.1)'}`, fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px', transition: 'all 0.15s' }),
    searchInput: { backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', fontSize: '11px', fontFamily: 'Space Grotesk', padding: '6px 12px', outline: 'none', width: '200px', letterSpacing: '0.03em' },
    table: { backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' },
    th: { fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 14px', textAlign: 'left' as const, borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' as const },
    td: { fontFamily: 'Space Grotesk', fontSize: '12px', color: '#e5e2e1', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' as const },
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.h1}>Audit Log</h1>
          <p style={S.sub as React.CSSProperties}>Authorization history · {MOCK.length} total events</p>
        </div>
        <div style={S.toolbar}>
          <input style={S.searchInput} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            onFocus={e => { e.currentTarget.style.borderColor = '#C08532' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          {(['ALL', 'APPROVED', 'DENIED'] as const).map(f => (
            <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div style={S.table}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Request ID', 'Timestamp', 'Agent', 'Merchant', 'Amount', 'Decision', 'Reason'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#555', padding: '32px' }}>No events match current filter</td></tr>
            )}
            {filtered.map((r, i) => (
              <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ ...S.td, color: '#C08532', fontWeight: 600 }}>{r.id}</td>
                <td style={{ ...S.td, color: '#737373' }}>{r.time}</td>
                <td style={S.td}>{r.agent}</td>
                <td style={S.td}>{r.merchant}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{r.amount}</td>
                <td style={S.td}>
                  <span style={{ padding: '2px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', backgroundColor: r.decision === 'APPROVED' ? 'rgba(74,225,118,0.1)' : 'rgba(255,180,171,0.1)', color: r.decision === 'APPROVED' ? '#4ae176' : '#ffb4ab', border: `1px solid ${r.decision === 'APPROVED' ? 'rgba(74,225,118,0.2)' : 'rgba(255,180,171,0.2)'}` }}>
                    {r.decision}
                  </span>
                </td>
                <td style={{ ...S.td, color: '#737373', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#555', textAlign: 'right' }}>
        Showing {filtered.length} of {MOCK.length} events
      </div>
    </div>
  )
}
