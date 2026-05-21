import { useEffect, useState } from 'react'
import type { Page } from '../App'
import { listAgents, rotateAgentKey, getSpendingSummary, listMandates } from '../lib/api'
import type { AgentRead, SpendingSummary, MandateRead } from '../types/api'
import { getStoredAgentId } from '../lib/storage'
import { tokens } from '../tokens'

interface Props { onNavigate?: (page: Page) => void }

export default function AgentsPage({ onNavigate: _onNavigate }: Props) {
  const [agents, setAgents] = useState<AgentRead[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [spendingSummaries, setSpendingSummaries] = useState<Record<string, SpendingSummary>>({})
  const [mandates, setMandates] = useState<Record<string, MandateRead[]>>({})
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setIsLoading(true)
        const fetchedAgents = await listAgents()
        setAgents(fetchedAgents)

        const storedId = getStoredAgentId()
        if (storedId && fetchedAgents.some(a => a.id === storedId)) {
          setSelectedAgentId(storedId)
        } else if (fetchedAgents.length > 0) {
          setSelectedAgentId(fetchedAgents[0].id)
        }

        const summaries: Record<string, SpendingSummary> = {}
        const mandatesList: Record<string, MandateRead[]> = {}
        for (const agent of fetchedAgents) {
          try {
            const summary = await getSpendingSummary(agent.id)
            summaries[agent.id] = summary
          } catch (_err) {}
          try {
            const agentMandates = await listMandates(agent.id)
            mandatesList[agent.id] = agentMandates
          } catch (_err) {}
        }
        setSpendingSummaries(summaries)
        setMandates(mandatesList)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load agents')
      } finally {
        setIsLoading(false)
      }
    }
    loadAgents()
  }, [])

  const selectedAgent = agents.find(a => a.id === selectedAgentId)
  const selectedSummary = selectedAgentId ? spendingSummaries[selectedAgentId] : null
  const selectedMandates = selectedAgentId ? mandates[selectedAgentId] : []

  const handleCopy = () => {
    if (selectedAgent?.api_key) {
      navigator.clipboard.writeText(selectedAgent.api_key).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRotateKey = async () => {
    if (!selectedAgentId) {
      setErrorMessage('No agent selected.')
      return
    }
    setIsRotating(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const updated = await rotateAgentKey(selectedAgentId)
      setAgents(agents.map(a => a.id === selectedAgentId ? updated : a))
      setStatusMessage('API key rotated successfully.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to rotate API key.')
    } finally {
      setIsRotating(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const fetchedAgents = await listAgents()
      setAgents(fetchedAgents)
      const summaries: Record<string, SpendingSummary> = {}
      const mandatesList: Record<string, MandateRead[]> = {}
      for (const agent of fetchedAgents) {
        try {
          const summary = await getSpendingSummary(agent.id)
          summaries[agent.id] = summary
        } catch (_err) {}
        try {
          const agentMandates = await listMandates(agent.id)
          mandatesList[agent.id] = agentMandates
        } catch (_err) {}
      }
      setSpendingSummaries(summaries)
      setMandates(mandatesList)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `${tokens.spacing.md} 0` }}>
        <div style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, color: tokens.colors.text.tertiary }}>Loading agents...</div>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `${tokens.spacing.md} 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
        <div style={{ borderBottom: `1px solid ${tokens.colors.border}`, paddingBottom: tokens.spacing.lg }}>
          <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.display, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, letterSpacing: tokens.typography.letterSpacing.tight }}>Agents</h1>
          <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.tertiary, letterSpacing: tokens.typography.letterSpacing.wide, marginTop: tokens.spacing.sm, textTransform: 'uppercase' }}>
            No agents configured
          </p>
        </div>
        <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: '32px 16px', textAlign: 'center' }}>
          <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, color: tokens.colors.text.tertiary }}>Create your first agent in the Setup section.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `${tokens.spacing.md} 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
      {/* Agent selector and header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${tokens.colors.border}`, paddingBottom: tokens.spacing.lg }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md, marginBottom: tokens.spacing.sm }}>
            {selectedAgent && (
              <>
                <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.display, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, letterSpacing: tokens.typography.letterSpacing.tight }}>{selectedAgent.name}</h1>
                <span style={{ padding: '2px 8px', backgroundColor: tokens.colors.successBg, color: tokens.colors.success, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, borderRadius: tokens.radius.sm, border: `1px solid ${tokens.colors.successBorder}` }}>ACTIVE</span>
              </>
            )}
          </div>
          {selectedAgent && (
            <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.tertiary, letterSpacing: tokens.typography.letterSpacing.wide, textTransform: 'uppercase' }}>
              AGENT_ID: <span style={{ color: '#aaa' }}>{selectedAgent.id.substring(0, 16)}...</span>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: tokens.spacing.sm, alignItems: 'center' }}>
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
          {agents.length > 1 && (
            <select
              value={selectedAgentId || ''}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              style={{
                padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`,
                color: tokens.colors.text.secondary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer'
              }}
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main content */}
      {selectedAgent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: tokens.spacing.md }}>
            {/* API Key Management */}
            <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: tokens.spacing.lg, display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider }}>API Key Management</span>
                <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.muted }}>CREATED: {new Date(selectedAgent.created_at).toLocaleString()}</span>
              </div>
              <div>
                <div style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider, marginBottom: tokens.spacing.sm }}>SECRET_KEY</div>
                <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
                  <div style={{ flex: 1, backgroundColor: tokens.colors.background, border: `1px solid ${tokens.colors.border}`, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, color: tokens.colors.text.primary, letterSpacing: tokens.typography.letterSpacing.widest, fontWeight: tokens.typography.fontWeight.bold }}>
                      {showKey && selectedAgent.api_key ? selectedAgent.api_key : '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '}
                    </span>
                    <button onClick={() => setShowKey(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tokens.colors.accent, display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{showKey ? 'visibility_off' : 'visibility'}</span>
                      {showKey ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  <button onClick={handleCopy} style={{ padding: '10px 12px', backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, color: copied ? tokens.colors.success : tokens.colors.text.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{copied ? 'check' : 'content_copy'}</span>
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 'auto', borderTop: `1px solid ${tokens.colors.borderSubtle}`, paddingTop: tokens.spacing.lg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.md, color: '#514537', maxWidth: '280px' }}>Rotating your key will immediately invalidate the existing token. All active sessions will terminate.</p>
                <button
                  onClick={handleRotateKey}
                  disabled={isRotating}
                  style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, padding: '7px 14px', backgroundColor: 'transparent', border: '1px solid #514537', color: '#9e8e7e', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, letterSpacing: tokens.typography.letterSpacing.wider, textTransform: 'uppercase', cursor: 'pointer', borderRadius: tokens.radius.sm, transition: tokens.transitions.fast }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = tokens.colors.text.primary; el.style.color = tokens.colors.text.primary }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#514537'; el.style.color = '#9e8e7e' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sync</span>
                  {isRotating ? 'Rotating...' : 'Rotate Key'}
                </button>
              </div>
            </div>

            {/* Spending Summary */}
            {selectedSummary && (
              <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, overflow: 'hidden' }}>
                <div style={{ padding: `10px ${tokens.spacing.lg}`, borderBottom: `1px solid ${tokens.colors.border}`, backgroundColor: 'rgba(26,26,26,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider }}>Spending Summary</span>
                </div>
                <div style={{ padding: tokens.spacing.lg, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                  <div>
                    <span style={{ display: 'block', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wide }}>Total Spent</span>
                    <span style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: '22px', fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary }}>${selectedSummary.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wide }}>Requests</span>
                    <span style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: '22px', fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary }}>{selectedSummary.total_requests}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wide }}>Approval Rate</span>
                    <span style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: '22px', fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.success }}>
                      {selectedSummary.total_requests > 0 ? ((selectedSummary.approved / selectedSummary.total_requests) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mandates */}
            {selectedMandates && selectedMandates.length > 0 && (
              <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, overflow: 'hidden' }}>
                <div style={{ padding: `10px ${tokens.spacing.lg}`, borderBottom: `1px solid ${tokens.colors.border}`, backgroundColor: 'rgba(26,26,26,0.5)' }}>
                  <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider }}>Spending Limits</span>
                </div>
                <div style={{ padding: tokens.spacing.lg }}>
                  {selectedMandates.map((mandate) => (
                    <div key={mandate.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', paddingBottom: tokens.spacing.lg }}>
                      <div>
                        <span style={{ display: 'block', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wide }}>Max Per Transaction</span>
                        <span style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: '22px', fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary }}>${mandate.max_per_transaction.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wide }}>Status</span>
                        <span style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: '22px', fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.success }}>Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {statusMessage && (
            <div style={{ backgroundColor: tokens.colors.successBg, border: `1px solid ${tokens.colors.successBorder}`, color: tokens.colors.success, padding: `10px ${tokens.spacing.md}`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, letterSpacing: tokens.typography.letterSpacing.wide }}>
              {statusMessage}
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: `10px ${tokens.spacing.md}`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, letterSpacing: tokens.typography.letterSpacing.wide }}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}
