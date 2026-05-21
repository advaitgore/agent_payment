import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Page } from '../App'
import { listAuditEvents } from '../lib/api'
import type { AuditEventListItem } from '../types/api'
import { tokens } from '../tokens'

interface Props {
  onNavigate: (page: Page) => void
}

const S: Record<string, CSSProperties> = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: `${tokens.spacing.md} 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md },
  header: { borderBottom: `1px solid ${tokens.colors.border}`, paddingBottom: tokens.spacing.lg, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  h1: { fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.display, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, letterSpacing: tokens.typography.letterSpacing.tight },
  sub: { fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.tertiary, letterSpacing: tokens.typography.letterSpacing.wide, marginTop: tokens.spacing.sm, textTransform: 'uppercase' },
  toolbar: { display: 'flex', alignItems: 'center', gap: tokens.spacing.sm },
  searchInput: { backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.secondary, fontSize: tokens.typography.fontSize.sm, fontFamily: tokens.typography.fontFamily.body, padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, outline: 'none', width: '200px', letterSpacing: tokens.typography.letterSpacing.normal },
  table: { backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, overflow: 'hidden' },
  th: { fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.muted, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider, padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid ${tokens.colors.borderSubtle}`, whiteSpace: 'nowrap' },
  td: { fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, color: tokens.colors.text.secondary, padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.04)`, whiteSpace: 'nowrap' },
}

function filterBtnStyle(active: boolean): CSSProperties {
  return {
    padding: `5px ${tokens.spacing.md}`,
    backgroundColor: active ? tokens.colors.accent : 'transparent',
    color: active ? '#000' : tokens.colors.text.tertiary,
    border: `1px solid ${active ? tokens.colors.accent : tokens.colors.border}`,
    fontFamily: tokens.typography.fontFamily.body,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.bold,
    letterSpacing: tokens.typography.letterSpacing.wider,
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: tokens.radius.sm,
    transition: tokens.transitions.fast,
  }
}

export default function AuditLogPage({ onNavigate: _onNavigate }: Props) {
  const [allEvents, setAllEvents] = useState<AuditEventListItem[]>([])
  const [filter, setFilter] = useState<'ALL' | 'approved' | 'denied'>('ALL')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const resp = await listAuditEvents({ limit: 100 })
        setAllEvents(resp.items)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load audit events'
        setError(msg)
        console.error('Audit load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const resp = await listAuditEvents({ limit: 100 })
      setAllEvents(resp.items)
    } finally {
      setIsRefreshing(false)
    }
  }

  const filtered = allEvents.filter(event => {
    if (filter !== 'ALL' && event.decision_status !== filter) return false
    if (search && !JSON.stringify(event).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (error) {
    return (
      <div style={S.page}>
        <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: `${tokens.spacing.lg} ${tokens.spacing.md}`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, borderRadius: tokens.radius.sm }}>
          Error loading audit events: {error}
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.h1}>Audit Log</h1>
          <p style={S.sub}>Authorization history · {isLoading ? 'Loading...' : `${allEvents.length} total events`}</p>
        </div>
        <div style={S.toolbar}>
          <input
            style={S.searchInput}
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => { e.currentTarget.style.borderColor = tokens.colors.accent }}
            onBlur={e => { e.currentTarget.style.borderColor = tokens.colors.border }}
          />
          {(['ALL', 'approved', 'denied'] as const).map(f => (
            <button key={f} style={filterBtnStyle(filter === f)} onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
              border: `1px solid ${tokens.colors.border}`,
              backgroundColor: 'transparent',
              color: tokens.colors.text.secondary,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              letterSpacing: tokens.typography.letterSpacing.wider,
              textTransform: 'uppercase',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.6 : 1,
              transition: tokens.transitions.fast,
              borderRadius: tokens.radius.sm,
            }}
          >
            {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      <div style={S.table}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Request ID', 'Timestamp', 'Action', 'Merchant', 'Amount', 'Decision', 'Details'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: tokens.colors.text.muted, padding: '32px' }}>Loading events...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: tokens.colors.text.muted, padding: '32px' }}>No events match current filter</td></tr>
            )}
            {!isLoading && filtered.map((event, i) => (
              <tr key={event.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ ...S.td, color: tokens.colors.accent, fontWeight: tokens.typography.fontWeight.semibold }}>{event.id.substring(0, 12)}</td>
                <td style={{ ...S.td, color: tokens.colors.text.tertiary }}>{new Date(event.created_at).toLocaleString()}</td>
                <td style={S.td}>{event.action}</td>
                <td style={S.td}>{event.merchant || '-'}</td>
                <td style={{ ...S.td, fontWeight: tokens.typography.fontWeight.semibold }}>{event.amount ? `$${event.amount.toFixed(2)}` : '-'}</td>
                <td style={S.td}>
                  {event.decision_status ? (
                    <span style={{
                      padding: '2px 8px', borderRadius: tokens.radius.sm, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.wider,
                      backgroundColor: event.decision_status === 'approved' ? tokens.colors.successBg : tokens.colors.errorBg,
                      color: event.decision_status === 'approved' ? tokens.colors.success : tokens.colors.error,
                      border: `1px solid ${event.decision_status === 'approved' ? tokens.colors.successBorder : tokens.colors.errorBorder}`,
                    }}>
                      {event.decision_status.toUpperCase()}
                    </span>
                  ) : (
                    <span style={{ color: tokens.colors.text.tertiary }}>-</span>
                  )}
                </td>
                <td style={{ ...S.td, color: tokens.colors.text.tertiary, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {event.trace_id?.substring(0, 8) || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.muted, textAlign: 'right' }}>
        Showing {filtered.length} of {allEvents.length} events
      </div>
    </div>
  )
}
