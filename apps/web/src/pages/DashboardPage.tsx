import { useEffect, useState } from 'react'
import type { Page } from '../App'
import { listAgents, listAuditEvents, getSpendingSummary } from '../lib/api'
import type { AgentRead, AuditEventListItem, SpendingSummary } from '../types/api'
import { tokens } from '../tokens'

interface Props {
  onNavigate: (page: Page) => void
}

export default function DashboardPage({ onNavigate }: Props) {
  const [agentCount, setAgentCount] = useState(0)
  const [recentEvents, setRecentEvents] = useState<AuditEventListItem[]>([])
  const [totalSpend, setTotalSpend] = useState('$0.00')
  const [approvalRate, setApprovalRate] = useState('0%')
  const [totalRequests, setTotalRequests] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        // Get organization ID from first agent (for now, we fetch all agents)
        const agents = await listAgents()
        setAgentCount(agents.length)

        // Get recent audit events
        const auditResp = await listAuditEvents({ limit: 5 })
        setRecentEvents(auditResp.items)

        // Get spending summary (use first agent if available)
        if (agents.length > 0) {
          try {
            const summary = await getSpendingSummary(agents[0].id)
            const spent = summary.total_spent
            setTotalSpend(`$${spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
            setTotalRequests(summary.total_requests)
            
            // Calculate approval rate
            const total = summary.approved + summary.denied + summary.needs_review
            const rate = total > 0 ? ((summary.approved / total) * 100).toFixed(1) : '0.0'
            setApprovalRate(`${rate}%`)
          } catch (_err) {
            // If no spending summary available, use defaults
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to load dashboard data'
        setLoadError(msg)
        console.error('Dashboard load error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        listAgents().then(agents => {
          setAgentCount(agents.length)
          if (agents.length > 0) {
            return getSpendingSummary(agents[0].id).then(summary => {
              const spent = summary.total_spent
              setTotalSpend(`$${spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
              setTotalRequests(summary.total_requests)
              const total = summary.approved + summary.denied + summary.needs_review
              const rate = total > 0 ? ((summary.approved / total) * 100).toFixed(1) : '0.0'
              setApprovalRate(`${rate}%`)
            })
          }
        }),
        listAuditEvents({ limit: 5 }).then(auditResp => setRecentEvents(auditResp.items))
      ])
    } finally {
      setIsRefreshing(false)
    }
  }

  const KPI_CARDS = [
    { label: 'TOTAL AGENTS', value: String(agentCount), sub: agentCount ? `${agentCount} active` : 'No agents yet', icon: 'smart_toy', color: tokens.colors.accent },
    { label: 'AUTH REQUESTS (ALL)', value: String(totalRequests), sub: totalRequests ? 'View audit log for details' : 'No requests yet', icon: 'bolt', color: tokens.colors.success },
    { label: 'APPROVAL RATE', value: approvalRate, sub: 'Based on evaluated requests', icon: 'check_circle', color: tokens.colors.success },
    { label: 'TOTAL SPEND', value: totalSpend, sub: 'All time', icon: 'account_balance_wallet', color: tokens.colors.accent },
  ]

  if (loadError) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `${tokens.spacing.md} 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
        <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: `${tokens.spacing.lg} ${tokens.spacing.md}`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, borderRadius: tokens.radius.sm }}>
          Error loading dashboard: {loadError}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `${tokens.spacing.md} 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
      <div style={{ borderBottom: `1px solid ${tokens.colors.border}`, paddingBottom: tokens.spacing.lg, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.display, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, letterSpacing: tokens.typography.letterSpacing.tight }}>Dashboard</h1>
          <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.tertiary, letterSpacing: tokens.typography.letterSpacing.wide, marginTop: tokens.spacing.sm, textTransform: 'uppercase' }}>
            Authorization Overview · {isLoading ? 'Loading...' : 'Live'}
          </p>
        </div>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing.md }}>
        {KPI_CARDS.map((k) => (
          <div key={k.label} style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: tokens.spacing.lg, display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider }}>{k.label}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: k.color }}>{k.icon}</span>
            </div>
            <div style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: '28px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text.primary, letterSpacing: tokens.typography.letterSpacing.tight }}>{k.value}</div>
            <div style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.muted }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: tokens.spacing.md }}>
        <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: tokens.spacing.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.lg }}>
            <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider }}>Recent Events</span>
            <button onClick={() => onNavigate('audit')} style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.accent, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: tokens.typography.letterSpacing.wide }}>
              View all -&gt;
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {recentEvents.length === 0 ? (
              <div style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.muted, padding: '10px 0' }}>No recent events</div>
            ) : (
              recentEvents.map((event, i) => {
                const time = new Date(event.created_at).toLocaleTimeString()
                const statusColor = event.decision_status === 'approved' ? tokens.colors.success : event.decision_status === 'denied' ? tokens.colors.error : tokens.colors.text.secondary
                const detail = event.merchant ? `${event.amount ? '$' + event.amount : 'N/A'} to ${event.merchant}` : event.action
                return (
                  <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md, padding: '10px 0', borderBottom: i < recentEvents.length - 1 ? `1px solid ${tokens.colors.borderSubtle}` : 'none' }}>
                    <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.muted, minWidth: '60px' }}>{time}</span>
                    <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: statusColor, minWidth: '120px', fontWeight: tokens.typography.fontWeight.medium }}>{event.decision_status?.toUpperCase() || event.action}</span>
                    <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.tertiary }}>{detail}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
